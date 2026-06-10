import { TagEntity } from '../../entities';

export interface ITagRepository {
  findById(id: string): Promise<TagEntity | null>;
  findByName(name: string): Promise<TagEntity | null>;
  findAll(): Promise<TagEntity[]>;
  create(name: string, color?: string): Promise<TagEntity>;
  delete(id: string): Promise<void>;
  addToLead(leadId: string, tagId: string): Promise<void>;
  removeFromLead(leadId: string, tagId: string): Promise<void>;
  findByLeadId(leadId: string): Promise<TagEntity[]>;
}
