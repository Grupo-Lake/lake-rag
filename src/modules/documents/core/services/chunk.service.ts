import { Injectable } from '@nestjs/common';

@Injectable()
export class ChunkService {
  private readonly CHUNK_SIZE = 500;
  private readonly OVERLAP = 50;

  chunk(text: string): string[] {
    const paragraphs = text.split(/\n\n+/);
    const result: string[] = [];

    for (const paragraph of paragraphs) {
      const subChunks = this.splitIntoSubChunks(paragraph);
      const withOverlap = this.applyOverlap(subChunks);
      result.push(...withOverlap);
    }

    return result.filter((c) => c.length > 0);
  }

  private splitIntoSubChunks(text: string): string[] {
    if (text.length <= this.CHUNK_SIZE) {
      return [text];
    }

    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      chunks.push(text.slice(start, start + this.CHUNK_SIZE));
      start += this.CHUNK_SIZE;
    }
    return chunks;
  }

  private applyOverlap(chunks: string[]): string[] {
    return chunks.map((chunk, i) => {
      if (i === 0) return chunk.trim();
      const overlap = chunks[i - 1].slice(-this.OVERLAP);
      return (overlap + chunk).trim();
    });
  }
}
