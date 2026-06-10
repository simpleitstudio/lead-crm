import { prisma } from '../database/prisma.client';
import { ExportHistoryEntity } from '../../domain/entities/export-history.entity';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { IExportHistoryRepository, CreateExportHistoryData } from '../../domain/interfaces/repositories/export-history.repository.interface';

export class ExportHistoryRepository implements IExportHistoryRepository {
  public async findById(id: string): Promise<ExportHistoryEntity | null> {
    const history = await prisma.exportHistory.findFirst({
      where: { id },
    });
    return history ? ExportHistoryEntity.fromPrisma(history as any) : null;
  }

  public async findByUserId(userId: string, pagination: PaginationVo): Promise<PaginatedResult<ExportHistoryEntity>> {
    const [items, total] = await Promise.all([
      prisma.exportHistory.findMany({
        where: { userId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.exportHistory.count({
        where: { userId },
      }),
    ]);

    return createPaginatedResult(
      items.map(item => ExportHistoryEntity.fromPrisma(item as any)),
      total,
      pagination
    );
  }

  public async create(data: CreateExportHistoryData): Promise<ExportHistoryEntity> {
    const history = await prisma.exportHistory.create({
      data: {
        userId: data.userId,
        fileName: data.fileName,
        fileType: data.fileType,
        recordCount: data.recordCount,
        appliedFilters: data.appliedFilters as any,
      },
    });
    return ExportHistoryEntity.fromPrisma(history as any);
  }
}
