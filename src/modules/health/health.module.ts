import { Global, Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthService } from './core/services/health.service';

@Global()
@Module({
  imports: [TerminusModule],
  controllers: [],
  providers: [HealthService],
})
export class HealthModule {}
