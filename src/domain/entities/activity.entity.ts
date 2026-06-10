import { ActionType } from '../enums';

export class ActivityEntity {
  constructor(
    public readonly id: string,
    public leadId: string,
    public userId: string,
    public actionType: ActionType,
    public description: string,
    public metadata: Record<string, unknown> | null,
    public createdAt: Date,
  ) {}

  public static fromPrisma(data: Record<string, unknown>): ActivityEntity {
    return new ActivityEntity(
      data.id as string,
      data.leadId as string,
      data.userId as string,
      data.actionType as ActionType,
      data.description as string,
      (data.metadata as Record<string, unknown>) ?? null,
      data.createdAt as Date,
    );
  }
}
