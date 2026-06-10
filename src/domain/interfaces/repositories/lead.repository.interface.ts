import { LeadEntity } from '../../entities';
import { LeadStatus, LeadPriority, LeadSource } from '../../enums';
import { PaginatedResult, PaginationVo } from '../../value-objects';

export interface CreateLeadData {
  companyName: string;
  contactPerson: string;
  designation?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  industry?: string;
  businessCategory?: string;
  existingSoftwareStack?: string;
  servicesInterestedIn?: string;
  currentBusinessProblem?: string;
  estimatedBudget?: string;
  internalNotes?: string;
  preferredContactPlatform?: string;
  customContactPlatform?: string;
  city?: string;
  state?: string;
  country?: string;
  source: LeadSource;
  priority: LeadPriority;
  status?: LeadStatus;
  assignedToId?: string;
  assignedAt?: Date;
  createdById: string;
}

export interface UpdateLeadData {
  companyName?: string;
  contactPerson?: string;
  designation?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  website?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  industry?: string;
  businessCategory?: string;
  existingSoftwareStack?: string;
  servicesInterestedIn?: string;
  currentBusinessProblem?: string;
  estimatedBudget?: string;
  internalNotes?: string;
  preferredContactPlatform?: string;
  customContactPlatform?: string;
  city?: string;
  state?: string;
  country?: string;
  source?: LeadSource;
  priority?: LeadPriority;
  status?: LeadStatus;
  lostReason?: string;
  lostReasonNote?: string;
  assignedToId?: string | null;
  assignedAt?: Date | null;
  updatedById: string;
}

export interface LeadFilterParams {
  status?: LeadStatus;
  priority?: LeadPriority;
  source?: LeadSource;
  assignedToId?: string;
  createdById?: string;
  country?: string;
  industry?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  includeDeleted?: boolean;
}

export interface ILeadRepository {
  findById(id: string): Promise<LeadEntity | null>;
  findAll(filters: LeadFilterParams, pagination: PaginationVo): Promise<PaginatedResult<LeadEntity>>;
  findByAssignedUser(userId: string, filters: LeadFilterParams, pagination: PaginationVo): Promise<PaginatedResult<LeadEntity>>;
  findDuplicates(email?: string, phone?: string, website?: string): Promise<LeadEntity[]>;
  create(data: CreateLeadData): Promise<LeadEntity>;
  createMany(data: CreateLeadData[]): Promise<number>;
  update(id: string, data: UpdateLeadData): Promise<LeadEntity>;
  softDelete(id: string, deletedById: string): Promise<void>;
  restore(id: string): Promise<void>;
  count(filters?: LeadFilterParams): Promise<number>;
  countByStatus(): Promise<Record<string, number>>;
  countBySource(): Promise<Record<string, number>>;
  countByPriority(): Promise<Record<string, number>>;
  countCreatedInRange(startDate: Date, endDate: Date): Promise<number>;
  countWonInRange(startDate: Date, endDate: Date): Promise<number>;
  countLostInRange(startDate: Date, endDate: Date): Promise<number>;
  search(query: string, pagination: PaginationVo): Promise<PaginatedResult<LeadEntity>>;
}
