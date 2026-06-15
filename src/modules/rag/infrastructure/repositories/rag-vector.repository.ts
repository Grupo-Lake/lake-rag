import { Injectable } from '@nestjs/common';

import { VectorDbDatasource } from '@/global/infrastructure/datasource/vector-db.datasource';
import { type ChunkPayload } from '@/shared/collections.constants';

export interface RagSearchResult {
  score: number;
  title: string;
  filename: string;
  file_type: string;
  text: string;
  chunk_index: number;
  chunk_total: number;
}

@Injectable()
export class RagVectorRepository {
  constructor(private readonly vectorDb: VectorDbDatasource) {}

  async searchCollections(
    collections: string[],
    queryVector: number[],
    limitPerCollection: number,
  ): Promise<RagSearchResult[]> {
    const settled = await Promise.allSettled(
      collections.map((col) =>
        this.vectorDb.client.search(col, {
          vector: queryVector,
          limit: limitPerCollection,
          with_payload: true,
        }),
      ),
    );

    return settled
      .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
      .map((r) => {
        const payload = r.payload as unknown as ChunkPayload;
        return {
          score: r.score,
          title: payload.title,
          filename: payload.filename,
          file_type: payload.file_type,
          text: payload.text,
          chunk_index: payload.chunk_index,
          chunk_total: payload.chunk_total,
        };
      });
  }
}
