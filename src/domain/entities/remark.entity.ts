export class RemarkEntity {
  constructor(
    public readonly id: string,
    public leadId: string,
    public authorId: string,
    public content: string,
    public contentHtml: string | null,
    public isEdited: boolean,
    public createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
    public deletedById: string | null,
  ) {}

  public get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public edit(content: string, contentHtml?: string): void {
    this.content = content;
    this.contentHtml = contentHtml ?? null;
    this.isEdited = true;
  }

  public softDelete(deletedById: string): void {
    this.deletedAt = new Date();
    this.deletedById = deletedById;
  }

  public isAuthoredBy(userId: string): boolean {
    return this.authorId === userId;
  }

  public static fromPrisma(data: Record<string, unknown>): RemarkEntity {
    return new RemarkEntity(
      data.id as string,
      data.leadId as string,
      data.authorId as string,
      data.content as string,
      (data.contentHtml as string) ?? null,
      data.isEdited as boolean,
      data.createdAt as Date,
      data.updatedAt as Date,
      (data.deletedAt as Date) ?? null,
      (data.deletedById as string) ?? null,
    );
  }
}
