import { IStorageService } from './storage.interface.js';
import { LocalStorageService } from './localStorage.service.js';

let storageInstance: IStorageService | null = null;

export const getStorageService = (): IStorageService => {
  if (!storageInstance) {
    const provider = process.env.STORAGE_PROVIDER || 'local';

    switch (provider) {
      case 'local':
      default:
        storageInstance = new LocalStorageService();
        break;
    }
  }
  return storageInstance;
};

export * from './storage.interface.js';
export * from './localStorage.service.js';
