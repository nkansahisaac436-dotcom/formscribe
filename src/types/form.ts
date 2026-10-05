export type QuestionType =
  | 'short_answer'       // 0
  | 'paragraph'          // 1
  | 'multiple_choice'    // 2
  | 'dropdown'           // 3
  | 'checkboxes'         // 4
  | 'linear_scale'       // 5
  | 'section_header'     // 6
  | 'grid'               // 7
  | 'page_break'         // 8
  | 'date'               // 9
  | 'time'               // 10
  | 'image'              // 11
  | 'video'              // 12
  | 'file_upload'        // 13
  | 'other';

export interface QuestionOption {
  text: string;
  isOther?: boolean;
  goToPage?: string | number | null;
  note?: string;
}

export interface LinearScaleInfo {
  min: number;
  max: number;
  minLabel?: string;
  maxLabel?: string;
}

export interface GridInfo {
  rows: string[];
  columns: string[];
  isCheckbox?: boolean;
}

export interface FormQuestion {
  id: string | number;
  title: string;
  description: string;
  typeCode: number;
  typeName: string;
  typeCategory: QuestionType;
  required: boolean;
  options: QuestionOption[];
  scaleInfo?: LinearScaleInfo;
  gridInfo?: GridInfo;
  pageNumber: number;
  orderInPage: number;
  globalIndex: number;
}

export interface FormPage {
  pageNumber: number;
  title: string;
  description: string;
  questions: FormQuestion[];
}

export interface ParsedForm {
  id: string;
  url: string;
  resolvedUrl: string;
  title: string;
  description: string;
  pages: FormPage[];
  totalQuestions: number;
  totalPages: number;
  requiredQuestionsCount: number;
  fetchedAt: string;
  rawStructureSnippet?: string;
}

export type FormErrorCode =
  | 'INVALID_URL'
  | 'NETWORK_ERROR'
  | 'SIGN_IN_REQUIRED'
  | 'FORM_CLOSED'
  | 'FORM_NOT_FOUND'
  | 'PARSE_ERROR'
  | 'EMPTY_FORM';

export interface FormError {
  code: FormErrorCode;
  message: string;
  technicalDetails?: string;
  rawHtmlSnippet?: string;
  url?: string;
}
