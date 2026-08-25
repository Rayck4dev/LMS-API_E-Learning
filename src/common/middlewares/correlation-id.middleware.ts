import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || randomUUID();

    // Injeta nos headers da requisição e da resposta
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);

    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;

      // Log Estruturado em JSON
      const logData = {
        correlationId,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
      };

      this.logger.log(JSON.stringify(logData));
    });

    next();
  }
}
