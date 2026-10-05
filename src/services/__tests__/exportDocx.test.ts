import { describe, expect, test } from '@jest/globals';
import { generateDocxBase64 } from '../exportDocx';
import { parseFormData } from '../formParser';
import { ExportConfig } from '../../types/export';
import { mockPublicLoadData } from './mockFormData';

describe('exportDocx service', () => {
  const parsedForm = parseFormData(mockPublicLoadData, 'https://forms.gle/mock');

  test('generates valid docx base64 in Full Detail mode with Cover and TOC', async () => {
    const config: ExportConfig = {
      format: 'docx',
      style: 'full',
      includeAnswerLines: true,
      includeCoverPage: true,
      includeTableOfContents: true,
      includePageNumbers: true,
      documentTitle: 'Survey Form Export',
      authorName: 'FormScribe Test',
    };

    const base64 = await generateDocxBase64(parsedForm, config);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(1000);
  });

  test('generates valid docx base64 in Simple mode without Cover or TOC', async () => {
    const config: ExportConfig = {
      format: 'docx',
      style: 'simple',
      includeAnswerLines: false,
      includeCoverPage: false,
      includeTableOfContents: false,
      includePageNumbers: false,
      documentTitle: 'Simple Survey',
      authorName: 'Tester',
    };

    const base64 = await generateDocxBase64(parsedForm, config);
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(500);
  });
});
