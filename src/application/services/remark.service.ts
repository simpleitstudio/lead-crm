import { IRemarkService } from '../../domain/interfaces/services/remark.service.interface';
import { IRemarkRepository } from '../../domain/interfaces/repositories/remark.repository.interface';
import { ILeadRepository } from '../../domain/interfaces/repositories/lead.repository.interface';
import { IActivityRepository } from '../../domain/interfaces/repositories/activity.repository.interface';
import { RemarkEntity } from '../../domain/entities/remark.entity';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';
import { UserRole } from '../../domain/enums/user-role.enum';
import { ActionType } from '../../domain/enums/action-type.enum';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';

export class RemarkService implements IRemarkService {
  constructor(
    private readonly remarkRepository: IRemarkRepository,
    private readonly leadRepository: ILeadRepository,
    private readonly activityRepository: IActivityRepository
  ) {}

  public async createRemark(leadId: string, content: string, performerId: string): Promise<RemarkEntity> {
    const lead = await this.leadRepository.findById(leadId);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const remark = await this.remarkRepository.create({
      leadId,
      authorId: performerId,
      content,
      contentHtml: content, // Simple editor-agnostic content mapping
    });

    await this.activityRepository.create({
      leadId,
      userId: performerId,
      actionType: ActionType.REMARK_ADDED,
      description: `Added a remark: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
    });

    return remark;
  }

  public async updateRemark(id: string, content: string, performerId: string, performerRole: UserRole): Promise<RemarkEntity> {
    const remark = await this.remarkRepository.findById(id);
    if (!remark) {
      throw new NotFoundException('Remark not found');
    }

    if (performerRole !== UserRole.ADMIN && remark.authorId !== performerId) {
      throw new ForbiddenException('You do not have permission to update this remark');
    }

    const updatedRemark = await this.remarkRepository.update(id, {
      content,
      contentHtml: content,
    });

    await this.activityRepository.create({
      leadId: remark.leadId,
      userId: performerId,
      actionType: ActionType.REMARK_EDITED,
      description: `Updated a remark`,
    });

    return updatedRemark;
  }

  public async deleteRemark(id: string, performerId: string, performerRole: UserRole): Promise<void> {
    const remark = await this.remarkRepository.findById(id);
    if (!remark) {
      throw new NotFoundException('Remark not found');
    }

    if (performerRole !== UserRole.ADMIN && remark.authorId !== performerId) {
      throw new ForbiddenException('You do not have permission to delete this remark');
    }

    await this.remarkRepository.softDelete(id, performerId);

    await this.activityRepository.create({
      leadId: remark.leadId,
      userId: performerId,
      actionType: ActionType.REMARK_DELETED,
      description: `Deleted a remark`,
    });
  }

  public async getRemarksByLeadId(leadId: string, pagination: PaginationVo, performerId: string, performerRole: UserRole): Promise<PaginatedResult<RemarkEntity>> {
    return this.remarkRepository.findByLeadId(leadId, pagination);
  }
}
