import {
  FormError,
  FormPage,
  FormQuestion,
  GridInfo,
  LinearScaleInfo,
  ParsedForm,
  QuestionOption,
  QuestionType,
} from '../types/form';

/**
 * Maps numeric Google Forms type code to question type category and human-readable name.
 */
export function getQuestionTypeInfo(typeCode: number): {
  typeCategory: QuestionType;
  typeName: string;
} {
  switch (typeCode) {
    case 0:
      return { typeCategory: 'short_answer', typeName: 'Short Answer' };
    case 1:
      return { typeCategory: 'paragraph', typeName: 'Paragraph' };
    case 2:
      return { typeCategory: 'multiple_choice', typeName: 'Multiple Choice' };
    case 3:
      return { typeCategory: 'dropdown', typeName: 'Dropdown' };
    case 4:
      return { typeCategory: 'checkboxes', typeName: 'Checkboxes' };
    case 5:
      return { typeCategory: 'linear_scale', typeName: 'Linear Scale' };
    case 6:
      return { typeCategory: 'section_header', typeName: 'Section Header' };
    case 7:
      return { typeCategory: 'grid', typeName: 'Grid' };
    case 8:
      return { typeCategory: 'page_break', typeName: 'Page Break' };
    case 9:
      return { typeCategory: 'date', typeName: 'Date' };
    case 10:
      return { typeCategory: 'time', typeName: 'Time' };
    case 11:
      return { typeCategory: 'image', typeName: 'Image Block' };
    case 12:
      return { typeCategory: 'video', typeName: 'Video Block' };
    case 13:
      return { typeCategory: 'file_upload', typeName: 'File Upload' };
    default:
      return { typeCategory: 'other', typeName: `Custom Question (Type ${typeCode})` };
  }
}

/**
 * Safe accessor helper to prevent runtime exceptions on arbitrary nested structures.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeGet<T = any>(obj: any, ...path: (string | number)[]): T | undefined {
  let current = obj;
  for (const key of path) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[key];
  }
  return current as T;
}

/**
 * Validates whether a URL looks like a Google Forms URL.
 */
export function isValidGoogleFormsUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== 'string') return false;
  const trimmed = rawUrl.trim();
  return (
    trimmed.includes('forms.gle/') ||
    trimmed.includes('docs.google.com/forms') ||
    trimmed.includes('google.com/forms')
  );
}

/**
 * Cleans and normalizes the input URL.
 */
export function normalizeFormUrl(rawUrl: string): string {
  let trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = 'https://' + trimmed;
  }
  return trimmed;
}

