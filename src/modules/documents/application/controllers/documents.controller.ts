import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import {
  DocumentService,
  type UploadedFile as DocumentFile,
} from '../../core/document.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: DocumentFile,
    @Body('title') title: string,
  ) {
    return this.documentService.ingest(file, title);
  }

  @Get('search')
  async search(@Query('q') query: string, @Query('type') type?: string) {
    return this.documentService.search(query, type);
  }
}
