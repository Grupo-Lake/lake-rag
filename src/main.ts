import 'dotenv/config';

import { Server } from './global/application/bootstrap/server';
import { AppLogger } from './global/core/services/observability/logger.service';

async function init() {
  const app = await Server.bootstrap();
  const logger = app.get(AppLogger);

  let isShuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (isShuttingDown) {
      return;
    }
    isShuttingDown = true;

    try {
      logger.warn(`Received ${signal}. Shutting down...`, 'Shutdown');
      await app.close();
      if (signal === 'SIGUSR2') {
        process.kill(process.pid, signal);
        return;
      }
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown', (error as Error).stack, 'Shutdown');
      process.exit(1);
    }
  };

  const handleSignal = (signal: NodeJS.Signals) => {
    void shutdown(signal);
  };

  process.on('SIGINT', handleSignal);
  process.on('SIGTERM', handleSignal);
  process.on('SIGBREAK', handleSignal);
  process.on('SIGHUP', handleSignal);
  process.on('SIGUSR2', handleSignal);
}

void init();