/**
 * Parses options from an answer details array.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseOptions(rawAnswerDetails: any[]): QuestionOption[] {
  const options: QuestionOption[] = [];
  if (!Array.isArray(rawAnswerDetails) || rawAnswerDetails.length === 0) {
    return options;
  }

  const primarySubItem = rawAnswerDetails[0];
  if (!primarySubItem || !Array.isArray(primarySubItem)) {
    return options;
  }

  const rawOptionsList = primarySubItem[1];
  if (Array.isArray(rawOptionsList)) {
    for (const opt of rawOptionsList) {
      if (!Array.isArray(opt)) {
        if (typeof opt === 'string' && opt.trim()) {
          options.push({ text: opt.trim() });
        }
        continue;
      }

      const textVal = opt[0];
      const isOtherFlag = opt[4] === 1;
      const jumpTarget = opt[2];

      let text = typeof textVal === 'string' ? textVal.trim() : '';
      if (!text && isOtherFlag) {
        text = 'Other...';
      }

      if (text || isOtherFlag) {
        const optionItem: QuestionOption = {
          text: text || 'Other...',
          isOther: isOtherFlag,
        };

        if (jumpTarget !== null && jumpTarget !== undefined) {
          optionItem.goToPage = jumpTarget;
          optionItem.note = `Jump navigation to section ${jumpTarget}`;
        }

        options.push(optionItem);
      }
    }
  }

  return options;
}

/**
 * Parses linear scale details (min, max, minLabel, maxLabel).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseScaleInfo(rawAnswerDetails: any[]): LinearScaleInfo | undefined {
  if (!Array.isArray(rawAnswerDetails) || rawAnswerDetails.length === 0) return undefined;
  const primarySubItem = rawAnswerDetails[0];
  if (!Array.isArray(primarySubItem)) return undefined;

  const rawOptions = primarySubItem[1];
  const scaleBounds = primarySubItem[3];

  let min = 1;
  let max = 5;
  let minLabel: string | undefined;
  let maxLabel: string | undefined;

  if (Array.isArray(scaleBounds) && scaleBounds.length >= 2) {
    if (typeof scaleBounds[0] === 'number') min = scaleBounds[0];
    if (typeof scaleBounds[1] === 'number') max = scaleBounds[1];
  } else if (Array.isArray(rawOptions) && rawOptions.length > 0) {
    const numericOpts = rawOptions
      .map((o) => (Array.isArray(o) ? parseInt(o[0], 10) : parseInt(String(o), 10)))
      .filter((n) => !isNaN(n));
    if (numericOpts.length > 0) {
      min = Math.min(...numericOpts);
      max = Math.max(...numericOpts);
    }
  }

  // Check for scale end labels
  const rawLabels = primarySubItem[4] || primarySubItem[3];
  if (Array.isArray(rawLabels)) {
    if (typeof rawLabels[0] === 'string' && rawLabels[0].trim()) minLabel = rawLabels[0].trim();
    if (typeof rawLabels[1] === 'string' && rawLabels[1].trim()) maxLabel = rawLabels[1].trim();
  }

  return { min, max, minLabel, maxLabel };
}

/**
 * Parses grid question details (multiple rows & columns).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseGridInfo(rawAnswerDetails: any[]): GridInfo | undefined {
  if (!Array.isArray(rawAnswerDetails) || rawAnswerDetails.length === 0) return undefined;

  const rows: string[] = [];
  const columns: string[] = [];

  for (const subItem of rawAnswerDetails) {
    if (!Array.isArray(subItem)) continue;
    const rowTitle = subItem[3]?.[0] || subItem[0];
    if (typeof rowTitle === 'string' && rowTitle.trim()) {
      rows.push(rowTitle.trim());
    }

    const opts = subItem[1];
    if (Array.isArray(opts) && columns.length === 0) {
      for (const col of opts) {
        const colText = Array.isArray(col) ? col[0] : col;
        if (typeof colText === 'string' && colText.trim()) {
          columns.push(colText.trim());
        }
      }
    }
  }

  if (rows.length > 0 || columns.length > 0) {
    return { rows, columns };
  }
  return undefined;
}

/**
 * Pure parser that transforms raw FB_PUBLIC_LOAD_DATA_ array into a structured ParsedForm.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseFormData(rawData: any, formUrl: string, resolvedUrl = ''): ParsedForm {
  if (!Array.isArray(rawData)) {
    throw new Error('Invalid form structure: Root data is not an array.');
  }

  // Defensive extraction of Form Title
  const formTitle: string =
    safeGet<string>(rawData, 1, 8) ||
    safeGet<string>(rawData, 3) ||
    safeGet<string>(rawData, 1, 0) ||
    'Untitled Form';

  // Defensive extraction of Form Description
  let formDescription: string =
    safeGet<string>(rawData, 1, 0) ||
    safeGet<string>(rawData, 1, 1) ||
    '';

  // If description matches the title exactly, avoid duplicate
  if (formDescription === formTitle) {
    formDescription = safeGet<string>(rawData, 1, 1) || '';
  }

  // Items are located at data[1][1]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawItems: any[] = safeGet<any[]>(rawData, 1, 1) || [];

  const pages: FormPage[] = [];
  let currentPageNumber = 1;
  let currentPageTitle = 'Page 1';
  let currentPageDescription = '';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentPageRawQuestions: any[] = [];

  // Group items by Page Breaks (type 8)
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    if (!Array.isArray(item)) continue;

    const itemTypeCode = typeof item[3] === 'number' ? item[3] : -1;
    const itemTitle = typeof item[1] === 'string' ? item[1].trim() : '';
    const itemHelpText = typeof item[2] === 'string' ? item[2].trim() : '';

    if (itemTypeCode === 8) {
      // Type 8: Page break / Section Header starting a new page
      pages.push({
        pageNumber: currentPageNumber,
        title: currentPageTitle,
        description: currentPageDescription,
        questions: processRawQuestions(currentPageRawQuestions, currentPageNumber),
      });

      currentPageNumber++;
      currentPageTitle = itemTitle || `Page ${currentPageNumber}`;
      currentPageDescription = itemHelpText || safeGet<string>(item, 4, 0, 1) || '';
      currentPageRawQuestions = [];
    } else {
      currentPageRawQuestions.push(item);
    }
  }

  // Push the final page
  pages.push({
    pageNumber: currentPageNumber,
    title: currentPageTitle,
    description: currentPageDescription,
    questions: processRawQuestions(currentPageRawQuestions, currentPageNumber),
  });

  // Calculate totals and assign global indices
  let globalIndex = 1;
  let requiredQuestionsCount = 0;
  let totalQuestions = 0;

  for (const page of pages) {
    for (const q of page.questions) {
      if (q.typeCategory !== 'section_header' && q.typeCategory !== 'page_break') {
        totalQuestions++;
        q.globalIndex = globalIndex++;
        if (q.required) {
          requiredQuestionsCount++;
        }
      }
    }
  }

  // If first page title is default and form has a title, adopt section name if exists
  if (pages.length > 0 && pages[0].title === 'Page 1' && formTitle) {
    pages[0].title = 'Section 1';
  }

  return {
    id: `form_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    url: formUrl,
    resolvedUrl: resolvedUrl || formUrl,
    title: formTitle.trim() || 'Untitled Form',
    description: formDescription.trim(),
    pages,
    totalQuestions,
    totalPages: pages.length,
    requiredQuestionsCount,
    fetchedAt: new Date().toISOString(),
    rawStructureSnippet: JSON.stringify(rawData).slice(0, 1000),
  };
}

/**
 * Transforms raw item arrays into FormQuestion objects.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function processRawQuestions(rawItems: any[], pageNumber: number): FormQuestion[] {
  const questions: FormQuestion[] = [];
  let orderInPage = 1;

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    if (!Array.isArray(item)) continue;

    const id = item[0] ?? `item_${pageNumber}_${i}`;
    const title = typeof item[1] === 'string' ? item[1].trim() : '';
    const description = typeof item[2] === 'string' ? item[2].trim() : '';
    const typeCode = typeof item[3] === 'number' ? item[3] : -1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const answerDetails = safeGet<any[]>(item, 4) || [];

    const { typeCategory, typeName } = getQuestionTypeInfo(typeCode);

    // Required flag is typically at answerDetails[0][2] === 1
    const isRequired = safeGet<number>(answerDetails, 0, 2) === 1;

    // Parse options for choice types
    let options: QuestionOption[] = [];
    if ([2, 3, 4].includes(typeCode)) {
      options = parseOptions(answerDetails);
    }

    // Parse linear scale info
    let scaleInfo: LinearScaleInfo | undefined;
    if (typeCode === 5) {
      scaleInfo = parseScaleInfo(answerDetails);
    }

    // Parse grid info
    let gridInfo: GridInfo | undefined;
    if (typeCode === 7) {
      gridInfo = parseGridInfo(answerDetails);
    }

    questions.push({
      id,
      title,
      description,
      typeCode,
      typeName,
      typeCategory,
      required: isRequired,
      options,
      scaleInfo,
      gridInfo,
      pageNumber,
      orderInPage: orderInPage++,
      globalIndex: 0, // Assigned after grouping
    });
  }

  return questions;
}

/**
 * Extracts raw FB_PUBLIC_LOAD_DATA_ from raw HTML string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractDataFromHtml(html: string): any {
  if (!html || typeof html !== 'string') {
    throw new Error('Empty or invalid HTML response.');
  }

  // Check for known Google Forms state markers
  if (
    html.includes('Sign in to your Google Account') ||
    html.includes('accounts.google.com/ServiceLogin') ||
    html.includes('docs.google.com/forms/u/0/d/e/') && html.includes('Sign in')
  ) {
    const error: FormError = {
      code: 'SIGN_IN_REQUIRED',
      message: 'This Google Form requires a Google account sign-in or is restricted to members of an organization. FormScribe can only access public forms.',
      rawHtmlSnippet: html.slice(0, 500),
    };
    throw error;
  }

  if (
    html.includes('This form is no longer accepting responses') ||
    html.includes('The form is closed') ||
    html.includes('no longer accepting responses')
  ) {
    const error: FormError = {
      code: 'FORM_CLOSED',
      message: 'This Google Form is closed and is no longer accepting responses.',
      rawHtmlSnippet: html.slice(0, 500),
    };
    throw error;
  }

  // Regex matching FB_PUBLIC_LOAD_DATA_ = [...];</script>
  const match = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);\s*<\/script>/);
  if (!match || !match[1]) {
    // Secondary fallback check if semicolon was omitted
    const fallbackMatch = html.match(/FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\])\s*;/);
    if (fallbackMatch && fallbackMatch[1]) {
      try {
        return JSON.parse(fallbackMatch[1]);
      } catch (e) {
        // Continue to error
      }
    }

    if (html.includes('404 Not Found') || html.includes('Google Docs - Page Not Found')) {
      const error: FormError = {
        code: 'FORM_NOT_FOUND',
        message: 'Google Form not found (404). Please verify the link.',
        rawHtmlSnippet: html.slice(0, 500),
      };
      throw error;
    }

    const error: FormError = {
      code: 'PARSE_ERROR',
      message: 'Could not find form data in the page HTML. The form might be private, deleted, or Google changed the format.',
      rawHtmlSnippet: html.slice(0, 800),
    };
    throw error;
  }

  try {
    return JSON.parse(match[1]);
  } catch (err) {
    const error: FormError = {
      code: 'PARSE_ERROR',
      message: 'Failed to parse form JSON data structure.',
      technicalDetails: err instanceof Error ? err.message : String(err),
      rawHtmlSnippet: match[1].slice(0, 800),
    };
    throw error;
  }
}

/**
 * Fetches a public Google Form and parses all pages into a ParsedForm.
 */
