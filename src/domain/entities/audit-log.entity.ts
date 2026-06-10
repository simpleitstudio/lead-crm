import { AuditActionType, UserRole } from '../enums';

export class AuditLogEntity {
  constructor(
    public readonly id: string,
    public userId: string | null,
    public userName: string,
    public userRole: UserRole,
    public ipAddress: string | null,
    public userAgent: string | null,
    public actionType: AuditActionType,
    public entityType: string,
    public entityId: string | null,
    public previousValue: Record<string, unknown> | null,
    public newValue: Record<string, unknown> | null,
    public createdAt: Date,
  ) {}

  public static fromPrisma(data: Record<string, unknown>): AuditLogEntity {
    return new AuditLogEntity(
      data.id as string,
      (data.userId as string) ?? null,
      data.userName as string,
      data.userRole as UserRole,
      (data.ipAddress as string) ?? null,
      (data.userAgent as string) ?? null,
      data.actionType as AuditActionType,
      data.entityType as string,
      (data.entityId as string) ?? null,
      (data.previousValue as Record<string, unknown>) ?? null,
      (data.newValue as Record<string, unknown>) ?? null,
      data.createdAt as Date,
    );
  }
}
