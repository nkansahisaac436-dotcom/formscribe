export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  primaryLight: string;
  accent: string;
  accentMuted: string;
  background: string;
  card: string;
  cardElevated: string;
  border: string;
  borderSubtle: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  badgeBg: string;
  inputBg: string;
  placeholder: string;
  isDark: boolean;
}

export const lightColors: ThemeColors = {
  primary: '#1E3A8A',
  primaryDark: '#0F172A',
  primaryLight: '#3B82F6',
  accent: '#2563EB',
  accentMuted: '#EFF6FF',
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderSubtle: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',
  success: '#10B981',
  successLight: '#ECFDF5',
  warning: '#F59E0B',
  warningLight: '#FFFBEB',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  badgeBg: '#F1F5F9',
  inputBg: '#F8FAFC',
  placeholder: '#94A3B8',
  isDark: false,
};

export const darkColors: ThemeColors = {
  primary: '#3B82F6',
  primaryDark: '#1E3A8A',
  primaryLight: '#60A5FA',
  accent: '#60A5FA',
  accentMuted: '#1E293B',
  background: '#0B0F19',
  card: '#161F30',
  cardElevated: '#1E293B',
  border: '#2A374A',
  borderSubtle: '#1E293B',
  textPrimary: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textMuted: '#94A3B8',
  textInverse: '#0F172A',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  danger: '#F87171',
  dangerLight: '#7F1D1D',
  badgeBg: '#1E293B',
  inputBg: '#111827',
  placeholder: '#64748B',
  isDark: true,
};
