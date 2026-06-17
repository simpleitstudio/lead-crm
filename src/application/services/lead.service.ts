import { ILeadService } from '../../domain/interfaces/services/lead.service.interface';
import { ILeadRepository, CreateLeadData, UpdateLeadData, LeadFilterParams } from '../../domain/interfaces/repositories/lead.repository.interface';
import { IActivityRepository } from '../../domain/interfaces/repositories/activity.repository.interface';
import { INotificationRepository } from '../../domain/interfaces/repositories/notification.repository.interface';
import { IAuditLogRepository } from '../../domain/interfaces/repositories/audit-log.repository.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { LeadEntity } from '../../domain/entities/lead.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { LeadStatus } from '../../domain/enums/lead-status.enum';
import { ActionType } from '../../domain/enums/action-type.enum';
import { AuditActionType } from '../../domain/enums/audit-action-type.enum';
import { NotificationPriority } from '../../domain/enums/notification-priority.enum';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';

export class LeadService implements ILeadService {
  constructor(
    private readonly leadRepository: ILeadRepository,
    private readonly userRepository: IUserRepository,
    private readonly activityRepository: IActivityRepository,
    private readonly notificationRepository: INotificationRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  public async createLead(data: Omit<CreateLeadData, 'createdById'>, performerId: string): Promise<LeadEntity> {
    const lead = await this.leadRepository.create({
      ...data,
      createdById: performerId,
    });

    await this.activityRepository.create({
      leadId: lead.id,
      userId: performerId,
      actionType: ActionType.LEAD_CREATED,
      description: `Lead created for company "${lead.companyName}"`,
    });

    const user = await this.userRepository.findById(performerId);
    if (user) {
      await this.auditLogRepository.create({
        userId: performerId,
        userName: user.fullName,
        userRole: user.role,
        actionType: AuditActionType.LEAD_CREATED,
        entityType: 'Lead',
        entityId: lead.id,
        newValue: JSON.parse(JSON.stringify(lead)),
      });
    }

    if (data.assignedToId) {
      await this.handleAssignmentNotification(lead, data.assignedToId, performerId, user);
    }

    return lead;
  }

  public async updateLead(id: string, data: Omit<UpdateLeadData, 'updatedById'>, performerId: string, performerRole: UserRole): Promise<LeadEntity> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (performerRole !== UserRole.ADMIN && lead.assignedToId !== performerId && lead.createdById !== performerId) {
      throw new ForbiddenException('You do not have permission to update this lead');
    }

    const oldLead = JSON.parse(JSON.stringify(lead));

    const statusChanged = data.status && data.status !== lead.status;
    if (statusChanged) {
      const isAdmin = performerRole === UserRole.ADMIN;
      lead.transitionTo(data.status!, isAdmin);
    }

    const assignedToIdChanged = data.assignedToId !== undefined && data.assignedToId !== lead.assignedToId;
    if (assignedToIdChanged) {
      if (performerRole !== UserRole.ADMIN) {
        throw new ForbiddenException('Only administrators can assign leads');
      }
      if (data.assignedToId) {
        lead.assign(data.assignedToId, performerId);
      } else {
        lead.assignedToId = null;
        lead.assignedAt = null;
      }
    }

    const updated = await this.leadRepository.update(id, {
      ...data,
      status: lead.status,
      assignedToId: lead.assignedToId,
      assignedAt: lead.assignedAt,
      updatedById: performerId,
    });

    if (statusChanged) {
      await this.activityRepository.create({
        leadId: lead.id,
        userId: performerId,
        actionType: ActionType.STATUS_CHANGED,
        description: `Status changed from "${oldLead.status}" to "${lead.status}"`,
      });
    }

    if (assignedToIdChanged) {
      await this.activityRepository.create({
        leadId: lead.id,
        userId: performerId,
        actionType: ActionType.LEAD_ASSIGNED,
        description: lead.assignedToId ? `Lead assigned to salesperson` : `Lead unassigned`,
      });

      if (lead.assignedToId) {
        const assignee = await this.userRepository.findById(lead.assignedToId);
        if (assignee) {
          await this.notificationRepository.create({
            title: 'New Lead Assigned',
            message: `Lead "${lead.companyName}" has been assigned to you.`,
            priority: NotificationPriority.INFO,
            recipientId: lead.assignedToId,
            isGlobal: false,
            createdById: performerId,
          });
        }
      }
    }

    const performer = await this.userRepository.findById(performerId);
    if (performer) {
      // 1. Log overall LEAD_UPDATED action
      await this.auditLogRepository.create({
        userId: performerId,
        userName: performer.fullName,
        userRole: performer.role,
        actionType: AuditActionType.LEAD_UPDATED,
        entityType: 'Lead',
        entityId: lead.id,
        previousValue: oldLead,
        newValue: JSON.parse(JSON.stringify(updated)),
      });

      // 2. Log assignment audit log
      if (assignedToIdChanged) {
        const auditAction = lead.assignedToId
          ? (oldLead.assignedToId ? AuditActionType.LEAD_REASSIGNED : AuditActionType.LEAD_ASSIGNED)
          : AuditActionType.LEAD_ASSIGNED;
        await this.auditLogRepository.create({
          userId: performerId,
          userName: performer.fullName,
          userRole: performer.role,
          actionType: auditAction,
          entityType: 'Lead',
          entityId: lead.id,
          previousValue: oldLead.assignedToId ? { assignedToId: oldLead.assignedToId } : undefined,
          newValue: lead.assignedToId ? { assignedToId: lead.assignedToId } : undefined,
        });
      }

      // 3. Log granular updates if specific fields changed
      if (data.servicesInterestedIn !== undefined && data.servicesInterestedIn !== oldLead.servicesInterestedIn) {
        await this.auditLogRepository.create({
          userId: performerId,
          userName: performer.fullName,
          userRole: performer.role,
          actionType: AuditActionType.SERVICE_INTEREST_UPDATED,
          entityType: 'Lead',
          entityId: lead.id,
          previousValue: { servicesInterestedIn: oldLead.servicesInterestedIn },
          newValue: { servicesInterestedIn: data.servicesInterestedIn },
        });
      }

      if (data.estimatedBudget !== undefined && data.estimatedBudget !== oldLead.estimatedBudget) {
        await this.auditLogRepository.create({
          userId: performerId,
          userName: performer.fullName,
          userRole: performer.role,
          actionType: AuditActionType.BUDGET_UPDATED,
          entityType: 'Lead',
          entityId: lead.id,
          previousValue: { estimatedBudget: oldLead.estimatedBudget },
          newValue: { estimatedBudget: data.estimatedBudget },
        });
      }

      if (data.internalNotes !== undefined && data.internalNotes !== oldLead.internalNotes) {
        await this.auditLogRepository.create({
          userId: performerId,
          userName: performer.fullName,
          userRole: performer.role,
          actionType: AuditActionType.INTERNAL_NOTES_UPDATED,
          entityType: 'Lead',
          entityId: lead.id,
          previousValue: { internalNotes: oldLead.internalNotes },
          newValue: { internalNotes: data.internalNotes },
        });
      }
    }

    return updated;
  }

