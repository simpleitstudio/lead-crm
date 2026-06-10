import { prisma } from '../database/prisma.client';
import { ActivityEntity } from '../../domain/entities/activity.entity';
import { ActionType } from '../../domain/enums/action-type.enum';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { IActivityRepository, CreateActivityData } from '../../domain/interfaces/repositories/activity.repository.interface';

export class ActivityRepository implements IActivityRepository {
  public async findByLeadId(leadId: string, pagination: PaginationVo): Promise<PaginatedResult<ActivityEntity>> {
    const [items, total] = await Promise.all([
      prisma.activity.findMany({
        where: { leadId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activity.count({
        where: { leadId },
      }),
    ]);

    return createPaginatedResult(
      items.map(item => ActivityEntity.fromPrisma(item as any)),
      total,
      pagination
    );
  }

  public async findByUserId(userId: string, pagination: PaginationVo): Promise<PaginatedResult<ActivityEntity>> {
    const [items, total] = await Promise.all([
      prisma.activity.findMany({
        where: { userId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.activity.count({
        where: { userId },
      }),
    ]);

    return createPaginatedResult(
      items.map(item => ActivityEntity.fromPrisma(item as any)),
      total,
      pagination
    );
  }

  public async create(data: CreateActivityData): Promise<ActivityEntity> {
    const activity = await prisma.activity.create({
      data: {
        leadId: data.leadId,
        userId: data.userId,
        actionType: data.actionType as any,
        description: data.description,
        metadata: data.metadata as any,
      },
    });
    return ActivityEntity.fromPrisma(activity as any);
  }

  public async countByUserId(userId: string): Promise<number> {
    return prisma.activity.count({
      where: { userId },
    });
  }
}
