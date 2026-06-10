import { ExportHistoryEntity } from '../../entities';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateExportHistoryData {
  userId: string;
  fileName: string;
  fileType: string;
  recordCount: number;
  appliedFilters: Record<string, unknown> | null;
}

export interface IExportHistoryRepository {
  findById(id: string): Promise<ExportHistoryEntity | null>;
  findByUserId(userId: string, pagination: PaginationVo): Promise<PaginatedResult<ExportHistoryEntity>>;
  create(data: CreateExportHistoryData): Promise<ExportHistoryEntity>;
}
