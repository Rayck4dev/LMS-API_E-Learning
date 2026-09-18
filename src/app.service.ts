import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'LMS API está rodando com sucesso! Acesse /api/docs para ver a documentação no Swagger.';
  }
}
