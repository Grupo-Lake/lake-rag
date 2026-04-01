import {
  Global,
  type MiddlewareConsumer,
  Module,
  type NestModule,
} from '@nestjs/common';

import { RequestContextMiddleware } from './application/middlewares/request-context.middleware';
import { ConfigService } from './core/services/config.service';
import { AppLogger } from './core/services/observability/logger.service';
import { TelemetryDatasource } from './core/services/observability/telemetry.datasource';
import { TracingService } from './core/services/observability/tracing.service';
import { DBDatasource } from './infrastructure/datasource/db.datasource';

@Global()
@Module({
  imports: [],
  controllers: [],
  providers: [
    ConfigService,
    DBDatasource,
    AppLogger,
    TelemetryDatasource,
    TracingService,
  ],
  exports: [ConfigService, DBDatasource, AppLogger, TelemetryDatasource],
})
export class GlobalModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
