import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const configSchema = z
  .object({
    // Application
    PORT: z.coerce.number().int().positive().default(3333),
    NODE_ENV: z.enum(['development', 'test', 'production']).optional(),
    CORS_ORIGINS: z.string().optional(),
    // Observability
    SERVICE_NAME: z.string().optional(),
    LOG_LEVEL: z.string().optional(),
    LOG_PRETTY: z.string().optional(),

    // Vector DB
    QDRANT_HOST: z.string().default('localhost'),
    QDRANT_PORT: z.coerce.number().int().positive().default(6333),

    // AI Providers
    GEMINI_API_KEY: z.string(),
  })
  .passthrough()
  .superRefine((values, ctx) => {
    if (values.NODE_ENV !== 'test' && !values.QDRANT_HOST) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'QDRANT_HOST is required',
        path: ['QDRANT_HOST'],
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
