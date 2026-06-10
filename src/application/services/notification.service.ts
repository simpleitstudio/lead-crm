import { INotificationService } from '../../domain/interfaces/services/notification.service.interface';
import { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { NotificationEntity } from '../../domain/entities/notification.entity';
import { NotificationType } from '../../domain/enums/notification-type.enum';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';

export class NotificationService implements INotificationService {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  public async getNotificationsForUser(userId: string, pagination: PaginationVo): Promise<PaginatedResult<NotificationEntity>> {
    return this.notificationRepository.findByUserId(userId, pagination);
  }

  public async getUnreadNotifications(userId: string): Promise<NotificationEntity[]> {
    return this.notificationRepository.findUnreadByUserId(userId);
  }

  public async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<NotificationEntity> {
    return this.notificationRepository.create({
      userId,
      type,
      title,
      message,
      referenceId,
      referenceType,
    });
  }

  public async markNotificationAsRead(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    if (notification.userId !== userId) {
      throw new ForbiddenException('Cannot mark someone else\'s notification as read');
    }
    await this.notificationRepository.markAsRead(id);
  }

  public async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.countUnread(userId);
  }
}
