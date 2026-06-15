import { Injectable } from '@nestjs/common';
import mammoth from 'mammoth';

import { type DocumentParser } from './document-parser.interface';

@Injectable()
export class DocxParser implements DocumentParser {
  async parse(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
