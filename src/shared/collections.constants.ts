export const FILE_TYPES = ['txt', 'md', 'pdf', 'docx'] as const;
export type FileType = (typeof FILE_TYPES)[number];

export const COLLECTION_MAP: Record<FileType, string> = {
  txt: 'documents_txt',
  md: 'documents_md',
  pdf: 'documents_pdf',
  docx: 'documents_docx',
};

export const ALL_COLLECTIONS = Object.values(COLLECTION_MAP);

export interface ChunkPayload {
  title: string;
  filename: string;
  file_type: string;
  chunk_index: number;
  chunk_total: number;
  text: string;
  ingested_at: string;
}
