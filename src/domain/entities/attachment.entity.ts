export class AttachmentEntity {
  constructor(
    public readonly id: string,
    public leadId: string,
    public uploadedById: string,
    public fileName: string,
    public fileType: string,
    public fileSize: number,
    public filePath: string,
    public mimeType: string,
    public createdAt: Date,
    public deletedAt: Date | null,
    public deletedById: string | null,
  ) {}

  public get isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  public get fileSizeFormatted(): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = this.fileSize;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  public softDelete(deletedById: string): void {
    this.deletedAt = new Date();
    this.deletedById = deletedById;
  }

  public static readonly ALLOWED_MIME_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.ms-excel',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ];

  public static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  public static isAllowedMimeType(mimeType: string): boolean {
    return AttachmentEntity.ALLOWED_MIME_TYPES.includes(mimeType);
  }

  public static isAllowedSize(size: number): boolean {
    return size <= AttachmentEntity.MAX_FILE_SIZE;
  }

  public static fromPrisma(data: Record<string, unknown>): AttachmentEntity {
    return new AttachmentEntity(
      data.id as string,
      data.leadId as string,
      data.uploadedById as string,
      data.fileName as string,
      data.fileType as string,
      data.fileSize as number,
      data.filePath as string,
      data.mimeType as string,
      data.createdAt as Date,
      (data.deletedAt as Date) ?? null,
      (data.deletedById as string) ?? null,
    );
  }
}
