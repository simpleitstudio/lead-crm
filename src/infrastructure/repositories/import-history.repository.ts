import { prisma } from '../database/prisma.client';
import { ImportHistoryEntity } from '../../domain/entities/import-history.entity';
import { PaginatedResult, PaginationVo, createPaginatedResult } from '../../domain/value-objects/pagination.vo';
import { IImportHistoryRepository, CreateImportHistoryData, UpdateImportHistoryData } from '../../domain/interfaces/repositories/import-history.repository.interface';

export class ImportHistoryRepository implements IImportHistoryRepository {
  public async findById(id: string): Promise<ImportHistoryEntity | null> {
    const history = await prisma.importHistory.findFirst({
      where: { id },
    });
    return history ? ImportHistoryEntity.fromPrisma(history as any) : null;
  }

  public async findByUserId(userId: string, pagination: PaginationVo): Promise<PaginatedResult<ImportHistoryEntity>> {
    const [items, total] = await Promise.all([
      prisma.importHistory.findMany({
        where: { userId },
        skip: pagination.offset,
        take: pagination.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.importHistory.count({
        where: { userId },
      }),
    ]);

    return createPaginatedResult(
      items.map(item => ImportHistoryEntity.fromPrisma(item as any)),
      total,
      pagination
    );
  }

  public async create(data: CreateImportHistoryData): Promise<ImportHistoryEntity> {
    const history = await prisma.importHistory.create({
      data: {
        userId: data.userId,
        fileName: data.fileName,
        totalRows: data.totalRows,
        successCount: data.successCount,
        failureCount: data.failureCount,
        duplicateCount: data.duplicateCount,
        errorReport: data.errorReport as any,
        status: data.status,
        startedAt: data.startedAt ?? null,
        completedAt: data.completedAt ?? null,
      },
    });
    return ImportHistoryEntity.fromPrisma(history as any);
  }

  public async update(id: string, data: UpdateImportHistoryData): Promise<ImportHistoryEntity> {
    const history = await prisma.importHistory.update({
      where: { id },
      data: {
        successCount: data.successCount,
        failureCount: data.failureCount,
        duplicateCount: data.duplicateCount,
        errorReport: data.errorReport as any,
        status: data.status,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
      },
    });
    return ImportHistoryEntity.fromPrisma(history as any);
  }
}
