import { Module } from '@nestjs/common';

import { EmbeddingModule } from '../embedding/embedding.module';
import { DocumentsController } from './application/controllers/documents.controller';
import { DocumentService } from './core/document.service';
import { DocxParser } from './core/parsers/docx.parser';
import { MarkdownParser } from './core/parsers/markdown.parser';
import { PdfParser } from './core/parsers/pdf.parser';
import { TxtParser } from './core/parsers/txt.parser';
import { ChunkService } from './core/services/chunk.service';
import { DocumentVectorRepository } from './infrastructure/repositories/document-vector.repository';

@Module({
  imports: [EmbeddingModule],
  controllers: [DocumentsController],
  providers: [
    DocumentService,
    ChunkService,
    DocumentVectorRepository,
    TxtParser,
    MarkdownParser,
    PdfParser,
    DocxParser,
  ],
})
export class DocumentsModule {}
