import { UserRole } from '../enums';

export class UserEntity {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public firstName: string,
    public lastName: string,
    public role: UserRole,
    public isActive: boolean,
    public phone: string | null,
    public avatarUrl: string | null,
    public lastLoginAt: Date | null,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  public get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  public get isSales(): boolean {
    return this.role === UserRole.SALES;
  }

  public get isLeadGenerator(): boolean {
    return this.role === UserRole.LEAD_GENERATOR;
  }

  public canManageUsers(): boolean {
    return this.isAdmin;
  }

  public canManageLeads(): boolean {
    return this.isAdmin;
  }

  public canDeleteLeads(): boolean {
    return this.isAdmin;
  }

  public canAssignLeads(): boolean {
    return this.isAdmin;
  }

  public canViewAllLeads(): boolean {
    return this.isAdmin;
  }

  public canCreateLeads(): boolean {
    return this.isAdmin || this.isLeadGenerator;
  }

  public canImportLeads(): boolean {
    return this.isAdmin || this.isLeadGenerator;
  }

  public canExportLeads(): boolean {
    return this.isAdmin || this.isSales;
  }

  public canUpdateLeadStatus(): boolean {
    return this.isAdmin || this.isSales;
  }

  public canAddRemarks(): boolean {
    return this.isAdmin || this.isSales;
  }

  public canManageFollowUps(): boolean {
    return this.isAdmin || this.isSales;
  }

  public canUploadFiles(): boolean {
    return this.isAdmin || this.isSales;
  }

  public canAccessAuditLogs(): boolean {
    return this.isAdmin;
  }

  public canAccessFullAnalytics(): boolean {
    return this.isAdmin;
  }

  public canAccessSystemSettings(): boolean {
    return this.isAdmin;
  }

  public deactivate(): void {
    this.isActive = false;
  }

  public activate(): void {
    this.isActive = true;
  }

  public updateLastLogin(): void {
    this.lastLoginAt = new Date();
  }

  public static fromPrisma(data: Record<string, unknown>): UserEntity {
    return new UserEntity(
      data.id as string,
      data.email as string,
      data.passwordHash as string,
      data.firstName as string,
      data.lastName as string,
      data.role as UserRole,
      data.isActive as boolean,
      (data.phone as string) ?? null,
      (data.avatarUrl as string) ?? null,
      (data.lastLoginAt as Date) ?? null,
      data.createdAt as Date,
      data.updatedAt as Date,
      (data.deletedAt as Date) ?? null,
    );
  }
}
