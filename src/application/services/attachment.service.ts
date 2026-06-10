import { IAttachmentService } from '../../domain/interfaces/services/attachment.service.interface';
import { IAttachmentRepository } from '../../domain/interfaces/repositories/attachment.repository.interface';
import { FileStorageService } from '../../infrastructure/storage/file-storage.service';
import { AttachmentEntity } from '../../domain/entities/attachment.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ValidationException } from '../../domain/exceptions/validation.exception';

export class AttachmentService implements IAttachmentService {
  constructor(
    private readonly attachmentRepository: IAttachmentRepository,
    private readonly fileStorageService: FileStorageService
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
      throw new ValidationException({ file: [`File type "${mimeType}" is not allowed`] }, 'File upload validation failed');
    }
    if (!AttachmentEntity.isAllowedSize(fileSize)) {
      throw new ValidationException({ file: ['File size exceeds the limit of 10MB'] }, 'File upload validation failed');
    }

    const filePath = await this.fileStorageService.saveFile(fileName, buffer);

    try {
      return await this.attachmentRepository.create({
        leadId,
        uploadedById,
        fileName,
        fileType,
        fileSize,
        filePath,
        mimeType,
      });
    } catch (error) {
      // Rollback saved file in case of database error
      await this.fileStorageService.deleteFile(filePath);
      throw error;
    }
  }

  public async deleteAttachment(id: string, performerId: string, performerRole: UserRole): Promise<void> {
    const attachment = await this.attachmentRepository.findById(id);
    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    if (performerRole !== UserRole.ADMIN && attachment.uploadedById !== performerId) {
      throw new ForbiddenException('You do not have permission to delete this attachment');
    }

    await this.attachmentRepository.softDelete(id, performerId);
    await this.fileStorageService.deleteFile(attachment.filePath);
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
    return {
      entity: attachment,
      buffer,
    };
  }
}
