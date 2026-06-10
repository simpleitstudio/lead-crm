import { prisma } from '../database/prisma.client';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity';
import { AuditActionType } from '../../domain/enums/audit-action-type.enum';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { IAuditLogRepository, CreateAuditLogData, AuditLogFilterParams } from '../../domain/interfaces/repositories/audit-log.repository.interface';

export class AuditLogRepository implements IAuditLogRepository {
  private buildWhereClause(filters: AuditLogFilterParams): any {
    const where: any = {};

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.actionType) {
      where.actionType = filters.actionType;
    }

    if (filters.entityType) {
      where.entityType = filters.entityType;
    }

    if (filters.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    return where;
  }

  public async create(data: CreateAuditLogData): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId: data.userId ?? null,
        userName: data.userName,
        userRole: data.userRole as any,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
        actionType: data.actionType as any,
        entityType: data.entityType,
        entityId: data.entityId ?? null,
        previousValue: data.previousValue as any,
        newValue: data.newValue as any,
      },
    });
  }

  public async findAll(filters: AuditLogFilterParams, pagination: PaginationVo): Promise<PaginatedResult<AuditLogEntity>> {
    const where = this.buildWhereClause(filters);
    const [items, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return createPaginatedResult(
      items.map(item => AuditLogEntity.fromPrisma(item as any)),
      total,
      pagination
    );
  }

  public async findByEntity(entityType: string, entityId: string, pagination: PaginationVo): Promise<PaginatedResult<AuditLogEntity>> {
    return this.findAll({ entityType, entityId }, pagination);
  }

  public async findByUser(userId: string, pagination: PaginationVo): Promise<PaginatedResult<AuditLogEntity>> {
    return this.findAll({ userId }, pagination);
  }
}
