import { FollowUpEntity } from '../../entities';
import { FollowUpStatus } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateFollowUpData {
  leadId: string;
  assignedToId: string;
  createdById: string;
  scheduledAt: Date;
  note?: string;
}

export interface IFollowUpRepository {
  findById(id: string): Promise<FollowUpEntity | null>;
  findByLeadId(leadId: string, pagination: PaginationVo): Promise<PaginatedResult<FollowUpEntity>>;
  findByAssignedUser(userId: string, status?: FollowUpStatus, pagination?: PaginationVo): Promise<PaginatedResult<FollowUpEntity>>;
  findOverdue(userId?: string): Promise<FollowUpEntity[]>;
  findDueToday(userId?: string): Promise<FollowUpEntity[]>;
  findUpcoming(userId?: string, pagination?: PaginationVo): Promise<PaginatedResult<FollowUpEntity>>;
  create(data: CreateFollowUpData): Promise<FollowUpEntity>;
  update(id: string, data: Partial<FollowUpEntity>): Promise<FollowUpEntity>;
  complete(id: string, completionNote?: string): Promise<FollowUpEntity>;
  cancel(id: string): Promise<FollowUpEntity>;
  countByStatus(userId?: string): Promise<Record<string, number>>;
  countOverdue(userId?: string): Promise<number>;
}
