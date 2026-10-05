import { describe, expect, test } from '@jest/globals';
import { generatePptxBase64 } from '../exportPptx';
import { parseFormData } from '../formParser';
import { ExportConfig } from '../../types/export';
import { mockPublicLoadData } from './mockFormData';

describe('exportPptx service', () => {
  const parsedForm = parseFormData(mockPublicLoadData, 'https://forms.gle/mock');

  test('generates valid pptx base64 presentation', async () => {
    const config: ExportConfig = {
      format: 'pptx',
      style: 'full',
      includeAnswerLines: true,
      includeCoverPage: true,
      includeTableOfContents: false,
      includePageNumbers: true,
      documentTitle: 'Survey Presentation',
      authorName: 'FormScribe PPTX Test',
    };

    const base64 = await generatePptxBase64(parsedForm, config);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(5000);
  });
});
