import { INotificationService } from '../../domain/interfaces/services/notification.service.interface';
import { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { IAuditLogRepository } from '../../domain/interfaces/repositories/audit-log.repository.interface';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationPriority } from '../../domain/enums/notification-priority.enum';
import { AuditActionType } from '../../domain/enums/audit-action-type.enum';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';

export class NotificationService implements INotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  public async getNotificationsForUser(userId: string, pagination: PaginationVo): Promise<PaginatedResult<NotificationEntity>> {
    return this.notificationRepository.findByUserId(userId, pagination);
  }

  public async getUnreadNotifications(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.findUnreadByUserId(userId);
  }

  public async createNotification(
    title: string,
    message: string,
    priority: NotificationPriority,
    recipientId: string | null,
    isGlobal: boolean,
    createdById: string
  ): Promise<NotificationEntity> {
    const creator = await this.userRepository.findById(createdById);
    if (!creator) {
      throw new NotFoundException('Creator user not found');
    }

    if (isGlobal) {
      // 1. Create a master global notification record (recipientId = null)
      const globalNotification = await this.notificationRepository.create({
        title,
        message,
        priority,
        recipientId: null,
        isGlobal: true,
        createdById,
      });

      // 2. Find all active, non-deleted users and create individual copies for them
      const usersResult = await this.userRepository.findAll(new PaginationVo(1, 1000));
      const activeUsers = usersResult.data.filter(u => u.isActive && !u.deletedAt);

      for (const user of activeUsers) {
        await this.notificationRepository.create({
          title,
          message,
          priority,
          recipientId: user.id,
          isGlobal: true,
          createdById,
        });
      }

      // Log GLOBAL_NOTIFICATION_SENT in audit logs
      await this.auditLogRepository.create({
        userId: createdById,
        userName: creator.fullName,
        userRole: creator.role,
        actionType: AuditActionType.GLOBAL_NOTIFICATION_SENT,
        entityType: 'Notification',
        entityId: globalNotification.id,
        newValue: JSON.parse(JSON.stringify(globalNotification)),
      });

      return globalNotification;
    } else {
      if (!recipientId) {
        throw new Error('recipientId is required for non-global notifications');
      }

      const recipient = await this.userRepository.findById(recipientId);
      if (!recipient) {
        throw new NotFoundException('Recipient user not found');
      }

      const notification = await this.notificationRepository.create({
        title,
        message,
        priority,
        recipientId,
        isGlobal: false,
        createdById,
      });

      // Log NOTIFICATION_SENT in audit logs
      await this.auditLogRepository.create({
        userId: createdById,
        userName: creator.fullName,
        userRole: creator.role,
        actionType: AuditActionType.NOTIFICATION_SENT,
        entityType: 'Notification',
        entityId: notification.id,
        newValue: JSON.parse(JSON.stringify(notification)),
      });

      return notification;
    }
  }

  public async markNotificationAsRead(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.recipientId !== userId) {
      throw new ForbiddenException('Cannot mark someone else\'s notification as read');
    }

    await this.notificationRepository.markAsRead(id);

    const user = await this.userRepository.findById(userId);
    if (user) {
      await this.auditLogRepository.create({
        userId,
        userName: user.fullName,
        userRole: user.role,
        actionType: AuditActionType.NOTIFICATION_READ,
        entityType: 'Notification',
        entityId: id,
        newValue: { isRead: true },
      });
    }
  }

  public async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);

    const user = await this.userRepository.findById(userId);
    if (user) {
      await this.auditLogRepository.create({
        userId,
        userName: user.fullName,
        userRole: user.role,
        actionType: AuditActionType.ALL_NOTIFICATIONS_READ,
        entityType: 'Notification',
        newValue: { isRead: true },
      });
    }
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }
}

