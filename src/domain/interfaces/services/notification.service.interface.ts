import { NotificationEntity } from '../../entities';
import { NotificationPriority } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface INotificationService {
  getNotificationsForUser(userId: string, pagination: PaginationVo): Promise<PaginatedResult<NotificationEntity>>;
  getUnreadNotifications(userId: string): Promise<NotificationEntity[]>;
  createNotification(
    title: string,
    message: string,
    priority: NotificationPriority,
    recipientId: string | null,
    isGlobal: boolean,
    createdById: string
  ): Promise<NotificationEntity>;
  markNotificationAsRead(id: string, userId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  getUnreadCount(userId: string): Promise<number>;
}
