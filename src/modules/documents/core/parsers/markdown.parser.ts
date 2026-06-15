import { Injectable } from '@nestjs/common';

import { type DocumentParser } from './document-parser.interface';

@Injectable()
export class MarkdownParser implements DocumentParser {
  parse(buffer: Buffer): Promise<string> {
    return Promise.resolve(buffer.toString('utf-8'));
  }
}
