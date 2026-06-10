import { LeadStatus, LeadPriority, LeadSource, LostReason, LEAD_STATUS_TRANSITIONS } from '../enums';
import { BusinessRuleException } from '../exceptions';

export class LeadEntity {
  constructor(
    public readonly id: string,
    public companyName: string,
    public contactPerson: string,
    public designation: string | null,
    public email: string | null,
    public phone: string | null,
    public alternatePhone: string | null,
    public website: string | null,
    public linkedinUrl: string | null,
    public instagramUrl: string | null,
    public industry: string | null,
    public businessCategory: string | null,
    public existingSoftwareStack: string | null,
    public servicesInterestedIn: string | null,
    public currentBusinessProblem: string | null,
    public estimatedBudget: string | null,
    public internalNotes: string | null,
    public preferredContactPlatform: string | null,
    public customContactPlatform: string | null,
    public city: string | null,
    public state: string | null,
    public country: string | null,
    public source: LeadSource,
    public priority: LeadPriority,
    public status: LeadStatus,
    public lostReason: LostReason | null,
    public lostReasonNote: string | null,
    public assignedToId: string | null,
    public assignedAt: Date | null,
    public createdById: string,
    public updatedById: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
    public deletedById: string | null,
  ) {}

  public get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public get isAssigned(): boolean {
    return this.assignedToId !== null;
  }

  public get isClosed(): boolean {
    return this.status === LeadStatus.WON || this.status === LeadStatus.LOST;
  }

  public get isWon(): boolean {
    return this.status === LeadStatus.WON;
  }

  public get isLost(): boolean {
    return this.status === LeadStatus.LOST;
  }

  public get isActive(): boolean {
    return !this.isDeleted && !this.isClosed;
  }

  /**
   * Check if the lead can transition to a new status.
   * ADMIN override is handled at the service layer, not here.
   */
  public canTransitionTo(newStatus: LeadStatus): boolean {
    if (this.status === newStatus) {
      return false;
    }
    const allowedTransitions = LEAD_STATUS_TRANSITIONS[this.status];
    return allowedTransitions.includes(newStatus);
  }

  /**
   * Transition the lead to a new status with validation.
   * @throws BusinessRuleException if the transition is invalid
   */
  public transitionTo(newStatus: LeadStatus, isAdmin = false): void {
    if (this.status === newStatus) {
      throw new BusinessRuleException(`Lead is already in status "${newStatus}"`);
    }

    if (!isAdmin && !this.canTransitionTo(newStatus)) {
      throw new BusinessRuleException(
        `Cannot transition from "${this.status}" to "${newStatus}". ` +
        `Allowed transitions: ${LEAD_STATUS_TRANSITIONS[this.status].join(', ') || 'none'}`,
      );
    }

    this.status = newStatus;
  }

  public canBeAssigned(): boolean {
    return this.status !== LeadStatus.WON &&
      this.status !== LeadStatus.LOST &&
      this.status !== LeadStatus.INVALID;
  }

  public assign(userId: string, updatedById: string): void {
    if (!this.canBeAssigned()) {
      throw new BusinessRuleException(
        `Cannot assign lead in status "${this.status}"`,
      );
    }
    this.assignedToId = userId;
    this.assignedAt = new Date();
    this.updatedById = updatedById;

    if (this.status === LeadStatus.NEW) {
      this.status = LeadStatus.ASSIGNED;
    }
  }

  public markAsLost(reason: LostReason, note?: string): void {
    this.status = LeadStatus.LOST;
    this.lostReason = reason;
    this.lostReasonNote = note ?? null;
  }

  public markAsWon(): void {
    this.status = LeadStatus.WON;
    this.lostReason = null;
    this.lostReasonNote = null;
  }

  public softDelete(deletedById: string): void {
    this.deletedAt = new Date();
    this.deletedById = deletedById;
  }

  public restore(): void {
    this.deletedAt = null;
    this.deletedById = null;
  }

  /**
   * Check if a given user (by ID) is the assigned salesperson for this lead.
   */
  public isAssignedTo(userId: string): boolean {
    return this.assignedToId === userId;
  }

  public static fromPrisma(data: Record<string, unknown>): LeadEntity {
    return new LeadEntity(
      data.id as string,
      data.companyName as string,
      data.contactPerson as string,
      (data.designation as string) ?? null,
      (data.email as string) ?? null,
      (data.phone as string) ?? null,
      (data.alternatePhone as string) ?? null,
      (data.website as string) ?? null,
      (data.linkedinUrl as string) ?? null,
      (data.instagramUrl as string) ?? null,
      (data.industry as string) ?? null,
      (data.businessCategory as string) ?? null,
      (data.existingSoftwareStack as string) ?? null,
      (data.servicesInterestedIn as string) ?? null,
      (data.currentBusinessProblem as string) ?? null,
      (data.estimatedBudget as string) ?? null,
      (data.internalNotes as string) ?? null,
      (data.preferredContactPlatform as string) ?? null,
      (data.customContactPlatform as string) ?? null,
      (data.city as string) ?? null,
      (data.state as string) ?? null,
      (data.country as string) ?? null,
      data.source as LeadSource,
      data.priority as LeadPriority,
      data.status as LeadStatus,
      (data.lostReason as LostReason) ?? null,
      (data.lostReasonNote as string) ?? null,
      (data.assignedToId as string) ?? null,
      (data.assignedAt as Date) ?? null,
      data.createdById as string,
      (data.updatedById as string) ?? null,
      data.createdAt as Date,
      data.updatedAt as Date,
      (data.deletedAt as Date) ?? null,
      (data.deletedById as string) ?? null,
    );
  }
}
