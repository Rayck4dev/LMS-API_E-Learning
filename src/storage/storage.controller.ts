import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  ApiTags,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiOperation,
  ApiHeader,
} from '@nestjs/swagger';

@ApiTags('Storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Fazer upload de um arquivo para o Supabase Storage',
  })
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'idempotency-key',
    description: 'Chave única de idempotência para evitar duplicidade',
    required: true,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo a ser enviado (imagem, documento, etc.)',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    const publicUrl = await this.storageService.upload(file, 'uploads');
    return {
      message: 'Upload realizado com sucesso!',
      url: publicUrl,
    };
  }
}
