import { Module } from '@nestjs/common';

import { EmbeddingModule } from '../embedding/embedding.module';
import { RagController } from './application/controllers/rag.controller';
import { RagService } from './core/rag.service';
import { RagVectorRepository } from './infrastructure/repositories/rag-vector.repository';

@Module({
  imports: [EmbeddingModule],
  controllers: [RagController],
  providers: [RagService, RagVectorRepository],
})
export class RagModule {}
