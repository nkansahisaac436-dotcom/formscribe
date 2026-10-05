import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/common/Button';
import { FormOverviewCard } from '../components/preview/FormOverviewCard';
import { PageSectionCard } from '../components/preview/PageSectionCard';
import { QuestionFilterBar } from '../components/preview/QuestionFilterBar';
import { useFormState } from '../context/FormContext';
import { useAppTheme } from '../context/ThemeContext';
import { FormPage } from '../types/form';
import { triggerHaptic } from '../utils/haptics';

export default function PreviewScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { activeForm } = useFormState();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [requiredOnly, setRequiredOnly] = useState<boolean>(false);
  const [expandAllKey, setExpandAllKey] = useState<number>(0);
  const [allExpanded, setAllExpanded] = useState<boolean>(false);

  // If no active form is loaded, provide fallback redirect
  if (!activeForm) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            No Form Selected
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Please paste a Google Forms link on the home screen first.
          </Text>
          <Button
            title="Go to Home"
            onPress={() => router.replace('/')}
            style={{ marginTop: 16 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  // Calculate filtered question count across all pages
  const totalFilteredQuestions = useMemo(() => {
    let count = 0;
    for (const page of activeForm.pages) {
      for (const q of page.questions) {
        if (q.typeCategory === 'page_break' || q.typeCategory === 'section_header') continue;
        if (requiredOnly && !q.required) continue;
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          const inTitle = q.title.toLowerCase().includes(term);
          const inDesc = q.description.toLowerCase().includes(term);
          const inOptions = q.options.some((o) => o.text.toLowerCase().includes(term));
          if (!inTitle && !inDesc && !inOptions) continue;
        }
        count++;
      }
    }
    return count;
  }, [activeForm, searchTerm, requiredOnly]);

  const handleToggleExpandAll = () => {
    triggerHaptic('light');
    setAllExpanded((prev) => !prev);
    setExpandAllKey((k) => k + 1);
  };

  const handleGoToExport = () => {
    triggerHaptic('medium');
    router.push('/export');
  };

  const renderHeader = () => (
    <View>
      <FormOverviewCard form={activeForm} />

      <QuestionFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        requiredOnly={requiredOnly}
        setRequiredOnly={setRequiredOnly}
        totalFilteredQuestions={totalFilteredQuestions}
      />

      <View style={styles.listHeaderRow}>
        <Text style={[styles.sectionsHeading, { color: colors.textPrimary }]}>
          Form Sections ({activeForm.pages.length})
        </Text>

        <TouchableOpacity onPress={handleToggleExpandAll} style={styles.expandToggleBtn}>
          <Text style={[styles.expandToggleText, { color: colors.accent }]}>
            {allExpanded ? 'Collapse All' : 'Expand All'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={activeForm.pages}
        keyExtractor={(item) => `page_${item.pageNumber}_${expandAllKey}`}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <PageSectionCard
            page={item}
            initiallyExpanded={allExpanded || index === 0 || !!searchTerm}
            searchFilter={searchTerm}
            requiredOnly={requiredOnly}
          />
        )}
      />

      {/* Floating Sticky Export CTA Bottom Bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            shadowColor: colors.isDark ? '#000' : '#64748B',
          },
        ]}
      >
        <View style={styles.bottomInfo}>
          <Text style={[styles.bottomFormTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {activeForm.title}
          </Text>
          <Text style={[styles.bottomSubtitle, { color: colors.textMuted }]}>
            {activeForm.totalPages} pages • {activeForm.totalQuestions} questions
          </Text>
        </View>

        <Button
          title="Export Form"
          onPress={handleGoToExport}
          size="md"
          icon={<Text style={styles.exportIcon}>🚀</Text>}
          style={styles.exportBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  listHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  sectionsHeading: {
    fontSize: 16,
    fontWeight: '700',
  },
  expandToggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  expandToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomInfo: {
    flex: 1,
    paddingRight: 12,
  },
  bottomFormTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  bottomSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  exportBtn: {
    paddingHorizontal: 20,
  },
  exportIcon: {
    fontSize: 14,
  },
});
