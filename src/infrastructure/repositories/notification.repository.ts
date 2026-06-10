import { prisma } from '../database/prisma.client';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { INotificationRepository, CreateNotificationData } from '../../domain/interfaces/repositories/notification.repository.interface';

export class NotificationRepository implements INotificationRepository {
  public async findById(id: string): Promise<NotificationEntity | null> {
    const notification = await prisma.notification.findFirst({
      where: { id },
    });
    return notification ? NotificationEntity.fromPrisma(notification) : null;
  }

  public async findByUserId(userId: string, pagination: PaginationVo): Promise<PaginatedResult<NotificationEntity>> {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({
        where: { userId },
      }),
    ]);

    return createPaginatedResult(
      items.map(item => NotificationEntity.fromPrisma(item)),
      total,
      pagination
    );
  }

  public async findUnreadByUserId(userId: string): Promise<NotificationEntity[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId, isRead: false },
      orderBy: { createdAt: 'desc' },
    });
    return notifications.map(item => NotificationEntity.fromPrisma(item));
  }

  public async create(data: CreateNotificationData): Promise<NotificationEntity> {
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        referenceId: data.referenceId ?? null,
        referenceType: data.referenceType ?? null,
        isRead: false,
      },
    });
    return NotificationEntity.fromPrisma(notification);
  }

  public async markAsRead(id: string): Promise<void> {
    await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  public async markAllAsRead(userId: string): Promise<void> {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  public async countUnread(userId: string): Promise<number> {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}
