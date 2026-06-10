import { RemarkEntity } from '../../entities';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateRemarkData {
  leadId: string;
  authorId: string;
  content: string;
  contentHtml?: string;
}

export interface UpdateRemarkData {
  content: string;
  contentHtml?: string;
}

export interface IRemarkRepository {
  findById(id: string): Promise<RemarkEntity | null>;
  findByLeadId(leadId: string, pagination: PaginationVo): Promise<PaginatedResult<RemarkEntity>>;
  create(data: CreateRemarkData): Promise<RemarkEntity>;
  update(id: string, data: UpdateRemarkData): Promise<RemarkEntity>;
  softDelete(id: string, deletedById: string): Promise<void>;
  countByLeadId(leadId: string): Promise<number>;
}
