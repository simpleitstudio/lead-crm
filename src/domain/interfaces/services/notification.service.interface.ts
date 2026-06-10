import { NotificationEntity } from '../../entities';
import { NotificationType } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface INotificationService {
  getNotificationsForUser(userId: string, pagination: PaginationVo): Promise<PaginatedResult<NotificationEntity>>;
  getUnreadNotifications(userId: string): Promise<NotificationEntity[]>;
  createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<NotificationEntity>;
  markNotificationAsRead(id: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}
