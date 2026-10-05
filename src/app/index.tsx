import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyHistory } from '../components/home/EmptyHistory';
import { RecentFormItem } from '../components/home/RecentFormItem';
import { UrlInputCard } from '../components/home/UrlInputCard';
import { useFormState } from '../context/FormContext';
import { useAppTheme } from '../context/ThemeContext';
import { fetchAndParseForm } from '../services/formParser';
import {
  clearAllHistory,
  deleteFormFromHistory,
  loadRecentForms,
  saveFormToHistory,
} from '../services/historyStorage';
import { FormError, ParsedForm } from '../types/form';
import { RecentFormItem as RecentItemType } from '../types/history';
import { triggerHaptic } from '../utils/haptics';

const SAMPLE_35_PAGE_URL = 'https://forms.gle/cyEzZ6PBuYSPd1cz8';

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const {
    setActiveForm,
    lastError,
    setLastError,
    recentForms,
    setRecentForms,
    isLoading,
    setIsLoading,
  } = useFormState();

  const [url, setUrl] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    fetchRecentHistory();
  }, []);

  const fetchRecentHistory = async () => {
    const list = await loadRecentForms();
    setRecentForms(list);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecentHistory();
    setRefreshing(false);
  };

  const handleReadForm = async (targetUrl?: string) => {
    const formUrl = (targetUrl || url).trim();
    if (!formUrl) {
      Alert.alert('Please enter a link', 'Paste a valid Google Forms URL to proceed.');
      return;
    }

    setLastError(null);
    setIsLoading(true);
    triggerHaptic('medium');

    try {
      const parsed = await fetchAndParseForm(formUrl);
      setActiveForm(parsed);

      // Save to recent forms history
      const updated = await saveFormToHistory(parsed);
      setRecentForms(updated);

      triggerHaptic('success');
      router.push('/preview');
    } catch (err) {
      triggerHaptic('error');
      const formErr = err as FormError;
      if (formErr.code && formErr.message) {
        setLastError(formErr);
      } else {
        setLastError({
          code: 'PARSE_ERROR',
          message: err instanceof Error ? err.message : 'An unexpected error occurred while reading the form.',
          technicalDetails: String(err),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecent = async (item: RecentItemType) => {
    triggerHaptic('light');
    if (item.parsedForm) {
      setActiveForm(item.parsedForm);
      router.push('/preview');
    } else {
      setUrl(item.url);
      await handleReadForm(item.url);
    }
  };

  const handleDeleteRecent = async (id: string) => {
    const updated = await deleteFormFromHistory(id);
    setRecentForms(updated);
  };

  const handleClearAllHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to remove all recent forms from your device?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('medium');
            await clearAllHistory();
            setRecentForms([]);
          },
        },
      ]
    );
  };

  const handleCopyDebugInfo = async () => {
    if (!lastError) return;
    const debugText = JSON.stringify(lastError, null, 2);
    await Clipboard.setStringAsync(debugText);
    triggerHaptic('success');
    Alert.alert('Copied!', 'Debug info has been copied to your clipboard.');
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.accent}
              colors={[colors.accent]}
            />
          }
        >
          {/* Top App Bar */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={[styles.logoBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.logoIcon}>📝</Text>
              </View>
              <View>
                <Text style={[styles.appTitle, { color: colors.textPrimary }]}>
                  FormScribe
                </Text>
                <Text style={[styles.appTagline, { color: colors.textMuted }]}>
                  Extract Multi-Page Google Forms
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                router.push('/settings');
              }}
              style={[styles.settingsBtn, { backgroundColor: colors.badgeBg, borderColor: colors.border }]}
              accessibilityLabel="Settings"
            >
              <Text style={[styles.settingsIcon, { color: colors.textPrimary }]}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner if any */}
          {lastError && (
            <Card
              style={[
                styles.errorCard,
                {
                  backgroundColor: colors.isDark ? '#451010' : '#FEF2F2',
                  borderColor: colors.isDark ? '#7F1D1D' : '#FCA5A5',
                },
              ]}
            >
              <View style={styles.errorHeader}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={[styles.errorTitle, { color: colors.danger }]}>
                  {lastError.code === 'INVALID_URL'
                    ? 'Invalid Google Form URL'
                    : lastError.code === 'SIGN_IN_REQUIRED'
                    ? 'Google Sign-In Required'
                    : lastError.code === 'FORM_CLOSED'
                    ? 'Form is Closed'
                    : lastError.code === 'NETWORK_ERROR'
                    ? 'Network Connection Issue'
                    : lastError.code === 'FORM_NOT_FOUND'
                    ? 'Form Not Found (404)'
                    : 'Parsing Failed'}
                </Text>
              </View>

              <Text style={[styles.errorMessage, { color: colors.isDark ? '#FCA5A5' : '#991B1B' }]}>
                {lastError.message}
              </Text>

              <View style={styles.errorActions}>
                {lastError.code === 'PARSE_ERROR' && (
                  <Button
                    title="📋 Copy Debug Info"
                    onPress={handleCopyDebugInfo}
                    variant="outline"
                    size="sm"
                    style={{ borderColor: colors.danger }}
                    textStyle={{ color: colors.danger }}
                  />
                )}
                <Button
                  title="Dismiss"
                  onPress={() => setLastError(null)}
                  variant="ghost"
                  size="sm"
                  textStyle={{ color: colors.textMuted }}
                />
              </View>
            </Card>
          )}

          {/* URL Input Form */}
          <UrlInputCard
            url={url}
            setUrl={setUrl}
            onSubmit={() => handleReadForm()}
            loading={isLoading}
            onClear={() => setUrl('')}
            onLoadSample={() => {
              setUrl(SAMPLE_35_PAGE_URL);
              handleReadForm(SAMPLE_35_PAGE_URL);
            }}
          />

          {/* Loading Skeletons when fetching */}
          {isLoading && (
            <View style={styles.skeletonContainer}>
              <Text style={[styles.loadingText, { color: colors.accent }]}>
                ⏳ Contacting Google Forms & scanning all pages...
              </Text>
              <Skeleton height={90} borderRadius={14} style={{ marginBottom: 12 }} />
              <Skeleton height={70} borderRadius={14} style={{ marginBottom: 12 }} />
              <Skeleton height={70} borderRadius={14} />
            </View>
          )}

          {/* Recent Forms List */}
          {!isLoading && (
            <View style={styles.historySection}>
              <View style={styles.historyHeaderRow}>
                <Text style={[styles.historyTitle, { color: colors.textPrimary }]}>
                  Recent Forms
                </Text>
                {recentForms.length > 0 && (
                  <TouchableOpacity onPress={handleClearAllHistory}>
                    <Text style={[styles.clearAllText, { color: colors.accent }]}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {recentForms.length === 0 ? (
                <EmptyHistory />
              ) : (
                recentForms.map((item) => (
                  <RecentFormItem
                    key={item.id}
                    item={item}
                    onSelect={handleSelectRecent}
                    onDelete={handleDeleteRecent}
                  />
                ))
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    marginBottom: 8,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoIcon: {
    fontSize: 22,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 18,
  },
  errorCard: {
    padding: 14,
    marginBottom: 16,
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  errorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  skeletonContainer: {
    marginVertical: 10,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  historySection: {
    marginTop: 8,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
