import fs from 'fs/promises';
import path from 'path';

export class FileStorageService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  public async saveFile(fileName: string, buffer: Buffer): Promise<string> {
    // Ensure upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true });
    
    // Generate unique file name
    const fileId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${fileId}_${sanitizedName}`;
    
    const fullPath = path.join(this.uploadDir, uniqueFileName);
    await fs.writeFile(fullPath, buffer);
    
    return `/uploads/${uniqueFileName}`;
  }

  public async deleteFile(filePath: string): Promise<void> {
    const fileName = path.basename(filePath);
    const fullPath = path.join(this.uploadDir, fileName);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // Keep silent if file is already deleted or doesn't exist
    }
  }

  public async readFile(filePath: string): Promise<Buffer> {
    const fileName = path.basename(filePath);
    const fullPath = path.join(this.uploadDir, fileName);
    return fs.readFile(fullPath);
  }
}
