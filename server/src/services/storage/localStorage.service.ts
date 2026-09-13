import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import crypto from 'node:crypto';
import { IStorageService, StorageUploadOptions, UploadResult } from './storage.interface.js';
import { ApiError } from '../../utils/apiError.js';

export class LocalStorageService implements IStorageService {
  private baseDir: string;

  constructor(customBaseDir?: string) {
    this.baseDir = customBaseDir || path.resolve(process.cwd(), 'storage_secure');
    this.ensureDirectory(this.baseDir);
  }

  private ensureDirectory(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  private sanitizeFileName(originalName: string): string {
    // Keep only alphanumeric characters, dashes, underscores, and dots
    const sanitized = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return sanitized.substring(0, 100);
  }

  private resolveSafePath(storageKey: string): string {
    // Prevent directory traversal attacks
    const normalizedKey = path.normalize(storageKey).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullPath = path.resolve(this.baseDir, normalizedKey);

    if (!fullPath.startsWith(this.baseDir)) {
      throw ApiError.badRequest('Invalid file storage key or path traversal attempt.');
    }

    return fullPath;
  }

  async uploadFile(options: StorageUploadOptions): Promise<UploadResult> {
    const { buffer, originalname, mimetype, subfolder = 'resumes' } = options;

    const targetDir = path.join(this.baseDir, subfolder);
    this.ensureDirectory(targetDir);

    const safeOriginalName = this.sanitizeFileName(originalname);
    const fileExt = path.extname(safeOriginalName) || '.pdf';
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now();
    const storedFileName = `${timestamp}_${uniqueId}${fileExt}`;
    const relativeKey = path.join(subfolder, storedFileName).replace(/\\/g, '/');
    const fullPath = path.join(targetDir, storedFileName);

    await fs.promises.writeFile(fullPath, buffer);

    return {
      storageKey: relativeKey,
      fileSize: buffer.length,
      fileName: safeOriginalName,
      mimeType: mimetype,
    };
  }

  async getFileStream(storageKey: string): Promise<Readable> {
    const fullPath = this.resolveSafePath(storageKey);

    if (!fs.existsSync(fullPath)) {
      throw ApiError.notFound('Requested file does not exist on storage.');
    }

    return fs.createReadStream(fullPath);
  }

  async getFileBuffer(storageKey: string): Promise<Buffer> {
    const fullPath = this.resolveSafePath(storageKey);

    if (!fs.existsSync(fullPath)) {
      throw ApiError.notFound('Requested file does not exist on storage.');
    }

    return fs.promises.readFile(fullPath);
  }

  async deleteFile(storageKey: string): Promise<void> {
    const fullPath = this.resolveSafePath(storageKey);

    if (fs.existsSync(fullPath)) {
      await fs.promises.unlink(fullPath);
    }
  }

  async fileExists(storageKey: string): Promise<boolean> {
    try {
      const fullPath = this.resolveSafePath(storageKey);
      return fs.existsSync(fullPath);
    } catch {
      return false;
    }
  }

  getFilePath(storageKey: string): string {
    return this.resolveSafePath(storageKey);
  }
}
