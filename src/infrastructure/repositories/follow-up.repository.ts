import { prisma } from '../database/prisma.client';
import { FollowUpEntity } from '../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../domain/enums/follow-up-status.enum';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { IFollowUpRepository, CreateFollowUpData } from '../../domain/interfaces/repositories/follow-up.repository.interface';

export class FollowUpRepository implements IFollowUpRepository {
  public async findById(id: string): Promise<FollowUpEntity | null> {
    const followUp = await prisma.followUp.findFirst({
      where: { id },
    });
    return followUp ? FollowUpEntity.fromPrisma(followUp) : null;
  }

  public async findByLeadId(leadId: string, pagination: PaginationVo): Promise<PaginatedResult<FollowUpEntity>> {
    const [items, total] = await Promise.all([
      prisma.followUp.findMany({
        where: { leadId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.followUp.count({
        where: { leadId },
      }),
    ]);

    return createPaginatedResult(
      items.map(item => FollowUpEntity.fromPrisma(item)),
      total,
      pagination
    );
  }

  public async findByAssignedUser(
    userId: string,
    status?: FollowUpStatus,
    pagination?: PaginationVo
  ): Promise<PaginatedResult<FollowUpEntity>> {
    const where: any = { assignedToId: userId };
    if (status) {
      where.status = status;
    }

    const limit = pagination?.limit ?? 20;
    const offset = pagination?.offset ?? 0;

    const [items, total] = await Promise.all([
      prisma.followUp.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.followUp.count({ where }),
    ]);

    return createPaginatedResult(
      items.map(item => FollowUpEntity.fromPrisma(item)),
      total,
      pagination ?? new PaginationVo(1, limit)
    );
  }

  public async findOverdue(userId?: string): Promise<FollowUpEntity[]> {
    const now = new Date();
    const where: any = {
      status: FollowUpStatus.PENDING,
      scheduledAt: { lt: now },
    };
    if (userId) {
      where.assignedToId = userId;
    }

    const followUps = await prisma.followUp.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    });
    return followUps.map(item => FollowUpEntity.fromPrisma(item));
  }

  public async findDueToday(userId?: string): Promise<FollowUpEntity[]> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const where: any = {
      status: FollowUpStatus.PENDING,
      scheduledAt: {
        gte: startOfToday,
        lte: endOfToday,
      },
    };
    if (userId) {
      where.assignedToId = userId;
    }

    const followUps = await prisma.followUp.findMany({
      where,
      orderBy: { scheduledAt: 'asc' },
    });
    return followUps.map(item => FollowUpEntity.fromPrisma(item));
  }

  public async findUpcoming(userId?: string, pagination?: PaginationVo): Promise<PaginatedResult<FollowUpEntity>> {
    const now = new Date();
    const where: any = {
      status: FollowUpStatus.PENDING,
      scheduledAt: { gte: now },
    };
    if (userId) {
      where.assignedToId = userId;
    }

    const limit = pagination?.limit ?? 20;
    const offset = pagination?.offset ?? 0;

    const [items, total] = await Promise.all([
      prisma.followUp.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { scheduledAt: 'asc' },
      }),
      prisma.followUp.count({ where }),
    ]);

    return createPaginatedResult(
      items.map(item => FollowUpEntity.fromPrisma(item)),
      total,
      pagination ?? new PaginationVo(1, limit)
    );
  }

  public async create(data: CreateFollowUpData): Promise<FollowUpEntity> {
    const followUp = await prisma.followUp.create({
      data: {
        leadId: data.leadId,
        assignedToId: data.assignedToId,
        createdById: data.createdById,
        scheduledAt: data.scheduledAt,
        note: data.note ?? null,
        status: FollowUpStatus.PENDING,
      },
    });
    return FollowUpEntity.fromPrisma(followUp);
  }

  public async update(id: string, data: Partial<FollowUpEntity>): Promise<FollowUpEntity> {
    const followUp = await prisma.followUp.update({
      where: { id },
      data: {
        scheduledAt: data.scheduledAt,
        note: data.note,
        status: data.status,
        completedAt: data.completedAt,
        completionNote: data.completionNote,
      },
    });
    return FollowUpEntity.fromPrisma(followUp);
  }

  public async complete(id: string, completionNote?: string): Promise<FollowUpEntity> {
    const followUp = await prisma.followUp.update({
      where: { id },
      data: {
        status: FollowUpStatus.COMPLETED,
        completedAt: new Date(),
        completionNote: completionNote ?? null,
      },
    });
    return FollowUpEntity.fromPrisma(followUp);
  }

  public async cancel(id: string): Promise<FollowUpEntity> {
    const followUp = await prisma.followUp.update({
      where: { id },
      data: {
        status: FollowUpStatus.CANCELLED,
      },
    });
    return FollowUpEntity.fromPrisma(followUp);
  }

  public async countByStatus(userId?: string): Promise<Record<string, number>> {
    const where: any = {};
    if (userId) {
      where.assignedToId = userId;
    }
    const results = await prisma.followUp.groupBy({
      by: ['status'],
      _count: { id: true },
      where,
    });

    const counts: Record<string, number> = {};
    results.forEach(res => {
      counts[res.status] = res._count.id;
    });
    return counts;
  }

  public async countOverdue(userId?: string): Promise<number> {
    const now = new Date();
    const where: any = {
      status: FollowUpStatus.PENDING,
      scheduledAt: { lt: now },
    };
    if (userId) {
      where.assignedToId = userId;
    }
    return prisma.followUp.count({ where });
  }
}
