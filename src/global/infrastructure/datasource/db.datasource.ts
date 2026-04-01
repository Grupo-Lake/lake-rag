import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from 'generated/prisma/client';

import { ConfigService } from '@/global/core/services/config.service';
import { AppLogger } from '@/global/core/services/observability/logger.service';

@Injectable()
export class DBDatasource
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {
    logger.log('Initializing database connection...', 'DBDatasource');

    const databaseUrl = config.get('DATABASE_URL') ?? '';
    const databaseSchema = config.get('DATABASE_SCHEMA');

    const adapter = new PrismaPg(
      { connectionString: databaseUrl },
      { schema: databaseSchema },
    );

    super({ log: ['query', 'error', 'warn'], adapter });
    this.config = config;
    this.logger = logger;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
