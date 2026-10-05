import React, { createContext, useContext, useState } from 'react';
import { ExportResult } from '../types/export';
import { FormError, ParsedForm } from '../types/form';
import { RecentFormItem } from '../types/history';

interface FormContextType {
  activeForm: ParsedForm | null;
  setActiveForm: (form: ParsedForm | null) => void;
  lastError: FormError | null;
  setLastError: (error: FormError | null) => void;
  lastExportResult: ExportResult | null;
  setLastExportResult: (result: ExportResult | null) => void;
  recentForms: RecentFormItem[];
  setRecentForms: React.Dispatch<React.SetStateAction<RecentFormItem[]>>;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FormContext = createContext<FormContextType>({
  activeForm: null,
  setActiveForm: () => {},
  lastError: null,
  setLastError: () => {},
  lastExportResult: null,
  setLastExportResult: () => {},
  recentForms: [],
  setRecentForms: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [activeForm, setActiveForm] = useState<ParsedForm | null>(null);
  const [lastError, setLastError] = useState<FormError | null>(null);
  const [lastExportResult, setLastExportResult] = useState<ExportResult | null>(null);
  const [recentForms, setRecentForms] = useState<RecentFormItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <FormContext.Provider
      value={{
        activeForm,
        setActiveForm,
        lastError,
        setLastError,
        lastExportResult,
        setLastExportResult,
        recentForms,
        setRecentForms,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </FormContext.Provider>
  );
}

export function useFormState() {
  return useContext(FormContext);
}
