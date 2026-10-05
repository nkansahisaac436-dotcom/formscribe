import AsyncStorage from '@react-native-async-storage/async-storage';
import { ParsedForm } from '../types/form';
import { RecentFormItem } from '../types/history';

const HISTORY_KEY = '@formscribe_recent_forms_v1';
const MAX_HISTORY_ITEMS = 25;

/**
 * Loads all recent forms from local AsyncStorage.
 */
export async function loadRecentForms(): Promise<RecentFormItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const items: RecentFormItem[] = JSON.parse(raw);
    return Array.isArray(items) ? items : [];
  } catch (err) {
    console.warn('Failed to load recent forms from AsyncStorage:', err);
    return [];
  }
}

/**
 * Saves a parsed form to local history (updating existing if matching URL).
 */
export async function saveFormToHistory(form: ParsedForm): Promise<RecentFormItem[]> {
  try {
    const current = await loadRecentForms();
    // Remove if already exists to move it to the top
    const filtered = current.filter(
      (item) => item.url.toLowerCase() !== form.url.toLowerCase() && item.id !== form.id
    );

    const newItem: RecentFormItem = {
      id: form.id,
      url: form.url,
      title: form.title,
      description: form.description,
      totalPages: form.totalPages,
      totalQuestions: form.totalQuestions,
      savedAt: new Date().toISOString(),
      parsedForm: form,
    };

    const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to save form to AsyncStorage:', err);
    return [];
  }
}

/**
 * Removes a single form from history by ID.
 */
export async function deleteFormFromHistory(id: string): Promise<RecentFormItem[]> {
  try {
    const current = await loadRecentForms();
    const updated = current.filter((item) => item.id !== id);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Failed to delete form from AsyncStorage:', err);
    return [];
  }
}

/**
 * Clears all history items from local storage.
 */
export async function clearAllHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch (err) {
    console.warn('Failed to clear AsyncStorage history:', err);
  }
}
