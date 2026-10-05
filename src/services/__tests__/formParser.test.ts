import { describe, expect, test } from '@jest/globals';
import {
  extractDataFromHtml,
  getQuestionTypeInfo,
  isValidGoogleFormsUrl,
  normalizeFormUrl,
  parseFormData,
  safeGet,
} from '../formParser';
import { mockPublicLoadData } from './mockFormData';

describe('formParser service', () => {
  describe('Utility and Validation functions', () => {
    test('isValidGoogleFormsUrl detects valid Google Forms URLs', () => {
      expect(isValidGoogleFormsUrl('https://forms.gle/cyEzZ6PBuYSPd1cz8')).toBe(true);
      expect(isValidGoogleFormsUrl('https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform')).toBe(true);
      expect(isValidGoogleFormsUrl('http://google.com/forms/123')).toBe(true);
      expect(isValidGoogleFormsUrl('https://example.com/not-a-form')).toBe(false);
      expect(isValidGoogleFormsUrl('')).toBe(false);
    });

    test('normalizeFormUrl prepends https:// if missing', () => {
      expect(normalizeFormUrl('forms.gle/test')).toBe('https://forms.gle/test');
      expect(normalizeFormUrl('https://forms.gle/test')).toBe('https://forms.gle/test');
    });

    test('safeGet accesses deep properties without throwing', () => {
      const obj = { a: [{ b: { c: 42 } }] };
      expect(safeGet(obj, 'a', 0, 'b', 'c')).toBe(42);
      expect(safeGet(obj, 'a', 5, 'b', 'c')).toBeUndefined();
      expect(safeGet(null, 'a')).toBeUndefined();
    });

    test('getQuestionTypeInfo maps type codes correctly', () => {
      expect(getQuestionTypeInfo(0).typeCategory).toBe('short_answer');
      expect(getQuestionTypeInfo(1).typeCategory).toBe('paragraph');
      expect(getQuestionTypeInfo(2).typeCategory).toBe('multiple_choice');
      expect(getQuestionTypeInfo(3).typeCategory).toBe('dropdown');
      expect(getQuestionTypeInfo(4).typeCategory).toBe('checkboxes');
      expect(getQuestionTypeInfo(5).typeCategory).toBe('linear_scale');
      expect(getQuestionTypeInfo(6).typeCategory).toBe('section_header');
      expect(getQuestionTypeInfo(7).typeCategory).toBe('grid');
      expect(getQuestionTypeInfo(8).typeCategory).toBe('page_break');
      expect(getQuestionTypeInfo(9).typeCategory).toBe('date');
      expect(getQuestionTypeInfo(10).typeCategory).toBe('time');
      expect(getQuestionTypeInfo(13).typeCategory).toBe('file_upload');
    });
  });

  describe('HTML Extraction and Error Handling', () => {
    test('extractDataFromHtml extracts FB_PUBLIC_LOAD_DATA_ from valid script', () => {
      const html = `<html><head><script>var FB_PUBLIC_LOAD_DATA_ = [null, ["Title", []]];</script></head></html>`;
      const data = extractDataFromHtml(html);
      expect(Array.isArray(data)).toBe(true);
      expect(data[1][0]).toBe('Title');
    });

    test('extractDataFromHtml detects Google Sign-in required', () => {
      const html = `<html><body>Sign in to your Google Account to access this form</body></html>`;
      expect(() => extractDataFromHtml(html)).toThrow(
        expect.objectContaining({ code: 'SIGN_IN_REQUIRED' })
      );
    });

    test('extractDataFromHtml detects Closed form', () => {
      const html = `<html><body>This form is no longer accepting responses</body></html>`;
      expect(() => extractDataFromHtml(html)).toThrow(
        expect.objectContaining({ code: 'FORM_CLOSED' })
      );
    });

    test('extractDataFromHtml detects 404 Form Not Found', () => {
      const html = `<html><head><title>404 Not Found</title></head></html>`;
      expect(() => extractDataFromHtml(html)).toThrow(
        expect.objectContaining({ code: 'FORM_NOT_FOUND' })
      );
    });
  });

  describe('parseFormData structure mapping', () => {
    const parsed = parseFormData(mockPublicLoadData, 'https://forms.gle/mock');

    test('correctly parses form title and description', () => {
      expect(parsed.title).toBe('Sample Comprehensive Survey Form');
      expect(parsed.description).toBe('This is the form description header.');
    });

    test('correctly splits items across pages by type 8 (page break)', () => {
      expect(parsed.totalPages).toBe(2);
      expect(parsed.pages[0].pageNumber).toBe(1);
      expect(parsed.pages[0].title).toBe('Section 1');
      expect(parsed.pages[1].pageNumber).toBe(2);
      expect(parsed.pages[1].title).toBe('Section 2: Contact Information');
    });

    test('correctly parses questions on page 1', () => {
      const page1 = parsed.pages[0];
      expect(page1.questions.length).toBe(4);

      // Question 1: Short answer, required
      const q1 = page1.questions[0];
      expect(q1.title).toBe('What is your full name?');
      expect(q1.typeCategory).toBe('short_answer');
      expect(q1.required).toBe(true);

      // Question 3: Multiple choice with Other and Jump target
      const q3 = page1.questions[2];
      expect(q3.typeCategory).toBe('multiple_choice');
      expect(q3.options.length).toBe(3);
      expect(q3.options[0].text).toBe('Engineering');
      expect(q3.options[0].goToPage).toBe(2);
      expect(q3.options[2].isOther).toBe(true);
      expect(q3.options[2].text).toBe('Other...');

      // Question 4: Linear scale
      const q4 = page1.questions[3];
      expect(q4.typeCategory).toBe('linear_scale');
      expect(q4.scaleInfo).toBeDefined();
      expect(q4.scaleInfo?.min).toBe(1);
      expect(q4.scaleInfo?.max).toBe(5);
      expect(q4.scaleInfo?.minLabel).toBe('Very Poor');
      expect(q4.scaleInfo?.maxLabel).toBe('Excellent');
    });

    test('correctly parses questions on page 2', () => {
      const page2 = parsed.pages[1];
      expect(page2.questions.length).toBe(5);

      // Question 6: Checkboxes
      const q6 = page2.questions[0];
      expect(q6.typeCategory).toBe('checkboxes');
      expect(q6.options.length).toBe(3);
      expect(q6.options[1].text).toBe('Laptop');

      // Question 7: Dropdown
      const q7 = page2.questions[1];
      expect(q7.typeCategory).toBe('dropdown');
      expect(q7.required).toBe(true);

      // Section header block (type 6)
      const secBlock = page2.questions[4];
      expect(secBlock.typeCategory).toBe('section_header');
      expect(secBlock.title).toBe('Office Notes Block');
    });

    test('correctly computes global totals', () => {
      // 8 non-header questions total
      expect(parsed.totalQuestions).toBe(8);
      // Required: Q1, Q3, Q4, Q7 = 4
      expect(parsed.requiredQuestionsCount).toBe(4);
    });
  });
});
