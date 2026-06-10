import { NotificationEntity } from '../../entities';
import { NotificationPriority } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateNotificationData {
  title: string;
  message: string;
  priority: NotificationPriority;
  recipientId?: string | null;
  isGlobal?: boolean;
  createdById: string;
}

export interface INotificationRepository {
  findById(id: string): Promise<NotificationEntity | null>;
  findByUserId(userId: string, pagination: PaginationVo): Promise<PaginatedResult<NotificationEntity>>;
  findUnreadByUserId(userId: string): Promise<NotificationEntity[]>;
  create(data: CreateNotificationData): Promise<NotificationEntity>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  countUnread(userId: string): Promise<number>;
}
