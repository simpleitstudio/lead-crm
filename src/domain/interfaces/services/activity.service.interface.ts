import { ActivityEntity } from '../../entities';
import { ActionType, UserRole } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface IActivityService {
  getActivitiesByLead(leadId: string, pagination: PaginationVo, performerId: string, performerRole: UserRole): Promise<PaginatedResult<ActivityEntity>>;
  createActivity(
    leadId: string,
    userId: string,
    actionType: ActionType,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<ActivityEntity>;
}
