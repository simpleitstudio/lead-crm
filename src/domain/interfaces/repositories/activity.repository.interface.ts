import { ActivityEntity } from '../../entities';
import { ActionType } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateActivityData {
  leadId: string;
  userId: string;
  actionType: ActionType;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface IActivityRepository {
  findByLeadId(leadId: string, pagination: PaginationVo): Promise<PaginatedResult<ActivityEntity>>;
  findByUserId(userId: string, pagination: PaginationVo): Promise<PaginatedResult<ActivityEntity>>;
  create(data: CreateActivityData): Promise<ActivityEntity>;
  countByUserId(userId: string): Promise<number>;
}
