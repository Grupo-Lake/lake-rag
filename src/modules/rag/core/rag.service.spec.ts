import { BadRequestException } from '@nestjs/common';

import { EmbeddingService } from '@/modules/embedding/core/embedding.service';
import { RagVectorRepository } from '@/modules/rag/infrastructure/repositories/rag-vector.repository';

import { RagService } from './rag.service';

const mockEmbed = jest.fn();
const mockEmbeddingService = { execute: mockEmbed };

const mockSearchCollections = jest.fn();
const mockRagVectorRepository = { searchCollections: mockSearchCollections };

const FAKE_VECTOR = Array.from({ length: 768 }, (_, i) => i * 0.001);

const makeResult = (overrides: Record<string, unknown> = {}) => ({
  score: 0.9,
  title: 'Doc',
  filename: 'doc.pdf',
  file_type: 'pdf',
  text: 'relevant text',
  chunk_index: 0,
  chunk_total: 1,
  ...overrides,
});

describe('RagService', () => {
  let service: RagService;

  beforeEach(() => {
    mockEmbed.mockReset();
    mockSearchCollections.mockReset();
    service = new RagService(
      mockEmbeddingService as unknown as EmbeddingService,
      mockRagVectorRepository as unknown as RagVectorRepository,
    );
  });

  describe('input validation', () => {
    it('throws BadRequestException when query is empty string', async () => {
      await expect(service.query({ query: '' })).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when top_k exceeds 20', async () => {
      await expect(
        service.query({ query: 'hello', top_k: 21 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when min_score is above 1', async () => {
      await expect(
        service.query({ query: 'hello', min_score: 1.5 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('collection selection', () => {
    it('searches all four collections when file_types is not provided', async () => {
      mockEmbed.mockResolvedValue(FAKE_VECTOR);
      mockSearchCollections.mockResolvedValue([]);

      await service.query({ query: 'what is Node.js?' });

      expect(mockSearchCollections).toHaveBeenCalledWith(
        ['documents_txt', 'documents_md', 'documents_pdf', 'documents_docx'],
        FAKE_VECTOR,
        expect.any(Number),
      );
    });

    it('searches only requested collections when file_types is provided', async () => {
      mockEmbed.mockResolvedValue(FAKE_VECTOR);
      mockSearchCollections.mockResolvedValue([]);

      await service.query({ query: 'test', file_types: ['pdf', 'md'] });

      expect(mockSearchCollections).toHaveBeenCalledWith(
        ['documents_pdf', 'documents_md'],
        FAKE_VECTOR,
        expect.any(Number),
      );
    });
  });

  describe('filtering and ranking', () => {
    it('excludes results below min_score', async () => {
      mockEmbed.mockResolvedValue(FAKE_VECTOR);
      mockSearchCollections.mockResolvedValue([
        makeResult({ score: 0.9 }),
        makeResult({ score: 0.3 }),
      ]);

      const result = await service.query({ query: 'test', min_score: 0.5 });

      expect(result.sources).toHaveLength(1);
      expect(result.sources[0].score).toBe(0.9);
    });

    it('returns results sorted by score descending and capped at top_k', async () => {
      mockEmbed.mockResolvedValue(FAKE_VECTOR);
      mockSearchCollections.mockResolvedValue([
        makeResult({ score: 0.5, title: 'C' }),
        makeResult({ score: 0.9, title: 'A' }),
        makeResult({ score: 0.7, title: 'B' }),
      ]);

      const result = await service.query({ query: 'test', top_k: 2 });

      expect(result.sources).toHaveLength(2);
      expect(result.sources[0].score).toBe(0.9);
      expect(result.sources[1].score).toBe(0.7);
    });
  });

  describe('response shape', () => {
    it('echoes the original query in the response', async () => {
      mockEmbed.mockResolvedValue(FAKE_VECTOR);
      mockSearchCollections.mockResolvedValue([makeResult()]);

      const result = await service.query({ query: 'what is Node.js?' });

      expect(result.query).toBe('what is Node.js?');
    });

    it('includes title, filename, and text in formatted context', async () => {
      mockEmbed.mockResolvedValue(FAKE_VECTOR);
      mockSearchCollections.mockResolvedValue([
        makeResult({
          title: 'My Doc',
          filename: 'my.pdf',
          text: 'The text here.',
        }),
      ]);

      const result = await service.query({ query: 'test' });

      expect(result.context).toContain('My Doc');
      expect(result.context).toContain('my.pdf');
      expect(result.context).toContain('The text here.');
    });

    it('returns empty context string when no results pass the score threshold', async () => {
      mockEmbed.mockResolvedValue(FAKE_VECTOR);
      mockSearchCollections.mockResolvedValue([makeResult({ score: 0.1 })]);

      const result = await service.query({ query: 'test', min_score: 0.8 });

      expect(result.context).toBe('');
      expect(result.sources).toHaveLength(0);
    });
  });
});
