import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  BadRequestException,
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

function hasExpectedFileSignature(file: Express.Multer.File): boolean {
  const buffer = file.buffer;
  switch (file.mimetype) {
    case 'image/jpeg':
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case 'image/png':
      return buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      );
    case 'image/webp':
      return (
        buffer.toString('ascii', 0, 4) === 'RIFF' &&
        buffer.toString('ascii', 8, 12) === 'WEBP'
      );
    case 'application/pdf':
      return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
    default:
      return false;
  }
}

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
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 25 * 1024 * 1024, files: 1 },
      fileFilter: (_request, file, callback) => {
        const allowedTypes: Record<string, string> = {
          'image/jpeg': '.jpg',
          'image/png': '.png',
          'image/webp': '.webp',
          'application/pdf': '.pdf',
        };
        const expectedExtension = allowedTypes[file.mimetype];
        const actualExtension = file.originalname
          .slice(file.originalname.lastIndexOf('.'))
          .toLowerCase();

        if (!expectedExtension || actualExtension !== expectedExtension) {
          callback(
            new BadRequestException('Formato inválido. Use JPG, PNG, WEBP ou PDF.'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('O arquivo é obrigatório.');
    }
    if (!hasExpectedFileSignature(file)) {
      throw new BadRequestException('O conteúdo não corresponde ao formato declarado.');
    }

    const uploadedFile = await this.storageService.upload(file, 'uploads');
    return {
      message: 'Upload realizado com sucesso!',
      url: uploadedFile.url,
      key: uploadedFile.key,
    };
  }
}
