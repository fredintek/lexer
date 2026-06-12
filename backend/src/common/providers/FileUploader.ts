import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface FileUploadResult {
  publicId: string;
  url: string;
}

@Injectable()
export class FileUploadProvider {
  private readonly logger = new Logger(FileUploadProvider.name);

  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');

    // Ensure base directory exists on startup
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  // =============================================
  // Save a buffer to disk
  //
  // folder   : sub-directory e.g. 'kyc/userId'
  // filename : base name without extension
  // mime     : used to derive the extension
  // =============================================

  public async uploadBuffer(
    buffer: Buffer,
    folder: string,
    filename: string,
    mime?: string,
  ): Promise<FileUploadResult> {
    const ext = this.mimeToExt(mime);
    const dir = path.join(this.uploadDir, folder);

    fs.mkdirSync(dir, { recursive: true });

    const safeName = `${filename}_${randomUUID().slice(0, 8)}${ext}`;
    const fullPath = path.join(dir, safeName);

    fs.writeFileSync(fullPath, buffer);

    const publicId = `${folder}/${safeName}`;
    const url = `/uploads/${publicId}`;

    this.logger.log(`File saved — ${publicId} (${buffer.length} bytes)`);

    return { publicId, url };
  }

  public async deleteImage(publicId: string): Promise<void> {
    const fullPath = path.join(this.uploadDir, publicId);
    try {
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        this.logger.log(`File deleted — ${publicId}`);
      }
    } catch (error: any) {
      this.logger.warn(`Failed to delete file ${publicId}: ${error.message}`);
    }
  }

  public getAbsolutePath(publicId: string): string {
    return path.join(this.uploadDir, publicId);
  }

  private mimeToExt(mime?: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'application/pdf': '.pdf',
    };
    return map[mime ?? ''] ?? '.bin';
  }
}
