import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApplicationError } from '../../../application/errors/application-error';
import { DomainError } from '../../../domain/errors/domain-error';

type ExceptionResponse = {
  message?: string | string[];
  error?: string;
};

type ErrorResponse = {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const errorResponse = this.normalizeException(exception, request);

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private normalizeException(
    exception: unknown,
    request: Request,
  ): ErrorResponse {
    const statusCode = this.getStatusCode(exception);
    const exceptionResponse = this.getExceptionResponse(exception);

    return {
      statusCode,
      message: exceptionResponse.message ?? this.getMessage(exception),
      error:
        exceptionResponse.error ?? this.getErrorName(exception, statusCode),
      path: request.url,
      timestamp: new Date().toISOString(),
    };
  }

  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    if (
      exception instanceof DomainError ||
      exception instanceof ApplicationError
    ) {
      return exception.statusCode;
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getExceptionResponse(exception: unknown): ExceptionResponse {
    if (!(exception instanceof HttpException)) {
      return {};
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return { message: response };
    }

    if (this.isExceptionResponse(response)) {
      return response;
    }

    return {};
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }

  private getErrorName(exception: unknown, statusCode: number): string {
    if (exception instanceof HttpException) {
      return exception.name;
    }

    if (
      exception instanceof DomainError ||
      exception instanceof ApplicationError
    ) {
      return exception.name;
    }

    return statusCode === Number(HttpStatus.INTERNAL_SERVER_ERROR)
      ? 'Internal Server Error'
      : 'Error';
  }

  private isExceptionResponse(value: unknown): value is ExceptionResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    return 'message' in value || 'error' in value;
  }
}
