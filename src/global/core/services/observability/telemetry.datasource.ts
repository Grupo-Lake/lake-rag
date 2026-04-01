import { Injectable } from '@nestjs/common';

import { ConfigService } from '@/global/core/services/config.service';

type TracerOptions = import('dd-trace').TracerOptions;

@Injectable()
export class TelemetryDatasource {
  constructor(private readonly config: ConfigService) {}

  getTracingOptions(): TracerOptions {
    const service = this.config.get('SERVICE_NAME') || 'service-api';
    const env =
      this.config.get('DD_ENV') || this.config.get('NODE_ENV') || 'development';
    const version = this.config.get('DD_VERSION');
    const hostname = this.config.get('DD_AGENT_HOST');
    const port = this.config.get('DD_TRACE_AGENT_PORT');

    const options: Record<string, unknown> = {
      service,
      env,
      logInjection: true,
    };

    if (version) {
      options.version = version;
    }

    if (hostname) {
      options.hostname = hostname;
    }

    if (port) {
      options.port = port;
    }

    return options as TracerOptions;
  }
}
