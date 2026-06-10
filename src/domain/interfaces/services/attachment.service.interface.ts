import { AttachmentEntity } from '../../entities';
import { UserRole } from '../../enums';

export interface IAttachmentService {
  uploadAttachment(
    leadId: string,
    fileName: string,
    fileType: string,
    fileSize: number,
    mimeType: string,
    buffer: Buffer,
    uploadedById: string
  ): Promise<AttachmentEntity>;
  deleteAttachment(id: string, performerId: string, performerRole: UserRole): Promise<void>;
  getAttachmentsByLead(leadId: string, performerId: string, performerRole: UserRole): Promise<AttachmentEntity[]>;
  getAttachmentFile(id: string, performerId: string, performerRole: UserRole): Promise<{ entity: AttachmentEntity; buffer: Buffer }>;
}
