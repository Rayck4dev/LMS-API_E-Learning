import { Injectable, Inject } from '@nestjs/common';
import * as storageProviderInterface from './interfaces/storage-provider.interface';

@Injectable()
export class StorageService {
  constructor(
    @Inject('STORAGE_PROVIDER')
    private readonly storageProvider: storageProviderInterface.StorageProvider,
  ) {}

  async upload(file: Express.Multer.File, folder: string) {
    return this.storageProvider.uploadFile(file, folder);
  }

  async delete(key: string) {
    return this.storageProvider.deleteFile(key);
  }
}
