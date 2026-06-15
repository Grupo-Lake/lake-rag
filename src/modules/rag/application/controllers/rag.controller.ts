import { Body, Controller, HttpCode, Post } from '@nestjs/common';

import { RagService } from '../../core/rag.service';

@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('query')
  @HttpCode(200)
  async query(@Body() body: unknown) {
    return this.ragService.query(body);
  }
}
