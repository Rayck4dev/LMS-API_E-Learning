import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';
import { SupabaseStorageProvider } from './providers/supabase-storage.provider';
import { StorageController } from './storage.controller';

@Global()
@Module({
  controllers: [StorageController],
  providers: [
    {
      provide: 'STORAGE_PROVIDER',
      useClass: SupabaseStorageProvider,
    },
    StorageService,
  ],
  exports: [StorageService],
})
export class StorageModule {}
