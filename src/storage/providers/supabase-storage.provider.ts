import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { StorageProvider } from '../interfaces/storage-provider.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class SupabaseStorageProvider implements StorageProvider {
  private supabase: SupabaseClient;
  private bucketName: string;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    this.bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'lms-assets';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error(
        'Supabase credentials (URL/KEY) are missing in environment variables.',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'general',
  ): Promise<{ url: string; key: string }> {
    const fileExt = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExt) {
      throw new InternalServerErrorException('Extensão de arquivo inválida.');
    }
    const fileName = `${randomUUID()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) {
      throw new InternalServerErrorException(
        'Falha ao enviar o arquivo para o armazenamento.',
      );
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(this.bucketName)
      .getPublicUrl(data.path);

    return {
      url: publicUrlData.publicUrl,
      key: data.path,
    };
  }

  async deleteFile(key: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucketName)
      .remove([key]);

    if (error) {
      throw new InternalServerErrorException(
        `Erro ao deletar arquivo no Supabase: ${error.message}`,
      );
    }
  }
}
