import { NotificationType } from '../enums';

export class NotificationEntity {
  constructor(
    public readonly id: string,
    public userId: string,
    public type: NotificationType,
    public title: string,
    public message: string,
    public referenceId: string | null,
    public referenceType: string | null,
    public isRead: boolean,
    public readAt: Date | null,
    public createdAt: Date,
  ) {}

  public markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
  }

  public static fromPrisma(data: Record<string, unknown>): NotificationEntity {
    return new NotificationEntity(
      data.id as string,
      data.userId as string,
      data.type as NotificationType,
      data.title as string,
      data.message as string,
      (data.referenceId as string) ?? null,
      (data.referenceType as string) ?? null,
      data.isRead as boolean,
      (data.readAt as Date) ?? null,
      data.createdAt as Date,
    );
  }
}
