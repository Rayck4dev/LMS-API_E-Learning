import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let detail = 'Erro interno do servidor';
    if (typeof exceptionResponse === 'string') {
      detail = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      detail =
        (exceptionResponse as any).message || JSON.stringify(exceptionResponse);
    }

    const correlationId = request.headers['x-correlation-id'] || 'N/A';

    const problemDetails = {
      type: `https://httpstatuses.com/${status}`,
      title: HttpStatus[status] || 'Error',
      status: status,
      detail: Array.isArray(detail) ? detail.join(', ') : detail,
      instance: request.url,
      correlationId: correlationId,
      timestamp: new Date().toISOString(),
    };

    response
      .status(status)
      .setHeader('Content-Type', 'application/problem+json')
      .json(problemDetails);
  }
}
