import {
  Global,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';

import { RequestContextMiddleware } from './application/middlewares/request-context.middleware';
import { ConfigService } from './core/services/config.service';
import { AppLogger } from './core/services/observability/logger.service';
import { TracingService } from './core/services/observability/tracing.service';
import { VectorDbDatasource } from './infrastructure/datasource/vector-db.datasource';
import { GeminiRepository } from './infrastructure/repositories/gemini.repository';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    ConfigService,
    AppLogger,
    TracingService,
    VectorDbDatasource,
    GeminiRepository,
  ],
  exports: [ConfigService, AppLogger, VectorDbDatasource, GeminiRepository],
})
export class GlobalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
