import { Injectable } from '@nestjs/common';
import { PDFParse } from 'pdf-parse';

import { type DocumentParser } from './document-parser.interface';

@Injectable()
export class PdfParser implements DocumentParser {
  async parse(buffer: Buffer): Promise<string> {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }
}
