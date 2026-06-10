import { RemarkEntity } from '../../entities';
import { PaginatedResult, PaginationVo } from '../../value-objects';
import { UserRole } from '../../enums';

export interface IRemarkService {
  createRemark(leadId: string, content: string, performerId: string): Promise<RemarkEntity>;
  updateRemark(id: string, content: string, performerId: string, performerRole: UserRole): Promise<RemarkEntity>;
  deleteRemark(id: string, performerId: string, performerRole: UserRole): Promise<void>;
  getRemarksByLeadId(leadId: string, pagination: PaginationVo, performerId: string, performerRole: UserRole): Promise<PaginatedResult<RemarkEntity>>;
}
