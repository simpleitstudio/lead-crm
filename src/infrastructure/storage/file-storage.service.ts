import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

export class FileStorageService {
  private readonly s3Client: S3Client | null = null;
  private readonly bucketName: string;
  private readonly mockMode: boolean = false;
  private readonly mockStorage = new Map<string, Buffer>();

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    this.bucketName = process.env.R2_BUCKET_NAME || 'leads-crm-attachments';

    if (!accountId || !accessKeyId || !secretAccessKey || accessKeyId.startsWith('mock_')) {
      console.warn('[FileStorageService]: Cloudflare R2 credentials are not fully configured or set to mock. Running in memory mock mode.');
      this.mockMode = true;
    } else {
      const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
      this.s3Client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    }
  }

  public async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    const fileId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storageKey = `attachments/${fileId}_${sanitizedName}`;

    if (this.mockMode) {
      this.mockStorage.set(storageKey, buffer);
      return storageKey;
    }

    try {
      await this.s3Client!.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: storageKey,
          Body: buffer,
          ContentType: this.getContentType(fileName),
        })
      );
      return storageKey;
    } catch (error: any) {
      console.error('[FileStorageService] Upload to R2 failed:', error);
      throw new Error(`Failed to upload file to Cloudflare R2: ${error.message}`);
    }
  }

  public async deleteFile(storageKey: string): Promise<void> {
    // If the storageKey starts with a leading slash or "/uploads/", clean it to be a valid R2 key
    const cleanedKey = this.cleanKey(storageKey);

    if (this.mockMode) {
      this.mockStorage.delete(cleanedKey);
      return;
    }

    try {
      await this.s3Client!.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: cleanedKey,
        })
      );
    } catch (error: any) {
      console.error('[FileStorageService] Delete from R2 failed:', error);
      throw new Error(`Failed to delete file from Cloudflare R2: ${error.message}`);
    }
  }

  public async readFile(storageKey: string): Promise<Buffer> {
    const cleanedKey = this.cleanKey(storageKey);

    if (this.mockMode) {
      const buffer = this.mockStorage.get(cleanedKey);
      if (!buffer) {
        throw new Error(`File not found in mock storage: ${cleanedKey}`);
      }
      return buffer;
    }

    try {
      const response = await this.s3Client!.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: cleanedKey,
        })
      );

      if (!response.Body) {
        throw new Error('Empty response body from R2');
      }

      const stream = response.Body as any;
      if (typeof stream.on === 'function') {
        return new Promise<Buffer>((resolve, reject) => {
          const chunks: Buffer[] = [];
          stream.on('data', (chunk: any) => chunks.push(Buffer.from(chunk)));
          stream.on('error', (err: any) => reject(err));
          stream.on('end', () => resolve(Buffer.concat(chunks)));
        });
      } else {
        // Fallback for Web ReadableStream
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }
        return Buffer.concat(chunks.map(c => Buffer.from(c)));
      }
    } catch (error: any) {
      console.error('[FileStorageService] Read from R2 failed:', error);
      throw new Error(`Failed to read file from Cloudflare R2: ${error.message}`);
    }
  }

  private cleanKey(key: string): string {
    // R2 keys do not start with leading slashes. If the stored path has one, remove it.
    let cleaned = key;
    if (cleaned.startsWith('/')) {
      cleaned = cleaned.substring(1);
    }
    if (cleaned.startsWith('uploads/')) {
      cleaned = cleaned.substring(8);
    }
    return cleaned;
  }

  private getContentType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'application/pdf';
      case 'png': return 'image/png';
      case 'jpg':
      case 'jpeg': return 'image/jpeg';
      case 'gif': return 'image/gif';
      case 'csv': return 'text/csv';
      case 'txt': return 'text/plain';
      case 'doc': return 'application/msword';
      case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'xls': return 'application/vnd.ms-excel';
      case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      default: return 'application/octet-stream';
    }
  }
}
