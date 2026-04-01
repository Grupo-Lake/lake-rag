import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app.module';
import { Security } from '@/global/application/bootstrap/security';
import { ConfigService } from '@/global/core/services/config.service';
import { AppLogger } from '@/global/core/services/observability/logger.service';

export class Server {
  static async bootstrap(): Promise<INestApplication> {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    const config = app.get(ConfigService);
    const security = new Security(config);
    const logger = app.get(AppLogger);

    app.useLogger(logger);

    security.apply(app);

    const port = config.get('PORT');
    await app.listen(port);

    logger.log(`Server is running on: http://localhost:${port}`, 'Bootstrap');

    return app;
  }
}