  public async getLeadById(id: string, performerId: string, performerRole: UserRole): Promise<LeadEntity> {
    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    if (performerRole !== UserRole.ADMIN && lead.assignedToId !== performerId && lead.createdById !== performerId) {
      throw new ForbiddenException('You do not have permission to view this lead');
    }

    // Strip internal notes if user is not ADMIN or the assigned salesperson
    if (performerRole !== UserRole.ADMIN && lead.assignedToId !== performerId) {
      lead.internalNotes = null;
    }

    return lead;
  }

  public async getLeads(filters: LeadFilterParams, pagination: PaginationVo, performerId: string, performerRole: UserRole): Promise<PaginatedResult<LeadEntity>> {
    const filtersCopy = { ...filters };
    if (performerRole !== UserRole.ADMIN) {
      if (performerRole === UserRole.SALES) {
        filtersCopy.assignedToId = performerId;
      } else if (performerRole === UserRole.LEAD_GENERATOR) {
        filtersCopy.createdById = performerId;
      }
    }

    const result = await this.leadRepository.findAll(filtersCopy, pagination);

    // Strip internal notes for non-authorized users (lead generators or unassigned sales reps)
    result.data.forEach(lead => {
      if (performerRole !== UserRole.ADMIN && lead.assignedToId !== performerId) {
        lead.internalNotes = null;
      }
    });

    return result;
  }

