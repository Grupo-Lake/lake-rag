import { AppLogger } from '@/global/core/services/observability/logger.service';
import { VectorDbDatasource } from '@/global/infrastructure/datasource/vector-db.datasource';

import { RagVectorRepository } from './rag-vector.repository';

const mockSearch = jest.fn();
const mockVectorDb = {
  client: { search: mockSearch },
} as unknown as VectorDbDatasource;

const mockWarn = jest.fn();
const mockLogger = { warn: mockWarn };

describe('RagVectorRepository', () => {
  let repo: RagVectorRepository;

  beforeEach(() => {
    mockSearch.mockReset();
    mockWarn.mockReset();
    repo = new RagVectorRepository(
      mockVectorDb as unknown as VectorDbDatasource,
      mockLogger as unknown as AppLogger,
    );
  });

  it('searches each collection in parallel and merges results', async () => {
    const queryVector = [0.1, 0.2, 0.3];

    mockSearch
      .mockResolvedValueOnce([
        {
          score: 0.9,
          payload: {
            title: 'Doc A',
            filename: 'a.pdf',
            file_type: 'pdf',
            chunk_index: 0,
            chunk_total: 2,
            text: 'chunk from pdf',
            ingested_at: '2024-01-01T00:00:00.000Z',
          },
        },
      ])
      .mockResolvedValueOnce([
        {
          score: 0.8,
          payload: {
            title: 'Doc B',
            filename: 'b.txt',
            file_type: 'txt',
            chunk_index: 1,
            chunk_total: 3,
            text: 'chunk from txt',
            ingested_at: '2024-01-01T00:00:00.000Z',
          },
        },
      ]);

    const results = await repo.searchCollections(
      ['documents_pdf', 'documents_txt'],
      queryVector,
      5,
    );

    expect(mockSearch).toHaveBeenCalledTimes(2);
    expect(mockSearch).toHaveBeenCalledWith('documents_pdf', {
      vector: queryVector,
      limit: 5,
      with_payload: true,
    });
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ score: 0.9, text: 'chunk from pdf' });
    expect(results[1]).toMatchObject({ score: 0.8, text: 'chunk from txt' });
  });

  it('silently skips collections that do not exist yet', async () => {
    mockSearch
      .mockRejectedValueOnce(new Error('Not found: collection documents_pdf'))
      .mockResolvedValueOnce([
        {
          score: 0.8,
          payload: {
            title: 'Doc B',
            filename: 'b.txt',
            file_type: 'txt',
            chunk_index: 0,
            chunk_total: 1,
            text: 'found text',
            ingested_at: '2024-01-01T00:00:00.000Z',
          },
        },
      ]);

    const results = await repo.searchCollections(
      ['documents_pdf', 'documents_txt'],
      [0.1],
      5,
    );

    expect(results).toHaveLength(1);
    expect(results[0].text).toBe('found text');
  });

  it('returns empty array when all collections return empty', async () => {
    mockSearch.mockResolvedValue([]);

    const results = await repo.searchCollections(['documents_pdf'], [0.1], 5);

    expect(results).toHaveLength(0);
  });

  it('logs a warning when a collection search fails', async () => {
    mockSearch.mockRejectedValueOnce(new Error('connection refused'));
    mockSearch.mockResolvedValueOnce([]);

    await repo.searchCollections(['documents_pdf', 'documents_txt'], [0.1], 5);

    expect(mockWarn).toHaveBeenCalledTimes(1);
    expect(mockWarn).toHaveBeenCalledWith(
      expect.stringContaining('documents_pdf'),
      expect.any(String),
    );
  });

  it('throws when all collection searches fail', async () => {
    mockSearch.mockRejectedValue(new Error('connection refused'));

    await expect(
      repo.searchCollections(['documents_pdf', 'documents_txt'], [0.1], 5),
    ).rejects.toThrow('All vector database collection searches failed');
  });
});
