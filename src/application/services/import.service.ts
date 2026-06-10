import { IImportService } from '../../domain/interfaces/services/import.service.interface';
import { IImportHistoryRepository } from '../../domain/interfaces/repositories/import-history.repository.interface';
import { ILeadRepository } from '../../domain/interfaces/repositories/lead.repository.interface';
import { IAuditLogRepository } from '../../domain/interfaces/repositories/audit-log.repository.interface';
import { ImportHistoryEntity } from '../../domain/entities/import-history.entity';
import { ImportStatus } from '../../domain/enums/import-status.enum';
import { LeadPriority } from '../../domain/enums/lead-priority.enum';
import { LeadSource } from '../../domain/enums/lead-source.enum';
import { LeadStatus } from '../../domain/enums/lead-status.enum';
import { UserRole } from '../../domain/enums/user-role.enum';
import { AuditActionType } from '../../domain/enums/audit-action-type.enum';
import { ForbiddenException } from '../../domain/exceptions/forbidden.exception';
import { NotFoundException } from '../../domain/exceptions/not-found.exception';
import { PaginatedResult, PaginationVo } from '../../domain/value-objects/pagination.vo';

export class ImportService implements IImportService {
  constructor(
    private readonly importHistoryRepository: IImportHistoryRepository,
    private readonly leadRepository: ILeadRepository,
    private readonly auditLogRepository: IAuditLogRepository
  ) {}

  public async importLeads(userId: string, fileName: string, fileBuffer: Buffer): Promise<ImportHistoryEntity> {
    const csvContent = fileBuffer.toString('utf8');
    const records = this.parseCSV(csvContent);

    // Create a pending history entry
    const history = await this.importHistoryRepository.create({
      userId,
      fileName,
      totalRows: records.length,
      successCount: 0,
      failureCount: 0,
      duplicateCount: 0,
      errorReport: null,
      status: ImportStatus.PENDING,
      startedAt: new Date(),
    });

    try {
      await this.importHistoryRepository.update(history.id, {
        status: ImportStatus.PROCESSING,
      });

      const uniqueLeads: any[] = [];
      const errorReport: Record<string, unknown>[] = [];
      let successCount = 0;
      let failureCount = 0;
      let duplicateCount = 0;

      for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const rowNum = i + 2; // header is row 1, index 0 is row 2

        try {
          const companyName = row['companyName'] || row['Company Name'] || row['company_name'];
          const contactPerson = row['contactPerson'] || row['Contact Person'] || row['contact_person'];
          const email = row['email'] || row['Email'];
          const phone = row['phone'] || row['Phone'];
          const website = row['website'] || row['Website'] || row['website_url'];
          
          if (!companyName || !contactPerson) {
            throw new Error(`Row ${rowNum}: Company Name and Contact Person are required.`);
          }

          // Check for duplicate in DB
          const duplicates = await this.leadRepository.findDuplicates(email, phone, website);
          if (duplicates.length > 0) {
            duplicateCount++;
            errorReport.push({
              row: rowNum,
              companyName,
              error: 'Duplicate lead found in CRM matching Email, Phone, or Website.',
            });
            continue;
          }

          // Map priority
          let priority = LeadPriority.MEDIUM;
          const rawPriority = (row['priority'] || row['Priority'] || '').toUpperCase();
          if (Object.values(LeadPriority).includes(rawPriority as any)) {
            priority = rawPriority as LeadPriority;
          }

          // Map source
          let source = LeadSource.OTHER;
          const rawSource = (row['source'] || row['Source'] || '').toUpperCase();
          if (Object.values(LeadSource).includes(rawSource as any)) {
            source = rawSource as LeadSource;
          }

          uniqueLeads.push({
            companyName,
            contactPerson,
            designation: row['designation'] || row['Designation'] || null,
            email: email || null,
            phone: phone || null,
            alternatePhone: row['alternatePhone'] || row['Alternate Phone'] || null,
            website: website || null,
            linkedinUrl: row['linkedinUrl'] || row['Linkedin Url'] || null,
            instagramUrl: row['instagramUrl'] || row['Instagram Url'] || null,
            industry: row['industry'] || row['Industry'] || null,
            businessCategory: row['businessCategory'] || row['Business Category'] || null,
            existingSoftwareStack: row['existingSoftwareStack'] || row['Software Stack'] || null,
            servicesInterestedIn: row['servicesInterestedIn'] || row['Services Interested In'] || null,
            currentBusinessProblem: row['currentBusinessProblem'] || row['Current Business Problem'] || null,
            estimatedBudget: row['estimatedBudget'] || row['Estimated Budget'] || null,
            internalNotes: row['internalNotes'] || row['Internal Notes'] || null,
            preferredContactPlatform: row['preferredContactPlatform'] || row['Preferred Contact Platform'] || null,
            customContactPlatform: row['customContactPlatform'] || row['Custom Contact Platform'] || null,
            city: row['city'] || row['City'] || null,
            state: row['state'] || row['State'] || null,
            country: row['country'] || row['Country'] || null,
            source,
            priority,
            status: LeadStatus.NEW,
            createdById: userId,
          });

          successCount++;
        } catch (err: any) {
          failureCount++;
          errorReport.push({
            row: rowNum,
            error: err.message || 'Unknown processing error',
          });
        }
      }

      // Bulk create unique leads
      if (uniqueLeads.length > 0) {
        await this.leadRepository.createMany(uniqueLeads);
      }

      const completed = await this.importHistoryRepository.update(history.id, {
        status: ImportStatus.COMPLETED,
        successCount,
        failureCount,
        duplicateCount,
        errorReport: errorReport.length > 0 ? errorReport : null,
        completedAt: new Date(),
      });

      // Audit Log
      await this.auditLogRepository.create({
        userId,
        userName: 'System Import',
        userRole: UserRole.ADMIN,
        actionType: AuditActionType.IMPORT_COMPLETED,
        entityType: 'ImportHistory',
        entityId: history.id,
        newValue: { successCount, failureCount, duplicateCount },
      });

      return completed;
    } catch (error) {
      const failed = await this.importHistoryRepository.update(history.id, {
        status: ImportStatus.FAILED,
        completedAt: new Date(),
      });
      throw error;
    }
  }

  public async getImportHistory(
    userId: string,
    pagination: PaginationVo,
    performerRole: UserRole
  ): Promise<PaginatedResult<ImportHistoryEntity>> {
    // Only Admin can see import histories of all, others see their own
    return this.importHistoryRepository.findByUserId(userId, pagination);
  }

  public async getImportHistoryDetail(id: string, performerId: string, performerRole: UserRole): Promise<ImportHistoryEntity> {
    const history = await this.importHistoryRepository.findById(id);
    if (!history) {
      throw new NotFoundException('Import history not found');
    }
    if (performerRole !== UserRole.ADMIN && history.userId !== performerId) {
      throw new ForbiddenException('You do not have permission to view this import history detail');
    }
    return history;
  }

  private parseCSV(csvContent: string): Record<string, string>[] {
    const lines = csvContent.split(/\r?\n/);
    if (lines.length === 0 || !lines[0].trim()) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const records: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values: string[] = [];
      let currentVal = '';
      let insideQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentVal.trim().replace(/^["']|["']$/g, ''));
          currentVal = '';
        } else {
          currentVal += char;
        }
      }
      values.push(currentVal.trim().replace(/^["']|["']$/g, ''));

      const record: Record<string, string> = {};
      headers.forEach((header, idx) => {
        record[header] = values[idx] || '';
      });
      records.push(record);
    }

    return records;
  }
}
