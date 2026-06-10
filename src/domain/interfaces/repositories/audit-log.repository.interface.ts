import { AuditLogEntity } from '../../entities';
import { AuditActionType, UserRole } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateAuditLogData {
  userId?: string;
  userName: string;
  userRole: UserRole;
  ipAddress?: string;
  userAgent?: string;
  actionType: AuditActionType;
  entityType: string;
  entityId?: string;
  previousValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
}

export interface AuditLogFilterParams {
  userId?: string;
  actionType?: AuditActionType;
  entityType?: string;
  entityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IAuditLogRepository {
  create(data: CreateAuditLogData): Promise<void>;
  findAll(filters: AuditLogFilterParams, pagination: PaginationVo): Promise<PaginatedResult<AuditLogEntity>>;
  findByEntity(entityType: string, entityId: string, pagination: PaginationVo): Promise<PaginatedResult<AuditLogEntity>>;
  findByUser(userId: string, pagination: PaginationVo): Promise<PaginatedResult<AuditLogEntity>>;
}
