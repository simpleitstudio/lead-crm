import { prisma } from '../database/prisma.client';
import { LeadEntity } from '../../domain/entities/lead.entity';
import { LeadStatus } from '../../domain/enums/lead-status.enum';
import { LeadPriority } from '../../domain/enums/lead-priority.enum';
import { LeadSource } from '../../domain/enums/lead-source.enum';
import { LostReason } from '../../domain/enums/lost-reason.enum';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { ILeadRepository, CreateLeadData, UpdateLeadData, LeadFilterParams } from '../../domain/interfaces/repositories/lead.repository.interface';

export class LeadRepository implements ILeadRepository {
  private buildWhereClause(filters: LeadFilterParams): any {
    const where: any = {};

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.source) {
      where.source = filters.source;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.country) {
      where.country = { equals: filters.country, mode: 'insensitive' };
    }

    if (filters.industry) {
      where.industry = { equals: filters.industry, mode: 'insensitive' };
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
      }
    }

    if (filters.search) {
      where.OR = [
        { companyName: { contains: filters.search, mode: 'insensitive' } },
        { contactPerson: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
        { website: { contains: filters.search, mode: 'insensitive' } },
        { servicesInterestedIn: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  public async findById(id: string): Promise<LeadEntity | null> {
    const lead = await prisma.lead.findFirst({
      where: { id },
    });
    return lead ? LeadEntity.fromPrisma(lead) : null;
  }

  public async findAll(filters: LeadFilterParams, pagination: PaginationVo): Promise<PaginatedResult<LeadEntity>> {
    const where = this.buildWhereClause(filters);
    const [items, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    return createPaginatedResult(
      items.map(item => LeadEntity.fromPrisma(item)),
      total,
      pagination
    );
  }

  public async findByAssignedUser(userId: string, filters: LeadFilterParams, pagination: PaginationVo): Promise<PaginatedResult<LeadEntity>> {
    const combinedFilters = { ...filters, assignedToId: userId };
    return this.findAll(combinedFilters, pagination);
  }

  public async findDuplicates(email?: string, phone?: string, website?: string): Promise<LeadEntity[]> {
    if (!email && !phone && !website) return [];

    const conditions: any[] = [];
    if (email) conditions.push({ email: { equals: email, mode: 'insensitive' } });
    if (phone) conditions.push({ phone: { equals: phone, mode: 'insensitive' } });
    if (website) conditions.push({ website: { equals: website, mode: 'insensitive' } });

    const leads = await prisma.lead.findMany({
      where: {
        deletedAt: null,
        OR: conditions,
      },
    });

    return leads.map(lead => LeadEntity.fromPrisma(lead));
  }

  public async create(data: CreateLeadData): Promise<LeadEntity> {
    const lead = await prisma.lead.create({
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        designation: data.designation ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        alternatePhone: data.alternatePhone ?? null,
        website: data.website ?? null,
        linkedinUrl: data.linkedinUrl ?? null,
        instagramUrl: data.instagramUrl ?? null,
        industry: data.industry ?? null,
        businessCategory: data.businessCategory ?? null,
        existingSoftwareStack: data.existingSoftwareStack ?? null,
        servicesInterestedIn: data.servicesInterestedIn ?? null,
        currentBusinessProblem: data.currentBusinessProblem ?? null,
        estimatedBudget: data.estimatedBudget ?? null,
        internalNotes: data.internalNotes ?? null,
        preferredContactPlatform: data.preferredContactPlatform ?? null,
        customContactPlatform: data.customContactPlatform ?? null,
        city: data.city ?? null,
        state: data.state ?? null,
        country: data.country ?? null,
        source: data.source,
        priority: data.priority,
        status: data.status ?? LeadStatus.NEW,
        assignedToId: data.assignedToId ?? null,
        assignedAt: data.assignedAt ?? null,
        createdById: data.createdById,
      },
    });
    return LeadEntity.fromPrisma(lead);
  }

  public async createMany(data: CreateLeadData[]): Promise<number> {
    const count = await prisma.lead.createMany({
      data: data.map(d => ({
        companyName: d.companyName,
        contactPerson: d.contactPerson,
        designation: d.designation ?? null,
        email: d.email ?? null,
        phone: d.phone ?? null,
        alternatePhone: d.alternatePhone ?? null,
        website: d.website ?? null,
        linkedinUrl: d.linkedinUrl ?? null,
        instagramUrl: d.instagramUrl ?? null,
        industry: d.industry ?? null,
        businessCategory: d.businessCategory ?? null,
        existingSoftwareStack: d.existingSoftwareStack ?? null,
        servicesInterestedIn: d.servicesInterestedIn ?? null,
        currentBusinessProblem: d.currentBusinessProblem ?? null,
        estimatedBudget: d.estimatedBudget ?? null,
        internalNotes: d.internalNotes ?? null,
        preferredContactPlatform: d.preferredContactPlatform ?? null,
        customContactPlatform: d.customContactPlatform ?? null,
        city: d.city ?? null,
        state: d.state ?? null,
        country: d.country ?? null,
        source: d.source,
        priority: d.priority,
        status: d.status ?? LeadStatus.NEW,
        assignedToId: d.assignedToId ?? null,
        assignedAt: d.assignedAt ?? null,
        createdById: d.createdById,
      })),
    });
    return count.count;
  }

  public async update(id: string, data: UpdateLeadData): Promise<LeadEntity> {
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        designation: data.designation,
        email: data.email,
        phone: data.phone,
        alternatePhone: data.alternatePhone,
        website: data.website,
        linkedinUrl: data.linkedinUrl,
        instagramUrl: data.instagramUrl,
        industry: data.industry,
        businessCategory: data.businessCategory,
        existingSoftwareStack: data.existingSoftwareStack,
        servicesInterestedIn: data.servicesInterestedIn,
        currentBusinessProblem: data.currentBusinessProblem,
        estimatedBudget: data.estimatedBudget,
        internalNotes: data.internalNotes,
        preferredContactPlatform: data.preferredContactPlatform,
        customContactPlatform: data.customContactPlatform,
        city: data.city,
        state: data.state,
        country: data.country,
        source: data.source,
        priority: data.priority,
        status: data.status,
        lostReason: data.lostReason ? (data.lostReason as LostReason) : null,
        lostReasonNote: data.lostReasonNote,
        assignedToId: data.assignedToId,
        assignedAt: data.assignedAt,
        updatedById: data.updatedById,
      },
    });
    return LeadEntity.fromPrisma(lead);
  }

  public async softDelete(id: string, deletedById: string): Promise<void> {
    await prisma.lead.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    });
  }

  public async restore(id: string): Promise<void> {
    await prisma.lead.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
      },
    });
  }

  public async count(filters?: LeadFilterParams): Promise<number> {
    const where = filters ? this.buildWhereClause(filters) : { deletedAt: null };
    return prisma.lead.count({ where });
  }

  public async countByStatus(): Promise<Record<string, number>> {
    const results = await prisma.lead.groupBy({
      by: ['status'],
      _count: { id: true },
      where: { deletedAt: null },
    });
    const counts: Record<string, number> = {};
    results.forEach(res => {
      counts[res.status] = res._count.id;
    });
    return counts;
  }

  public async countBySource(): Promise<Record<string, number>> {
    const results = await prisma.lead.groupBy({
      by: ['source'],
      _count: { id: true },
      where: { deletedAt: null },
    });
    const counts: Record<string, number> = {};
    results.forEach(res => {
      counts[res.source] = res._count.id;
    });
    return counts;
  }

  public async countByPriority(): Promise<Record<string, number>> {
    const results = await prisma.lead.groupBy({
      by: ['priority'],
      _count: { id: true },
      where: { deletedAt: null },
    });
    const counts: Record<string, number> = {};
    results.forEach(res => {
      counts[res.priority] = res._count.id;
    });
    return counts;
  }

  public async countCreatedInRange(startDate: Date, endDate: Date): Promise<number> {
    return prisma.lead.count({
      where: {
        deletedAt: null,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  public async countWonInRange(startDate: Date, endDate: Date): Promise<number> {
    return prisma.lead.count({
      where: {
        deletedAt: null,
        status: LeadStatus.WON,
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  public async countLostInRange(startDate: Date, endDate: Date): Promise<number> {
    return prisma.lead.count({
      where: {
        deletedAt: null,
        status: LeadStatus.LOST,
        updatedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }

  public async search(query: string, pagination: PaginationVo): Promise<PaginatedResult<LeadEntity>> {
    return this.findAll({ search: query }, pagination);
  }
}
