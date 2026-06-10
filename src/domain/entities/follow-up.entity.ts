import { FollowUpStatus } from '../enums';
import { BusinessRuleException } from '../exceptions';

export class FollowUpEntity {
  constructor(
    public readonly id: string,
    public leadId: string,
    public assignedToId: string,
    public createdById: string,
    public scheduledAt: Date,
    public note: string | null,
    public status: FollowUpStatus,
    public completedAt: Date | null,
    public completionNote: string | null,
    public createdAt: Date,
    public updatedAt: Date,
  ) {}

  public get isPending(): boolean {
    return this.status === FollowUpStatus.PENDING;
  }

  public get isCompleted(): boolean {
    return this.status === FollowUpStatus.COMPLETED;
  }

  public get isCancelled(): boolean {
    return this.status === FollowUpStatus.CANCELLED;
  }

  public get isOverdue(): boolean {
    return this.isPending && this.scheduledAt < new Date();
  }

  public get isDueToday(): boolean {
    if (!this.isPending) return false;
    const now = new Date();
    return (
      this.scheduledAt.getFullYear() === now.getFullYear() &&
      this.scheduledAt.getMonth() === now.getMonth() &&
      this.scheduledAt.getDate() === now.getDate()
    );
  }

  public complete(completionNote?: string): void {
    if (!this.isPending) {
      throw new BusinessRuleException(
        `Cannot complete a follow-up that is in status "${this.status}"`,
      );
    }
    this.status = FollowUpStatus.COMPLETED;
    this.completedAt = new Date();
    this.completionNote = completionNote ?? null;
  }

  public cancel(): void {
    if (!this.isPending) {
      throw new BusinessRuleException(
        `Cannot cancel a follow-up that is in status "${this.status}"`,
      );
    }
    this.status = FollowUpStatus.CANCELLED;
  }

  public isAssignedTo(userId: string): boolean {
    return this.assignedToId === userId;
  }

  public static fromPrisma(data: Record<string, unknown>): FollowUpEntity {
    return new FollowUpEntity(
      data.id as string,
      data.leadId as string,
      data.assignedToId as string,
      data.createdById as string,
      data.scheduledAt as Date,
      (data.note as string) ?? null,
      data.status as FollowUpStatus,
      (data.completedAt as Date) ?? null,
      (data.completionNote as string) ?? null,
      data.createdAt as Date,
      data.updatedAt as Date,
    );
  }
}
