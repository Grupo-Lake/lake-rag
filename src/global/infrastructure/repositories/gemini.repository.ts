import { GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '@/global/core/services/config.service';

@Injectable()
export class GeminiRepository {
  private readonly ai: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    this.ai = new GoogleGenerativeAI(this.configService.get('GEMINI_API_KEY'));
  }

  async embedding(text: string): Promise<number[]> {
    const model = this.ai.getGenerativeModel({ model: 'text-embedding-004' });

    const result = await model.embedContent(text);

    return result.embedding.values;
  }
}
