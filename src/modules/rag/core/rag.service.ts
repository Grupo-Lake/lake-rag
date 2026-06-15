import { BadRequestException, Injectable } from '@nestjs/common';

import { EmbeddingService } from '@/modules/embedding/core/embedding.service';
import {
  ALL_COLLECTIONS,
  COLLECTION_MAP,
  type FileType,
} from '@/shared/collections.constants';

import {
  type RagQueryDto,
  RagQuerySchema,
  type RagResponse,
  type RagResultSource,
} from '../application/dtos/rag-query.dto';
import { RagVectorRepository } from '../infrastructure/repositories/rag-vector.repository';

@Injectable()
export class RagService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly ragVectorRepository: RagVectorRepository,
  ) {}

  async query(rawInput: unknown): Promise<RagResponse> {
    const parsed = RagQuerySchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten().fieldErrors);
    }

    const dto: RagQueryDto = parsed.data;

    const collections = dto.file_types
      ? dto.file_types.map((ft) => COLLECTION_MAP[ft])
      : ALL_COLLECTIONS;

    const queryVector = await this.embeddingService.execute(dto.query);

    const rawResults = await this.ragVectorRepository.searchCollections(
      collections,
      queryVector,
      dto.top_k * 3,
    );

    const sources: RagResultSource[] = rawResults
      .filter((r) => r.score >= dto.min_score)
      .sort((a, b) => b.score - a.score)
      .slice(0, dto.top_k)
      .map((r) => ({ ...r, file_type: r.file_type as FileType }));

    return {
      query: dto.query,
      context: this.formatContext(sources),
      sources,
    };
  }

  private formatContext(sources: RagResultSource[]): string {
    if (sources.length === 0) return '';

    return sources
      .map(
        (s, i) =>
          `[${i + 1}] Title: "${s.title}" | Source: ${s.filename} | Relevance: ${(s.score * 100).toFixed(1)}%\n${s.text}`,
      )
      .join('\n\n');
  }
}
