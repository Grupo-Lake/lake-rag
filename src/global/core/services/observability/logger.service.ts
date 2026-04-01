import { Injectable, LoggerService } from '@nestjs/common';
import pino, { type Logger as PinoLogger } from 'pino';

import { ConfigService } from '@/global/core/services/config.service';

import { getRequestContext } from './request-context';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: PinoLogger;

  constructor(private readonly config: ConfigService) {
    const level = this.config.get('LOG_LEVEL') || 'info';
    const serviceName = this.config.get('SERVICE_NAME') || 'orquestria-api';
    const pretty = this.config.get('LOG_PRETTY') === 'true';

    const transport = pretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
          },
        }
      : undefined;

    this.logger = pino({
      level,
      base: { service: serviceName },
      timestamp: pino.stdTimeFunctions.isoTime,
      transport,
    });
  }

  log(message: unknown, context?: string) {
    this.logger.info(this.withContext({ context }), message as string);
  }

  error(message: unknown, trace?: string, context?: string) {
    this.logger.error(this.withContext({ context, trace }), message as string);
  }

  warn(message: unknown, context?: string) {
    this.logger.warn(this.withContext({ context }), message as string);
  }

  debug(message: unknown, context?: string) {
    this.logger.debug(this.withContext({ context }), message as string);
  }

  verbose(message: unknown, context?: string) {
    this.logger.trace(this.withContext({ context }), message as string);
  }

  private withContext(meta: Record<string, unknown>) {
    const ctx = getRequestContext();
    if (!ctx) {
      return meta;
    }

    return {
      ...meta,
      trace_id: ctx.traceId,
      span_id: ctx.spanId,
      request_id: ctx.requestId,
      method: ctx.method,
      path: ctx.path,
    };
  }
}
