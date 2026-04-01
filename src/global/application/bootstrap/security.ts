import type { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

import { ConfigService } from '@/global/core/services/config.service';

export class Security {
  constructor(private readonly config: ConfigService) {}

  apply(app: INestApplication) {
    app.use(
      helmet({
        contentSecurityPolicy: false,
      }),
    );

    app.enableCors({
      origin: this.config.get('CORS_ORIGINS')?.split(',') || [],
      credentials: true,
    });

    app.enableShutdownHooks();
  }
}
