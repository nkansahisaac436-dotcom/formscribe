import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { FormPage } from '../../types/form';
import { triggerHaptic } from '../../utils/haptics';
import { Badge } from '../common/Badge';
import { QuestionCard } from './QuestionCard';

interface PageSectionCardProps {
  page: FormPage;
  initiallyExpanded?: boolean;
  searchFilter?: string;
  requiredOnly?: boolean;
}

export function PageSectionCard({
  page,
  initiallyExpanded = false,
  searchFilter = '',
  requiredOnly = false,
}: PageSectionCardProps) {
  const { colors } = useAppTheme();
  const [expanded, setExpanded] = useState<boolean>(initiallyExpanded);

  const toggleExpand = () => {
    triggerHaptic('light');
    setExpanded((prev) => !prev);
  };

  // Filter questions according to search / required filters
  const filteredQuestions = page.questions.filter((q) => {
    if (requiredOnly && !q.required) return false;
    if (searchFilter) {
      const term = searchFilter.toLowerCase();
      const inTitle = q.title.toLowerCase().includes(term);
      const inDesc = q.description.toLowerCase().includes(term);
      const inOptions = q.options.some((o) => o.text.toLowerCase().includes(term));
      if (!inTitle && !inDesc && !inOptions) return false;
    }
    return true;
  });

  const questionCount = page.questions.filter(
    (q) => q.typeCategory !== 'section_header' && q.typeCategory !== 'page_break'
  ).length;

  const requiredCount = page.questions.filter((q) => q.required).length;

  // Auto expand if search filter matches
  const shouldShow = filteredQuestions.length > 0 || !searchFilter;
  if (!shouldShow) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleExpand}
        style={[
          styles.header,
          {
            backgroundColor: colors.isDark ? '#1A2333' : '#F8FAFC',
            borderBottomColor: expanded ? colors.border : 'transparent',
            borderBottomWidth: expanded ? 1 : 0,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={[styles.pageNumberBadge, { color: colors.accent }]}>
              Page {page.pageNumber}
            </Text>
            <Text
              numberOfLines={2}
              style={[styles.pageTitle, { color: colors.textPrimary }]}
            >
              {page.title || `Section ${page.pageNumber}`}
            </Text>
          </View>

          {page.description ? (
            <Text
              numberOfLines={2}
              style={[styles.pageDescription, { color: colors.textMuted }]}
            >
              {page.description}
            </Text>
          ) : null}

          <View style={styles.metaRow}>
            <Badge
              label={`${questionCount} ${questionCount === 1 ? 'Question' : 'Questions'}`}
              variant="default"
              size="sm"
            />
            {requiredCount > 0 && (
              <Badge
                label={`${requiredCount} Required`}
                variant="warning"
                size="sm"
                style={styles.metaBadge}
              />
            )}
          </View>
        </View>

        <View style={[styles.arrowContainer, { backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>
            {expanded ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {filteredQuestions.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              No questions matched the filter on this page.
            </Text>
          ) : (
            filteredQuestions.map((q) => <QuestionCard key={String(q.id)} question={q} />)
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },
  pageNumberBadge: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 8,
  },
  pageTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  pageDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaBadge: {
    marginLeft: 6,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    padding: 12,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
