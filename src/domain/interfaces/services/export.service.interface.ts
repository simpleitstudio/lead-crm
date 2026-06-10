import { ExportHistoryEntity } from '../../entities';
import { LeadFilterParams } from '../repositories/lead.repository.interface';
import { PaginatedResult, PaginationVo } from '../../value-objects';
import { UserRole } from '../../enums';

export interface IExportService {
  exportLeads(userId: string, filters: LeadFilterParams, fileType: 'csv' | 'xlsx'): Promise<{ fileName: string; fileBuffer: Buffer }>;
  getExportHistory(userId: string, pagination: PaginationVo, performerRole: UserRole): Promise<PaginatedResult<ExportHistoryEntity>>;
}
