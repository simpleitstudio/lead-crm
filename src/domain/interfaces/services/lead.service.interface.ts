import { LeadEntity } from '../../entities';
import { CreateLeadData, UpdateLeadData, LeadFilterParams } from '../repositories/lead.repository.interface';
import { PaginatedResult, PaginationVo } from '../../value-objects';
import { UserRole } from '../../enums';

export interface ILeadService {
  createLead(data: Omit<CreateLeadData, 'createdById'>, performerId: string): Promise<LeadEntity>;
  updateLead(id: string, data: Omit<UpdateLeadData, 'updatedById'>, performerId: string, performerRole: UserRole): Promise<LeadEntity>;
  getLeadById(id: string, performerId: string, performerRole: UserRole): Promise<LeadEntity>;
  getLeads(filters: LeadFilterParams, pagination: PaginationVo, performerId: string, performerRole: UserRole): Promise<PaginatedResult<LeadEntity>>;
  assignLead(id: string, assignedToId: string | null, performerId: string, performerRole: UserRole): Promise<LeadEntity>;
  deleteLead(id: string, performerId: string, performerRole: UserRole): Promise<void>;
  checkDuplicate(email?: string, phone?: string, website?: string): Promise<LeadEntity[]>;
}
