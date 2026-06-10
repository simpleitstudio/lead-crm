export class ExportHistoryEntity {
  constructor(
    public readonly id: string,
    public userId: string,
    public fileName: string,
    public fileType: string,
    public recordCount: number,
    public appliedFilters: Record<string, unknown> | null,
    public createdAt: Date,
  ) {}

  public static fromPrisma(data: Record<string, unknown>): ExportHistoryEntity {
    return new ExportHistoryEntity(
      data.id as string,
      data.userId as string,
      data.fileName as string,
      data.fileType as string,
      data.recordCount as number,
      (data.appliedFilters as Record<string, unknown>) ?? null,
      data.createdAt as Date,
    );
  }
}
