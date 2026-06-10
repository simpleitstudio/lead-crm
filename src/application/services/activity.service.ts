import { IActivityService } from '../../domain/interfaces/services/activity.service.interface';
import { IActivityRepository } from '../../domain/interfaces/repositories/activity.repository.interface';
import { ActivityEntity } from '../../domain/entities/activity.entity';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';
import { ActionType } from '../../domain/enums/action-type.enum';
import { UserRole } from '../../domain/enums/user-role.enum';

export class ActivityService implements IActivityService {
  constructor(private readonly activityRepository: IActivityRepository) {}

  public async getActivitiesByLead(
    leadId: string,
    pagination: PaginationVo,
    performerId: string,
    performerRole: UserRole
  ): Promise<PaginatedResult<ActivityEntity>> {
    // Lead authorization is checked in the LeadService, so this service just fetches data
    return this.activityRepository.findByLeadId(leadId, pagination);
  }

  public async createActivity(
    leadId: string,
    userId: string,
    actionType: ActionType,
    description: string,
    metadata?: Record<string, unknown>
  ): Promise<ActivityEntity> {
    return this.activityRepository.create({
      leadId,
      userId,
      actionType,
      description,
      metadata,
    });
  }
}
