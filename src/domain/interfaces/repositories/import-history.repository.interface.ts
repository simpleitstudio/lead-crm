import { ImportHistoryEntity } from '../../entities';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateImportHistoryData {
  userId: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  failureCount: number;
  duplicateCount: number;
  errorReport: Record<string, unknown>[] | null;
  status: any; // ImportStatus enum can be typed properly
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface UpdateImportHistoryData {
  successCount?: number;
  failureCount?: number;
  duplicateCount?: number;
  errorReport?: Record<string, unknown>[] | null;
  status?: any;
  startedAt?: Date | null;
  completedAt?: Date | null;
}

export interface IImportHistoryRepository {
  findById(id: string): Promise<ImportHistoryEntity | null>;
  findByUserId(userId: string, pagination: PaginationVo): Promise<PaginatedResult<ImportHistoryEntity>>;
  create(data: CreateImportHistoryData): Promise<ImportHistoryEntity>;
  update(id: string, data: UpdateImportHistoryData): Promise<ImportHistoryEntity>;
}
