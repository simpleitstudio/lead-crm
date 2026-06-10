import { ImportStatus } from '../enums';

export class ImportHistoryEntity {
  constructor(
    public readonly id: string,
    public userId: string,
    public fileName: string,
    public totalRows: number,
    public successCount: number,
    public failureCount: number,
    public duplicateCount: number,
    public errorReport: Record<string, unknown>[] | null,
    public status: ImportStatus,
    public startedAt: Date | null,
    public completedAt: Date | null,
    public createdAt: Date,
  ) {}

  public get successRate(): number {
    if (this.totalRows === 0) return 0;
    return Math.round((this.successCount / this.totalRows) * 100);
  }

  public static fromPrisma(data: Record<string, unknown>): ImportHistoryEntity {
    return new ImportHistoryEntity(
      data.id as string,
      data.userId as string,
      data.fileName as string,
      data.totalRows as number,
      data.successCount as number,
      data.failureCount as number,
      data.duplicateCount as number,
      (data.errorReport as Record<string, unknown>[]) ?? null,
      data.status as ImportStatus,
      (data.startedAt as Date) ?? null,
      (data.completedAt as Date) ?? null,
      data.createdAt as Date,
    );
  }
}
