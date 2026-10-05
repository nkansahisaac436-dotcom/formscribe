export type ExportFormat = 'docx' | 'pptx' | 'both';

export type ExportStyle = 'full' | 'simple';

export interface ExportConfig {
  format: ExportFormat;
  style: ExportStyle;
  includeAnswerLines: boolean;
  includeCoverPage: boolean;
  includeTableOfContents: boolean;
  includePageNumbers: boolean;
  documentTitle: string;
  authorName: string;
}

export interface ExportedFileInfo {
  format: 'docx' | 'pptx';
  fileName: string;
  fileUri: string;
  fileSizeBytes: number;
}

export interface ExportResult {
  files: ExportedFileInfo[];
  exportedAt: string;
  documentTitle: string;
}
