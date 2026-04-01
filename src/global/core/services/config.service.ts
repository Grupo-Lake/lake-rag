import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const configSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    PORT: z.coerce.number().int().positive().default(3333),
    DATABASE_URL: z.string().min(1).optional(),
    DATABASE_SCHEMA: z.string().default('postgres'),
    CORS_ORIGINS: z.string().optional(),
    SERVICE_NAME: z.string().optional(),
    LOG_LEVEL: z.string().optional(),
    LOG_PRETTY: z.string().optional(),
    DD_TRACE_ENABLED: z.string().optional(),
    DD_AGENT_HOST: z.string().optional(),
    DD_TRACE_AGENT_PORT: z.coerce.number().int().positive().optional(),
    DD_ENV: z.string().optional(),
    DD_VERSION: z.string().optional(),
  })
  .passthrough()
  .superRefine((values, ctx) => {
    if (values.NODE_ENV !== 'test' && !values.DATABASE_URL) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'DATABASE_URL is required',
        path: ['DATABASE_URL'],
      });
    }
  });

export type ConfigValues = z.infer<typeof configSchema>;

@Injectable()
export class ConfigService {
  private readonly values: ConfigValues;

  constructor() {
    this.values = configSchema.parse(process.env);
  }

  get<T extends keyof ConfigValues>(key: T): ConfigValues[T] {
    return this.values[key];
  }
}
