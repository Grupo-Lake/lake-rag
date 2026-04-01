import { connect } from 'node:net';

import { Injectable } from '@nestjs/common';
import { HealthIndicatorService } from '@nestjs/terminus';

import { TelemetryDatasource } from '@/global/core/services/observability/telemetry.datasource';
import { DBDatasource } from '@/global/infrastructure/datasource/db.datasource';

@Injectable()
export class HealthService {
  constructor(
    private readonly db: DBDatasource,
    private readonly health: HealthIndicatorService,
    private readonly telemetry: TelemetryDatasource,
  ) {}

  async isDbHealthy(key: string) {
    const indicator = this.health.check(key);
    try {
      await this.db.$queryRaw`SELECT 1`;
      return indicator.up();
    } catch {
      return indicator.down('Database check failed');
    }
  }

  async isTelemetryHealthy(key: string) {
    const indicator = this.health.check(key);
    const options = this.telemetry.getTracingOptions();
    const host =
      typeof options.hostname === 'string' ? options.hostname : 'localhost';
    const port = typeof options.port === 'number' ? options.port : 8126;

    try {
      await new Promise<void>((resolve, reject) => {
        const socket = connect({ host, port });
        const timeout = setTimeout(() => {
          socket.destroy();
          reject(new Error('Telemetry timeout'));
        }, 1000);

        socket.on('connect', () => {
          clearTimeout(timeout);
          socket.end();
          resolve();
        });

        socket.on('error', (error) => {
          clearTimeout(timeout);
          socket.destroy();
          reject(error);
        });
      });

      return indicator.up();
    } catch {
      return indicator.down('Telemetry agent not reachable');
    }
  }
}
