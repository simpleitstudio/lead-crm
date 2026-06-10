import { ImportHistoryEntity } from '../../entities';
import { PaginatedResult, PaginationVo } from '../../value-objects';
import { UserRole } from '../../enums';

export interface IImportService {
  importLeads(userId: string, fileName: string, fileBuffer: Buffer): Promise<ImportHistoryEntity>;
  getImportHistory(userId: string, pagination: PaginationVo, performerRole: UserRole): Promise<PaginatedResult<ImportHistoryEntity>>;
  getImportHistoryDetail(id: string, performerId: string, performerRole: UserRole): Promise<ImportHistoryEntity>;
}
