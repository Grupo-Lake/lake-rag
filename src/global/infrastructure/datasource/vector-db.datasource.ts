import { Injectable } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';

import { ConfigService } from '@/global/core/services/config.service';
import { AppLogger } from '@/global/core/services/observability/logger.service';

@Injectable()
export class VectorDbDatasource {
  public readonly client: QdrantClient;
  private readonly COLLECTION_NAME = 'KNOWLEDGE_BASE';

  constructor(
    private readonly configService: ConfigService,
    private readonly appLogger: AppLogger,
  ) {
    this.client = new QdrantClient({
      host: this.configService.get('QDRANT_HOST'),
      port: this.configService.get('QDRANT_PORT'),
    });

    this.setup().catch((err: unknown) => {
      if (err instanceof Error) {
        this.appLogger.error('Error setting up vector database:', err.message);
      } else {
        this.appLogger.error('Error setting up vector database:', String(err));
      }
    });
  }

  private async setup() {
    const { collections } = await this.client.getCollections();

    const collectionExists = collections.some(
      (c) => c.name === this.COLLECTION_NAME,
    );

    if (!collectionExists) {
      this.appLogger.log('CREATING COLLECTION...');

      await this.client.createCollection(this.COLLECTION_NAME, {
        vectors: {
          size: 768, // OBRIGATÓRIO: O tamanho exato do vetor do Gemini text-embedding-004
          distance: 'Cosine', // Busca semântica em textos
        },
      });
    }
  }
}
