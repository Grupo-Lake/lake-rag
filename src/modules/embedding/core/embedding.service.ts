import { Injectable } from '@nestjs/common';

import { AppLogger } from '@/global/core/services/observability/logger.service';
import { GeminiRepository } from '@/global/infrastructure/repositories/gemini.repository';

@Injectable()
export class EmbeddingService {
  constructor(
    private readonly logger: AppLogger,
    private readonly geminiRepository: GeminiRepository,
  ) {}

  async execute(text: string): Promise<number[]> {
    this.logger.log('Executing embedding service...');

    return this.geminiRepository.embedding(text);
  }
}
