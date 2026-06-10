import { prisma } from '../database/prisma.client';
import { AttachmentEntity } from '../../domain/entities/attachment.entity';
import { IAttachmentRepository, CreateAttachmentData } from '../../domain/interfaces/repositories/attachment.repository.interface';

export class AttachmentRepository implements IAttachmentRepository {
  public async findById(id: string): Promise<AttachmentEntity | null> {
    const attachment = await prisma.attachment.findFirst({
      where: { id, deletedAt: null },
    });
    return attachment ? AttachmentEntity.fromPrisma(attachment) : null;
  }

  public async findByLeadId(leadId: string): Promise<AttachmentEntity[]> {
    const attachments = await prisma.attachment.findMany({
      where: { leadId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return attachments.map(item => AttachmentEntity.fromPrisma(item));
  }

  public async create(data: CreateAttachmentData): Promise<AttachmentEntity> {
    const attachment = await prisma.attachment.create({
      data: {
        leadId: data.leadId,
        uploadedById: data.uploadedById,
        fileName: data.fileName,
        fileType: data.fileType,
        fileSize: data.fileSize,
        filePath: data.filePath,
        mimeType: data.mimeType,
      },
    });
    return AttachmentEntity.fromPrisma(attachment);
  }

  public async softDelete(id: string, deletedById: string): Promise<void> {
    await prisma.attachment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    });
  }

  public async countByLeadId(leadId: string): Promise<number> {
    return prisma.attachment.count({
      where: { leadId, deletedAt: null },
    });
  }
}