export async function fetchAndParseForm(rawUrl: string): Promise<ParsedForm> {
  const normalizedUrl = normalizeFormUrl(rawUrl);

  if (!isValidGoogleFormsUrl(normalizedUrl)) {
    const error: FormError = {
      code: 'INVALID_URL',
      message: 'Please provide a valid Google Forms URL (e.g. forms.gle/... or docs.google.com/forms/d/e/.../viewform).',
      url: rawUrl,
    };
    throw error;
  }

  let response: Response;
  try {
    response = await fetch(normalizedUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });
  } catch (netErr) {
    const error: FormError = {
      code: 'NETWORK_ERROR',
      message: 'Unable to connect to Google Forms. Please check your internet connection and try again.',
      technicalDetails: netErr instanceof Error ? netErr.message : String(netErr),
      url: normalizedUrl,
    };
    throw error;
  }

  if (response.status === 404) {
    const error: FormError = {
      code: 'FORM_NOT_FOUND',
      message: 'Google Form not found (404). Please verify the link.',
      url: normalizedUrl,
    };
    throw error;
  }

  if (!response.ok) {
    const error: FormError = {
      code: 'NETWORK_ERROR',
      message: `Failed to load form. HTTP status: ${response.status} (${response.statusText}).`,
      url: normalizedUrl,
    };
    throw error;
  }

  const html = await response.text();
  const rawData = extractDataFromHtml(html);
  const resolvedUrl = response.url || normalizedUrl;

  const parsedForm = parseFormData(rawData, normalizedUrl, resolvedUrl);

  if (parsedForm.pages.length === 0 || (parsedForm.pages.length === 1 && parsedForm.pages[0].questions.length === 0)) {
    const error: FormError = {
      code: 'EMPTY_FORM',
      message: 'The form was loaded but contains no visible questions or sections.',
      url: normalizedUrl,
    };
    throw error;
  }

  return parsedForm;
}
