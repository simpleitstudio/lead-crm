import { IExportService } from '../../domain/interfaces/services/export.service.interface';
import { IExportHistoryRepository } from '../../domain/interfaces/repositories/export-history.repository.interface';
import { ILeadRepository, LeadFilterParams } from '../../domain/interfaces/repositories/lead.repository.interface';
import { IAuditLogRepository } from '../../domain/interfaces/repositories/audit-log.repository.interface';
import { IUserRepository } from '../../domain/interfaces/repositories/user.repository.interface';
import { ExportHistoryEntity } from '../../domain/entities/export-history.entity';
import { LeadEntity } from '../../domain/entities/lead.entity';
import { UserRole } from '../../domain/enums/user-role.enum';
import { AuditActionType } from '../../domain/enums/audit-action-type.enum';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';

export class ExportService implements IExportService {
  constructor(
    private readonly exportHistoryRepository: IExportHistoryRepository,
    private readonly leadRepository: ILeadRepository,
    private readonly userRepository: IUserRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  public async exportLeads(userId: string, filters: LeadFilterParams, fileType: 'csv' | 'xlsx'): Promise<{ fileName: string; fileBuffer: Buffer }> {
    // Fetch all matching records (override page/limit to fetch all matched)
    const pagination = new PaginationVo(1, 100000);
    const leadsResult = await this.leadRepository.findAll(filters, pagination);
    const leads = leadsResult.data;

    const csvContent = this.serializeToCSV(leads);
    const fileBuffer = Buffer.from(csvContent, 'utf-8');
    const fileName = `leads_export_${Date.now()}.csv`;

    // Save history
    await this.exportHistoryRepository.create({
      userId,
      fileName,
      fileType: 'csv',
      recordCount: leads.length,
      appliedFilters: filters as any,
    });

    // Audit log
    const user = await this.userRepository.findById(userId);
    if (user) {
      await this.auditLogRepository.create({
        userId,
        userName: user.fullName,
        userRole: user.role,
        actionType: AuditActionType.EXPORT_GENERATED,
        entityType: 'ExportHistory',
        newValue: { recordCount: leads.length, filters },
      });
    }

    return { fileName, fileBuffer };
  }

  public async getExportHistory(userId: string, pagination: PaginationVo, performerRole: UserRole): Promise<PaginatedResult<ExportHistoryEntity>> {
    return this.exportHistoryRepository.findByUserId(userId, pagination);
  }

  private serializeToCSV(items: LeadEntity[]): string {
    const headers = [
      'ID', 'Company Name', 'Contact Person', 'Designation', 'Email', 'Phone',
      'Alternate Phone', 'Website', 'Linkedin URL', 'Instagram URL', 'Industry',
      'Business Category', 'Services Interested In', 'Current Business Problem', 'Estimated Budget',
      'Internal Notes', 'Preferred Contact Platform', 'Custom Contact Platform',
      'Existing Software Stack', 'City', 'State', 'Country', 'Source', 'Priority', 'Status', 'Created At'
    ];

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const rows = [headers.join(',')];
    for (const item of items) {
      const row = [
        item.id,
        item.companyName,
        item.contactPerson,
        item.designation,
        item.email,
        item.phone,
        item.alternatePhone,
        item.website,
        item.linkedinUrl,
        item.instagramUrl,
        item.industry,
        item.businessCategory,
        item.servicesInterestedIn,
        item.currentBusinessProblem,
        item.estimatedBudget,
        item.internalNotes,
        item.preferredContactPlatform,
        item.customContactPlatform,
        item.existingSoftwareStack,
        item.city,
        item.state,
        item.country,
        item.source,
        item.priority,
        item.status,
        item.createdAt.toISOString()
      ];
      rows.push(row.map(escapeCSV).join(','));
    }
    return rows.join('\r\n');
  }
}
