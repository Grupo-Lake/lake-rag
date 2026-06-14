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

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [ConfigService, AppLogger, TracingService],
  exports: [ConfigService, AppLogger],
})
export class GlobalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
