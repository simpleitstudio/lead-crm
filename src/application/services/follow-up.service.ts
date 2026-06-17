import { IFollowUpService } from '../../domain/interfaces/services/follow-up.service.interface';
import { IFollowUpRepository } from '../../domain/interfaces/repositories/follow-up.repository.interface';
import { ILeadRepository } from '../../domain/interfaces/repositories/lead.repository.interface';
import { IActivityRepository } from '../../domain/interfaces/repositories/activity.repository.interface';
import { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { FollowUpEntity } from '../../domain/entities/follow-up.entity';
import { FollowUpStatus } from '../../domain/enums/follow-up-status.enum';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ActionType } from '../../domain/enums/action-type.enum';
import { NotificationPriority } from '../../domain/enums/notification-priority.enum';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';

export class FollowUpService implements IFollowUpService {
  constructor(
    private readonly followUpRepository: IFollowUpRepository,
    private readonly leadRepository: ILeadRepository,
    private readonly activityRepository: IActivityRepository,
    private readonly notificationRepository: INotificationRepository
  ) {}

  public async createFollowUp(
    leadId: string,
    assignedToId: string,
    scheduledAt: Date,
    note: string | undefined,
    performerId: string,
    performerRole: UserRole
  ): Promise<FollowUpEntity> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (performerRole !== UserRole.ADMIN && lead.assignedToId !== performerId) {
      throw new ForbiddenException('You can only schedule follow-ups for leads assigned to you');
    }

    const followUp = await this.followUpRepository.create({
      leadId,
      assignedToId,
      createdById: performerId,
      scheduledAt,
      note,
    });

    await this.activityRepository.create({
      leadId,
      userId: performerId,
      actionType: ActionType.FOLLOWUP_SCHEDULED,
      description: `Scheduled a follow-up for ${new Date(scheduledAt).toLocaleString()}`,
    });

    if (assignedToId !== performerId) {
      await this.notificationRepository.create({
        title: 'New Follow-up Scheduled',
        message: `A follow-up was scheduled for lead "${lead.companyName}" on ${new Date(scheduledAt).toLocaleString()}`,
        priority: NotificationPriority.INFO,
        recipientId: assignedToId,
        isGlobal: false,
        createdById: performerId,
      });
    }

    return followUp;
  }

  public async completeFollowUp(id: string, completionNote: string | undefined, performerId: string, performerRole: UserRole): Promise<FollowUpEntity> {
    const followUp = await this.followUpRepository.findById(id);
    if (!followUp) {
      throw new NotFoundException('Follow-up not found');
    }

    if (performerRole !== UserRole.ADMIN && followUp.assignedToId !== performerId) {
      throw new ForbiddenException('You can only complete follow-ups assigned to you');
    }

    // Verify state machine constraints on entity
    followUp.complete(completionNote);

    const updated = await this.followUpRepository.complete(id, completionNote);

    await this.activityRepository.create({
      leadId: followUp.leadId,
      userId: performerId,
      actionType: ActionType.FOLLOWUP_COMPLETED,
      description: `Completed follow-up: "${completionNote ?? 'No completion note'}"`,
    });

    return updated;
  }

  public async cancelFollowUp(id: string, performerId: string, performerRole: UserRole): Promise<FollowUpEntity> {
    const followUp = await this.followUpRepository.findById(id);
    if (!followUp) {
      throw new NotFoundException('Follow-up not found');
    }

    if (performerRole !== UserRole.ADMIN && followUp.assignedToId !== performerId) {
      throw new ForbiddenException('You can only cancel follow-ups assigned to you');
    }

    followUp.cancel();

    const updated = await this.followUpRepository.cancel(id);

    await this.activityRepository.create({
      leadId: followUp.leadId,
      userId: performerId,
      actionType: ActionType.FOLLOWUP_CANCELLED,
      description: `Cancelled follow-up`,
    });

    return updated;
  }

  public async getFollowUpsForUser(userId: string, status?: FollowUpStatus, pagination?: PaginationVo): Promise<PaginatedResult<FollowUpEntity>> {
    return this.followUpRepository.findByAssignedUser(userId, status, pagination);
  }

  public async getOverdueFollowUps(userId?: string): Promise<FollowUpEntity[]> {
    return this.followUpRepository.findOverdue(userId);
  }

  public async getDueTodayFollowUps(userId?: string): Promise<FollowUpEntity[]> {
    return this.followUpRepository.findDueToday(userId);
  }

  public async getUpcomingFollowUps(userId?: string, pagination?: PaginationVo): Promise<PaginatedResult<FollowUpEntity>> {
    return this.followUpRepository.findUpcoming(userId, pagination);
  }

  public async getFollowUpsByLead(
    leadId: string,
    pagination: PaginationVo,
    performerId: string,
    performerRole: UserRole
  ): Promise<PaginatedResult<FollowUpEntity>> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (performerRole !== UserRole.ADMIN && lead.assignedToId !== performerId && lead.createdById !== performerId) {
      throw new ForbiddenException('You do not have permission to view this lead\'s follow-ups');
    }

    return this.followUpRepository.findByLeadId(leadId, pagination);
  }
}
