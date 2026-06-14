import { GoogleGenerativeAI } from '@google/generative-ai';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GeminiRepository {
  private readonly ai: GoogleGenerativeAI;

  constructor(
    @Inject('GEMINI_API_KEY') private readonly GEMINI_API_KEY: string,
  ) {
    this.ai = new GoogleGenerativeAI(this.GEMINI_API_KEY);
  }

  async embedding(text: string): Promise<number[]> {
    const model = this.ai.getGenerativeModel({ model: 'text-embedding-004' });

    const result = await model.embedContent(text);

    return result.embedding.values;
  }
}
