import { prisma } from '../database/prisma.client';
import { RemarkEntity } from '../../domain/entities/remark.entity';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { IRemarkRepository, CreateRemarkData, UpdateRemarkData } from '../../domain/interfaces/repositories/remark.repository.interface';

export class RemarkRepository implements IRemarkRepository {
  public async findById(id: string): Promise<RemarkEntity | null> {
    const remark = await prisma.remark.findFirst({
      where: { id, deletedAt: null },
    });
    return remark ? RemarkEntity.fromPrisma(remark) : null;
  }

  public async findByLeadId(leadId: string, pagination: PaginationVo): Promise<PaginatedResult<RemarkEntity>> {
    const [items, total] = await Promise.all([
      prisma.remark.findMany({
        where: { leadId, deletedAt: null },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.remark.count({
        where: { leadId, deletedAt: null },
      }),
    ]);

    return createPaginatedResult(
      items.map(item => RemarkEntity.fromPrisma(item)),
      total,
      pagination
    );
  }

  public async create(data: CreateRemarkData): Promise<RemarkEntity> {
    const remark = await prisma.remark.create({
      data: {
        leadId: data.leadId,
        authorId: data.authorId,
        content: data.content,
        contentHtml: data.contentHtml ?? null,
        isEdited: false,
      },
    });
    return RemarkEntity.fromPrisma(remark);
  }

  public async update(id: string, data: UpdateRemarkData): Promise<RemarkEntity> {
    const remark = await prisma.remark.update({
      where: { id },
      data: {
        content: data.content,
        contentHtml: data.contentHtml ?? null,
        isEdited: true,
      },
    });
    return RemarkEntity.fromPrisma(remark);
  }

  public async softDelete(id: string, deletedById: string): Promise<void> {
    await prisma.remark.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById,
      },
    });
  }

  public async countByLeadId(leadId: string): Promise<number> {
    return prisma.remark.count({
      where: { leadId, deletedAt: null },
    });
  }
}
