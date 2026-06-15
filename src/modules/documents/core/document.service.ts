import { Injectable } from '@nestjs/common';

import { EmbeddingService } from '@/modules/embedding/core/embedding.service';
import {
  ALL_COLLECTIONS,
  COLLECTION_MAP,
  type FileType,
} from '@/shared/collections.constants';

import { DocumentVectorRepository } from '../infrastructure/repositories/document-vector.repository';
import { DocxParser } from './parsers/docx.parser';
import { MarkdownParser } from './parsers/markdown.parser';
import { PdfParser } from './parsers/pdf.parser';
import { TxtParser } from './parsers/txt.parser';
import { ChunkService } from './services/chunk.service';

export interface IngestResult {
  title: string;
  filename: string;
  file_type: string;
  collection: string;
  chunks_count: number;
}

export interface SearchResultItem {
  score: number;
  text: string;
  title: string;
  filename: string;
  file_type: string;
  chunk_index: number;
  chunk_total: number;
  ingested_at: string;
}

export interface UploadedFile {
  originalname: string;
  buffer: Buffer;
}

@Injectable()
export class DocumentService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly chunkService: ChunkService,
    private readonly documentVectorRepository: DocumentVectorRepository,
    private readonly txtParser: TxtParser,
    private readonly markdownParser: MarkdownParser,
    private readonly pdfParser: PdfParser,
    private readonly docxParser: DocxParser,
  ) {}

  async ingest(file: UploadedFile, title: string): Promise<IngestResult> {
    const fileType = this.detectFileType(file.originalname);
    const collection = COLLECTION_MAP[fileType];

    const text = await this.parseFile(file.buffer, fileType);
    const chunks = this.chunkService.chunk(text);

    await this.documentVectorRepository.ensureCollection(collection);
    await this.documentVectorRepository.deleteByTitle(collection, title);

    const vectors = await Promise.all(
      chunks.map((chunk) => this.embeddingService.execute(chunk)),
    );

    await this.documentVectorRepository.insertChunks(
      collection,
      title,
      file.originalname,
      fileType,
      chunks,
      vectors,
    );

    return {
      title,
      filename: file.originalname,
      file_type: fileType,
      collection,
      chunks_count: chunks.length,
    };
  }

  async search(query: string, type?: string): Promise<SearchResultItem[]> {
    const queryVector = await this.embeddingService.execute(query);

    const collections =
      type && type in COLLECTION_MAP
        ? [COLLECTION_MAP[type as FileType]]
        : ALL_COLLECTIONS;

    const allResults = await Promise.all(
      collections.map((col) =>
        this.documentVectorRepository.search(col, queryVector, 5),
      ),
    );

    return allResults
      .flat()
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((r) => ({
        score: r.score,
        text: r.payload.text,
        title: r.payload.title,
        filename: r.payload.filename,
        file_type: r.payload.file_type,
        chunk_index: r.payload.chunk_index,
        chunk_total: r.payload.chunk_total,
        ingested_at: r.payload.ingested_at,
      }));
  }

  private detectFileType(filename: string): FileType {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    if (ext in COLLECTION_MAP) return ext as FileType;
    return 'txt';
  }

  private async parseFile(buffer: Buffer, fileType: FileType): Promise<string> {
    switch (fileType) {
      case 'pdf':
        return this.pdfParser.parse(buffer);
      case 'docx':
        return this.docxParser.parse(buffer);
      case 'md':
        return this.markdownParser.parse(buffer);
      default:
        return this.txtParser.parse(buffer);
    }
  }
}
