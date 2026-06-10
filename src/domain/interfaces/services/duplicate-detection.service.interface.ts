import { LeadEntity } from '../../entities';

export interface IDuplicateDetectionService {
  findDuplicates(email?: string, phone?: string, website?: string): Promise<LeadEntity[]>;
  checkDuplicate(email?: string, phone?: string, website?: string): Promise<{ isDuplicate: boolean; matches: LeadEntity[] }>;
}
