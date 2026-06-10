import { AttachmentEntity } from '../../entities';

export interface CreateAttachmentData {
  leadId: string;
  uploadedById: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
}

export interface IAttachmentRepository {
  findById(id: string): Promise<AttachmentEntity | null>;
  findByLeadId(leadId: string): Promise<AttachmentEntity[]>;
  create(data: CreateAttachmentData): Promise<AttachmentEntity>;
  softDelete(id: string, deletedById: string): Promise<void>;
  countByLeadId(leadId: string): Promise<number>;
}
