import { randomUUID } from 'node:crypto';

import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { runWithRequestContext } from '@/global/core/services/observability/request-context';

const TRACEPARENT_REGEX = /^(?:[0-9a-f]{2})-([0-9a-f]{32})-([0-9a-f]{16})-/i;

function parseTraceparent(
  traceparent?: string,
): { traceId: string; spanId: string } | null {
  if (!traceparent) {
    return null;
  }

  const match = TRACEPARENT_REGEX.exec(traceparent);
  if (!match) {
    return null;
  }

  return { traceId: match[1], spanId: match[2] };
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceparent = req.headers['traceparent'];
    const parsed = parseTraceparent(
      Array.isArray(traceparent) ? traceparent[0] : traceparent,
    );

    const incomingRequestId =
      req.headers['x-request-id'] || req.headers['x-correlation-id'];
    const requestId = Array.isArray(incomingRequestId)
      ? incomingRequestId[0]
      : incomingRequestId || randomUUID();

    const traceId =
      parsed?.traceId ||
      (typeof requestId === 'string' ? requestId : randomUUID());
    const spanId = parsed?.spanId;

    res.setHeader('x-request-id', requestId);

    runWithRequestContext(
      {
        traceId,
        spanId,
        requestId: String(requestId),
        method: req.method,
        path: req.originalUrl || req.url,
      },
      () => next(),
    );
  }
}
