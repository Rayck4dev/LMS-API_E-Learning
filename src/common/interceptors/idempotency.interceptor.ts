import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Aplica a validação apenas em métodos POST
    if (request.method === 'POST') {
      const idempotencyKey = request.headers['idempotency-key'];

      // Se a chave não for enviada, lança erro de validação (400) em vez de estourar 500
      if (!idempotencyKey) {
        throw new BadRequestException(
          'O cabeçalho "idempotency-key" é obrigatório para esta operação.',
        );
      }
    }

    return next.handle();
  }
}
