import { Injectable, type OnModuleInit } from '@nestjs/common';

import { ConfigService } from '@/global/core/services/config.service';
import { TelemetryDatasource } from '@/global/core/services/observability/telemetry.datasource';

@Injectable()
export class TracingService implements OnModuleInit {
  constructor(
    private readonly config: ConfigService,
    private readonly telemetry: TelemetryDatasource,
  ) {}

  onModuleInit() {
    const enabled = this.config.get('DD_TRACE_ENABLED') === 'true';
    if (!enabled) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
    const tracer: typeof import('dd-trace') = require('dd-trace');
    tracer.init(this.telemetry.getTracingOptions());
  }
}
