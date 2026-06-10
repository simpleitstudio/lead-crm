import { prisma } from '../database/prisma.client';
import { TagEntity } from '../../domain/entities/tag.entity';
import { ITagRepository } from '../../domain/interfaces/repositories/tag.repository.interface';

export class TagRepository implements ITagRepository {
  public async findById(id: string): Promise<TagEntity | null> {
    const tag = await prisma.tag.findFirst({
      where: { id },
    });
    return tag ? TagEntity.fromPrisma(tag) : null;
  }

  public async findByName(name: string): Promise<TagEntity | null> {
    const tag = await prisma.tag.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    return tag ? TagEntity.fromPrisma(tag) : null;
  }

  public async findAll(): Promise<TagEntity[]> {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });
    return tags.map(item => TagEntity.fromPrisma(item));
  }

  public async create(name: string, color?: string): Promise<TagEntity> {
    const tag = await prisma.tag.create({
      data: {
        name,
        color: color ?? '#6366f1',
      },
    });
    return TagEntity.fromPrisma(tag);
  }

  public async delete(id: string): Promise<void> {
    await prisma.tag.delete({
      where: { id },
    });
  }

  public async addToLead(leadId: string, tagId: string): Promise<void> {
    await prisma.leadTag.upsert({
      where: {
        leadId_tagId: {
          leadId,
          tagId,
        },
      },
      create: {
        leadId,
        tagId,
      },
      update: {},
    });
  }

  public async removeFromLead(leadId: string, tagId: string): Promise<void> {
    await prisma.leadTag.delete({
      where: {
        leadId_tagId: {
          leadId,
          tagId,
        },
      },
    });
  }

  public async findByLeadId(leadId: string): Promise<TagEntity[]> {
    const leadTags = await prisma.leadTag.findMany({
      where: { leadId },
      include: { tag: true },
    });
    return leadTags.map(lt => TagEntity.fromPrisma(lt.tag));
  }
}
