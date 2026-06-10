import { NotificationPriority } from '../enums';

export class NotificationEntity {
  constructor(
    public readonly id: string,
    public title: string,
    public message: string,
    public priority: NotificationPriority,
    public recipientId: string | null,
    public isGlobal: boolean,
    public isRead: boolean,
    public createdById: string,
    public createdAt: Date,
  ) {}

  public markAsRead(): void {
    this.isRead = true;
  }

  public static fromPrisma(data: Record<string, unknown>): NotificationEntity {
    return new NotificationEntity(
      data.id as string,
      data.title as string,
      data.message as string,
      data.priority as NotificationPriority,
      (data.recipientId as string) ?? null,
      data.isGlobal as boolean,
      data.isRead as boolean,
      data.createdById as string,
      data.createdAt as Date,
    );
  }
}
