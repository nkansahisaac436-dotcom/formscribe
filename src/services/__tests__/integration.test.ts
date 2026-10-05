import fs from 'fs';
import path from 'path';
import { describe, expect, test } from '@jest/globals';
import JSZip from 'jszip';
import { generateDocxBase64 } from '../exportDocx';
import { generatePptxBase64 } from '../exportPptx';
import { parseFormData } from '../formParser';
import { ExportConfig } from '../../types/export';

describe('Real Target Form (35 Pages) - https://forms.gle/cyEzZ6PBuYSPd1cz8', () => {
  const fixturePath = path.resolve(__dirname, 'real35PageFormFixture.json');
  const rawData = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

  test('parses all 35 pages and 146 questions from real Google Form data', () => {
    const parsed = parseFormData(rawData, 'https://forms.gle/cyEzZ6PBuYSPd1cz8');

    expect(parsed.title).toContain('ATWIMA MPONUA DISTRICT');
    expect(parsed.totalPages).toBe(35);
    expect(parsed.totalQuestions).toBe(146);
    expect(parsed.pages.length).toBe(35);

    // Verify first, second, and last section titles
    expect(parsed.pages[0].title).toBe('Section 1');
    expect(parsed.pages[1].title).toBe('SCHOOL DETAILS');
    expect(parsed.pages[34].title).toBe('INFRASTRUCTURE SECTION');
  });

  test('exports 35-page form to valid Word (.docx) package with Cover & TOC', async () => {
    const parsed = parseFormData(rawData, 'https://forms.gle/cyEzZ6PBuYSPd1cz8');

    const docxConfig: ExportConfig = {
      format: 'docx',
      style: 'full',
      includeAnswerLines: true,
      includeCoverPage: true,
      includeTableOfContents: true,
      includePageNumbers: true,
      documentTitle: parsed.title,
      authorName: 'FormScribe Automated Verification',
    };

    const docxBase64 = await generateDocxBase64(parsed, docxConfig);
    expect(typeof docxBase64).toBe('string');
    expect(docxBase64.length).toBeGreaterThan(15000);

    // Verify OpenXML package structure
    const docxBuffer = Buffer.from(docxBase64, 'base64');
    const docxZip = await JSZip.loadAsync(docxBuffer);
    expect(docxZip.file('word/document.xml')).not.toBeNull();
  });

  test('exports 35-page form to valid PowerPoint (.pptx) presentation with pagination', async () => {
    const parsed = parseFormData(rawData, 'https://forms.gle/cyEzZ6PBuYSPd1cz8');

    const pptxConfig: ExportConfig = {
      format: 'pptx',
      style: 'full',
      includeAnswerLines: true,
      includeCoverPage: true,
      includeTableOfContents: false,
      includePageNumbers: true,
      documentTitle: parsed.title,
      authorName: 'FormScribe Automated Verification',
    };

    const pptxBase64 = await generatePptxBase64(parsed, pptxConfig);
    expect(typeof pptxBase64).toBe('string');
    expect(pptxBase64.length).toBeGreaterThan(50000);

    // Verify OpenXML presentation structure
    const pptxBuffer = Buffer.from(pptxBase64, 'base64');
    const pptxZip = await JSZip.loadAsync(pptxBuffer);
    expect(pptxZip.file('ppt/presentation.xml')).not.toBeNull();
  });
});
