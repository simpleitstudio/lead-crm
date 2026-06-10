export class TagEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public color: string,
    public createdAt: Date,
  ) {}

  public static fromPrisma(data: Record<string, unknown>): TagEntity {
    return new TagEntity(
      data.id as string,
      data.name as string,
      data.color as string,
      data.createdAt as Date,
    );
  }
}
