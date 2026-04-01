import { AsyncLocalStorage } from 'node:async_hooks';

export type RequestContext = {
  traceId: string;
  spanId?: string;
  requestId: string;
  method?: string;
  path?: string;
};

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithRequestContext<T>(
  context: RequestContext,
  fn: () => T,
): T {
  return storage.run(context, fn);
}

export function getRequestContext(): RequestContext | undefined {
  return storage.getStore();
}