  public async assignLead(id: string, assignedToId: string | null, performerId: string, performerRole: UserRole): Promise<LeadEntity> {
    if (performerRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can assign leads');
    }

    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    const oldLead = JSON.parse(JSON.stringify(lead));
    const performer = await this.userRepository.findById(performerId);

    if (assignedToId) {
      lead.assign(assignedToId, performerId);
    } else {
      lead.assignedToId = null;
      lead.assignedAt = null;
    }

    const updated = await this.leadRepository.update(id, {
      assignedToId: lead.assignedToId,
      assignedAt: lead.assignedAt,
      status: lead.status,
      updatedById: performerId,
    });

    await this.activityRepository.create({
      leadId: lead.id,
      userId: performerId,
      actionType: ActionType.LEAD_ASSIGNED,
      description: assignedToId ? `Lead assigned to salesperson` : `Lead unassigned`,
    });

    if (performer) {
      await this.auditLogRepository.create({
        userId: performerId,
        userName: performer.fullName,
        userRole: performer.role,
        actionType: AuditActionType.LEAD_ASSIGNED,
        entityType: 'Lead',
        entityId: lead.id,
        previousValue: oldLead,
        newValue: JSON.parse(JSON.stringify(updated)),
      });
    }

    if (assignedToId) {
      const assignee = await this.userRepository.findById(assignedToId);
      if (assignee) {
        await this.notificationRepository.create({
          title: 'New Lead Assigned',
          message: `Lead "${lead.companyName}" has been assigned to you.`,
          priority: NotificationPriority.INFO,
          recipientId: assignedToId,
          isGlobal: false,
          createdById: performerId,
        });
      }
    }

    return updated;
  }

  public async deleteLead(id: string, performerId: string, performerRole: UserRole): Promise<void> {
    if (performerRole !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can delete leads');
    }

    const lead = await this.leadRepository.findById(id);
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.leadRepository.softDelete(id, performerId);

    const performer = await this.userRepository.findById(performerId);
    if (performer) {
      await this.auditLogRepository.create({
        userId: performerId,
        userName: performer.fullName,
        userRole: performer.role,
        actionType: AuditActionType.LEAD_DELETED,
        entityType: 'Lead',
        entityId: lead.id,
      });
    }
  }

  public async checkDuplicate(email?: string, phone?: string, website?: string): Promise<LeadEntity[]> {
    return this.leadRepository.findDuplicates(email, phone, website);
  }

  private async handleAssignmentNotification(lead: LeadEntity, assignedToId: string, performerId: string, performer: any): Promise<void> {
    await this.activityRepository.create({
      leadId: lead.id,
      userId: performerId,
      actionType: ActionType.LEAD_ASSIGNED,
      description: `Lead assigned to salesperson`,
    });

    await this.notificationRepository.create({
      title: 'New Lead Assigned',
      message: `Lead "${lead.companyName}" has been assigned to you.`,
      priority: NotificationPriority.INFO,
      recipientId: assignedToId,
      isGlobal: false,
      createdById: performerId,
    });
  }
}

