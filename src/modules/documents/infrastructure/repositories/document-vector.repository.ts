import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { VectorDbDatasource } from '@/global/infrastructure/datasource/vector-db.datasource';
import { type ChunkPayload } from '@/shared/collections.constants';

export interface SearchResult {
  score: number;
  payload: ChunkPayload;
}

@Injectable()
export class DocumentVectorRepository {
  constructor(private readonly vectorDb: VectorDbDatasource) {}

  async ensureCollection(name: string): Promise<void> {
    const { collections } = await this.vectorDb.client.getCollections();
    const exists = collections.some((c) => c.name === name);
    if (!exists) {
      await this.vectorDb.client.createCollection(name, {
        vectors: { size: 768, distance: 'Cosine' },
      });
    }
  }

  async deleteByTitle(collection: string, title: string): Promise<void> {
    await this.vectorDb.client.delete(collection, {
      filter: {
        must: [{ key: 'title', match: { value: title } }],
      },
    });
  }

  async insertChunks(
    collection: string,
    title: string,
    filename: string,
    fileType: string,
    chunks: string[],
    vectors: number[][],
  ): Promise<void> {
    const ingestedAt = new Date().toISOString();
    const points = chunks.map((text, i) => ({
      id: randomUUID(),
      vector: vectors[i],
      payload: {
        title,
        filename,
        file_type: fileType,
        chunk_index: i,
        chunk_total: chunks.length,
        text,
        ingested_at: ingestedAt,
      } satisfies ChunkPayload,
    }));

    await this.vectorDb.client.upsert(collection, { points });
  }

  async search(
    collection: string,
    queryVector: number[],
    limit: number,
  ): Promise<SearchResult[]> {
    const results = await this.vectorDb.client.search(collection, {
      vector: queryVector,
      limit,
      with_payload: true,
    });

    return results.map((r) => ({
      score: r.score,
      payload: r.payload as unknown as ChunkPayload,
    }));
  }
}
