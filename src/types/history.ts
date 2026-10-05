import { ParsedForm } from './form';

export interface RecentFormItem {
  id: string;
  url: string;
  title: string;
  description: string;
  totalPages: number;
  totalQuestions: number;
  savedAt: string;
  parsedForm?: ParsedForm;
}
