import { IAttachmentService } from '../../domain/interfaces/services/attachment.service.interface';
import { IAttachmentRepository } from '../../domain/interfaces/repositories/attachment.repository.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { IAuditLogRepository } from '../../domain/interfaces/repositories/audit-log.repository.interface';
import { FileStorageService } from '../../infrastructure/storage/file-storage.service';
import { AttachmentEntity } from '../../domain/entities/attachment.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { AuditActionType } from '../../domain/enums/audit-action-type.enum';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ValidationException } from '../../domain/exceptions/validation.exception';

export class AttachmentService implements IAttachmentService {
  constructor(
    private readonly attachmentRepository: IAttachmentRepository,
    private readonly fileStorageService: FileStorageService,
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  public async uploadAttachment(
    leadId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    mimeType: string,
    buffer: Buffer,
    uploadedById: string
  ): Promise<AttachmentEntity> {
    if (!AttachmentEntity.isAllowedMimeType(mimeType)) {
      const errorMsg = `File type "${mimeType}" is not allowed`;
      await this.logFailure(uploadedById, leadId, undefined, AuditActionType.FILE_UPLOAD_FAILED, errorMsg, { fileName, fileSize, mimeType });
      throw new ValidationException({ file: [errorMsg] }, 'File upload validation failed');
    }
    if (!AttachmentEntity.isAllowedSize(fileSize)) {
      const errorMsg = 'File size exceeds the limit of 10MB';
      await this.logFailure(uploadedById, leadId, undefined, AuditActionType.FILE_UPLOAD_FAILED, errorMsg, { fileName, fileSize, mimeType });
      throw new ValidationException({ file: [errorMsg] }, 'File upload validation failed');
    }

    let filePath: string;
    try {
      filePath = await this.fileStorageService.saveFile(fileName, buffer);
    } catch (error: any) {
      await this.logFailure(uploadedById, leadId, undefined, AuditActionType.FILE_UPLOAD_FAILED, error.message, { fileName, fileSize, mimeType });
      throw error;
    }

    try {
      const attachment = await this.attachmentRepository.create({
        leadId,
        uploadedById,
        fileName,
        fileType,
        fileSize,
        filePath,
        mimeType,
      });

      const performer = await this.getPerformer(uploadedById);
      await this.auditLogRepository.create({
        userId: uploadedById,
        userName: performer.fullName,
        userRole: performer.role,
        actionType: AuditActionType.FILE_UPLOADED,
        entityType: 'Attachment',
        entityId: attachment.id,
        newValue: {
          id: attachment.id,
          leadId,
          fileName,
          fileSize,
          mimeType,
          storageKey: filePath,
          success: true,
        },
      });

      return attachment;
    } catch (error: any) {
      // Rollback saved file in case of database error
      await this.fileStorageService.deleteFile(filePath);
      await this.logFailure(uploadedById, leadId, undefined, AuditActionType.FILE_UPLOAD_FAILED, error.message, { fileName, fileSize, mimeType });
      throw error;
    }
  }

  public async deleteAttachment(id: string, performerId: string, performerRole: UserRole): Promise<void> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      await this.logFailure(performerId, 'Unknown Lead', id, AuditActionType.FILE_DELETE_FAILED, 'Attachment not found');
      throw new NotFoundException('Attachment not found');
    }

    if (performerRole !== UserRole.ADMIN && attachment.uploadedById !== performerId) {
      const errorMsg = 'You do not have permission to delete this attachment';
      await this.logFailure(performerId, attachment.leadId, id, AuditActionType.FILE_DELETE_FAILED, errorMsg);
      throw new ForbiddenException(errorMsg);
    }

    try {
      await this.fileStorageService.deleteFile(attachment.filePath);
      await this.attachmentRepository.softDelete(id, performerId);

      const performer = await this.getPerformer(performerId);
      await this.auditLogRepository.create({
        userId: performerId,
        userName: performer.fullName,
        userRole: performer.role,
        actionType: AuditActionType.FILE_DELETED,
        entityType: 'Attachment',
        entityId: id,
        previousValue: {
          id: attachment.id,
          leadId: attachment.leadId,
          fileName: attachment.fileName,
          filePath: attachment.filePath,
        },
        newValue: { success: true },
      });
    } catch (error: any) {
      await this.logFailure(performerId, attachment.leadId, id, AuditActionType.FILE_DELETE_FAILED, error.message);
      throw error;
    }
  }

  public async getAttachmentsByLead(leadId: string, performerId: string, performerRole: UserRole): Promise<AttachmentEntity[]> {
    return this.attachmentRepository.findByLeadId(leadId);
  }

  public async getAttachmentFile(id: string, performerId: string, performerRole: UserRole): Promise<{ entity: AttachmentEntity; buffer: Buffer }> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    const buffer = await this.fileStorageService.readFile(attachment.filePath);

    const performer = await this.getPerformer(performerId);
    await this.auditLogRepository.create({
      userId: performerId,
      userName: performer.fullName,
      userRole: performer.role,
      actionType: AuditActionType.FILE_DOWNLOADED,
      entityType: 'Attachment',
      entityId: id,
      newValue: {
        id: attachment.id,
        leadId: attachment.leadId,
        fileName: attachment.fileName,
        success: true,
      },
    });

    return {
      entity: attachment,
      buffer,
    };
  }

  private async getPerformer(userId: string): Promise<{ fullName: string; role: UserRole }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return { fullName: 'Unknown User', role: UserRole.SALES };
    }
    return { fullName: user.fullName, role: user.role };
  }

  private async logFailure(
    userId: string,
    leadId: string,
    fileId: string | undefined,
    actionType: AuditActionType,
    errorMessage: string,
    meta: Record<string, unknown> = {}
  ): Promise<void> {
    const performer = await this.getPerformer(userId);
    await this.auditLogRepository.create({
      userId,
      userName: performer.fullName,
      userRole: performer.role,
      actionType,
      entityType: 'Attachment',
      entityId: fileId,
      newValue: {
        leadId,
        errorMessage,
        success: false,
        ...meta,
      },
    });
  }
}
