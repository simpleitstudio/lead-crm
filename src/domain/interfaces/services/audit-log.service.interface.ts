import { AuditLogEntity } from '../../entities';
import { CreateAuditLogData, AuditLogFilterParams } from '../repositories/audit-log.repository.interface';
import { PaginatedResult, PaginationVo } from '../../value-objects';
import { UserRole } from '../../enums';

export interface IAuditLogService {
  logAction(data: CreateAuditLogData): Promise<void>;
  getAuditLogs(filters: AuditLogFilterParams, pagination: PaginationVo, performerId: string, performerRole: UserRole): Promise<PaginatedResult<AuditLogEntity>>;
  getAuditLogsByEntity(entityType: string, entityId: string, pagination: PaginationVo, performerId: string, performerRole: UserRole): Promise<PaginatedResult<AuditLogEntity>>;
}
