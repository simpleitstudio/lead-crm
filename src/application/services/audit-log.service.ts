import { IAuditLogService } from '../../domain/interfaces/services/audit-log.service.interface';
import { IAuditLogRepository, CreateAuditLogData, AuditLogFilterParams } from '../../domain/interfaces/repositories/audit-log.repository.interface';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';

export class AuditLogService implements IAuditLogService {
  constructor(private readonly auditLogRepository: IAuditLogRepository) {}

  public async logAction(data: CreateAuditLogData): Promise<void> {
    await this.auditLogRepository.create(data);
  }

  public async getAuditLogs(
    filters: AuditLogFilterParams,
    pagination: PaginationVo,
    performerId: string,
    performerRole: UserRole
  ): Promise<PaginatedResult<AuditLogEntity>> {
    if (performerRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can view audit logs');
    }
    return this.auditLogRepository.findAll(filters, pagination);
  }

  public async getAuditLogsByEntity(
    entityType: string,
    entityId: string,
    pagination: PaginationVo,
    performerId: string,
    performerRole: UserRole
  ): Promise<PaginatedResult<AuditLogEntity>> {
    if (performerRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can view audit logs');
    }
    return this.auditLogRepository.findByEntity(entityType, entityId, pagination);
  }
}
