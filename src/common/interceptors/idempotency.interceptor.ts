import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

const idempotencyCache = new Map<string, any>();

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Aplica a validação em rotas de criação (POST)
    if (request.method === 'POST') {
      const idempotencyKey = request.headers['idempotency-key'];

      if (!idempotencyKey) {
        throw new BadRequestException(
          'O cabeçalho Idempotency-Key é obrigatório para esta operação.',
        );
      }

      if (idempotencyCache.has(idempotencyKey as string)) {
        throw new ConflictException(
          'Requisição duplicada: esta operação já foi executada com a mesma Idempotency-Key.',
        );
      }

      return next.handle().pipe(
        tap((responseBody) => {
          idempotencyCache.set(idempotencyKey as string, responseBody);
        }),
      );
    }

    return next.handle();
  }
}
