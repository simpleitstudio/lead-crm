import { IDuplicateDetectionService } from '../../domain/interfaces/services/duplicate-detection.service.interface';
import { ILeadRepository } from '../../domain/interfaces/repositories/lead.repository.interface';
import { LeadEntity } from '../../domain/entities/lead.entity';

export class DuplicateDetectionService implements IDuplicateDetectionService {
  constructor(private readonly leadRepository: ILeadRepository) {}

  public async findDuplicates(email?: string, phone?: string, website?: string): Promise<LeadEntity[]> {
    return this.leadRepository.findDuplicates(email, phone, website);
  }

  public async checkDuplicate(email?: string, phone?: string, website?: string): Promise<{ isDuplicate: boolean; matches: LeadEntity[] }> {
    const matches = await this.findDuplicates(email, phone, website);
    return {
      isDuplicate: matches.length > 0,
      matches,
    };
  }
}
