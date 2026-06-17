import { FollowUpEntity } from '../../entities';
import { FollowUpStatus, UserRole } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface IFollowUpService {
  createFollowUp(
    leadId: string,
    assignedToId: string,
    scheduledAt: Date,
    note: string | undefined,
    performerId: string,
    performerRole: UserRole
  ): Promise<FollowUpEntity>;
  completeFollowUp(id: string, completionNote: string | undefined, performerId: string, performerRole: UserRole): Promise<FollowUpEntity>;
  cancelFollowUp(id: string, performerId: string, performerRole: UserRole): Promise<FollowUpEntity>;
  getFollowUpsForUser(userId: string, status?: FollowUpStatus, pagination?: PaginationVo): Promise<PaginatedResult<FollowUpEntity>>;
  getFollowUpsByLead(leadId: string, pagination: PaginationVo, performerId: string, performerRole: UserRole): Promise<PaginatedResult<FollowUpEntity>>;
  getOverdueFollowUps(userId?: string): Promise<FollowUpEntity[]>;
  getDueTodayFollowUps(userId?: string): Promise<FollowUpEntity[]>;
  getUpcomingFollowUps(userId?: string, pagination?: PaginationVo): Promise<PaginatedResult<FollowUpEntity>>;
}
