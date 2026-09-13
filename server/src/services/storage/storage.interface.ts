import { Readable } from 'node:stream';

export interface StorageUploadOptions {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  subfolder?: string;
}

export interface UploadResult {
  storageKey: string;
  fileSize: number;
  fileName: string;
  mimeType: string;
}

export interface IStorageService {
  /**
   * Uploads a file buffer to the configured storage system.
   * Returns storageKey identifier and metadata.
   */
  uploadFile(options: StorageUploadOptions): Promise<UploadResult>;

  /**
   * Retrieves a readable stream for the file.
   */
  getFileStream(storageKey: string): Promise<Readable>;

  /**
   * Reads the entire file as a buffer (useful for in-memory processing like AI parsing).
   */
  getFileBuffer(storageKey: string): Promise<Buffer>;

  /**
   * Deletes a file from storage.
   */
  deleteFile(storageKey: string): Promise<void>;

  /**
   * Checks if a file exists in storage.
   */
  fileExists(storageKey: string): Promise<boolean>;

  /**
   * Gets absolute internal path (only for local storage provider, optional).
   */
  getFilePath?(storageKey: string): string;
}
