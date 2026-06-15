// src/modules/rag/application/dtos/rag-query.dto.ts
import { z } from 'zod';

import { FILE_TYPES } from '@/shared/collections.constants';

export const RagQuerySchema = z.object({
  query: z.string().min(1, 'query must not be empty'),
  top_k: z.number().int().min(1).max(20).default(5),
  min_score: z.number().min(0).max(1).default(0),
  file_types: z.array(z.enum(FILE_TYPES)).optional(),
});

export type RagQueryDto = z.infer<typeof RagQuerySchema>;

export interface RagResultSource {
  score: number;
  title: string;
  filename: string;
  file_type: string;
  text: string;
  chunk_index: number;
  chunk_total: number;
}

export interface RagResponse {
  query: string;
  context: string;
  sources: RagResultSource[];
}
