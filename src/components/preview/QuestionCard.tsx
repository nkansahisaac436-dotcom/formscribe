import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { FormQuestion } from '../../types/form';
import { Badge, BadgeVariant } from '../common/Badge';

interface QuestionCardProps {
  question: FormQuestion;
}

export function QuestionCard({ question }: QuestionCardProps) {
  const { colors } = useAppTheme();

  const getBadgeVariant = (typeCat: string): BadgeVariant => {
    switch (typeCat) {
      case 'multiple_choice':
      case 'checkboxes':
      case 'dropdown':
        return 'primary';
      case 'linear_scale':
        return 'purple';
      case 'grid':
        return 'warning';
      case 'file_upload':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (question.typeCategory === 'section_header') {
    return (
      <View
        style={[
          styles.headerContainer,
          {
            backgroundColor: colors.isDark ? '#1E293B' : '#F1F5F9',
            borderColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          📌 {question.title}
        </Text>
        {question.description ? (
          <Text style={[styles.headerDesc, { color: colors.textMuted }]}>
            {question.description}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      {/* Question Header & Badges */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          <Badge
            label={question.typeName}
            variant={getBadgeVariant(question.typeCategory)}
            size="sm"
          />
          {question.required && (
            <Badge label="Required" variant="danger" size="sm" style={styles.reqBadge} />
          )}
        </View>
        <Text style={[styles.indexText, { color: colors.textMuted }]}>
          #{question.globalIndex || question.orderInPage}
        </Text>
      </View>

      {/* Question Title */}
      <Text style={[styles.questionTitle, { color: colors.textPrimary }]}>
        {question.title || 'Untitled Question'}
        {question.required ? <Text style={{ color: colors.danger }}> *</Text> : null}
      </Text>

      {/* Question Description / Help Text */}
      {question.description ? (
        <Text style={[styles.description, { color: colors.textMuted }]}>
          ℹ️ {question.description}
        </Text>
      ) : null}

      {/* Options List */}
      {question.options && question.options.length > 0 && (
        <View style={styles.optionsList}>
          {question.options.map((opt, idx) => {
            const symbol = question.typeCategory === 'checkboxes' ? '☐' : '⚪';
            return (
              <View key={idx} style={styles.optionRow}>
                <Text style={[styles.optionSymbol, { color: colors.accent }]}>
                  {symbol}
                </Text>
                <Text style={[styles.optionText, { color: colors.textSecondary }]}>
                  {opt.text}
                </Text>
                {opt.note && (
                  <Text style={[styles.jumpNote, { color: colors.warning }]}>
                    ↳ {opt.note}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Linear Scale Preview */}
      {question.scaleInfo && (
        <View style={[styles.scaleContainer, { backgroundColor: colors.badgeBg }]}>
          <View style={styles.scaleRow}>
            {Array.from(
              { length: (question.scaleInfo.max || 5) - (question.scaleInfo.min || 1) + 1 },
              (_, i) => (question.scaleInfo?.min || 1) + i
            ).map((num) => (
              <View
                key={num}
                style={[
                  styles.scaleCircle,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.scaleNum, { color: colors.accent }]}>{num}</Text>
              </View>
            ))}
          </View>
          {(question.scaleInfo.minLabel || question.scaleInfo.maxLabel) && (
            <View style={styles.scaleLabels}>
              <Text style={[styles.scaleLabelText, { color: colors.textMuted }]}>
                {question.scaleInfo.min}: {question.scaleInfo.minLabel || 'Min'}
              </Text>
              <Text style={[styles.scaleLabelText, { color: colors.textMuted }]}>
                {question.scaleInfo.max}: {question.scaleInfo.maxLabel || 'Max'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Grid Question Preview */}
      {question.gridInfo && (
        <View style={[styles.gridContainer, { backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.gridTitle, { color: colors.textPrimary }]}>
            Grid ({question.gridInfo.rows.length} rows × {question.gridInfo.columns.length} columns)
          </Text>
          <Text style={[styles.gridDetails, { color: colors.textMuted }]}>
            Rows: {question.gridInfo.rows.slice(0, 3).join(', ')}
            {question.gridInfo.rows.length > 3 ? ` (+${question.gridInfo.rows.length - 3} more)` : ''}
          </Text>
        </View>
      )}

      {/* Text Answer Placeholder */}
      {question.typeCategory === 'short_answer' && (
        <View style={[styles.textLinePlaceholder, { borderBottomColor: colors.border }]}>
          <Text style={[styles.placeholderHint, { color: colors.textMuted }]}>
            [Short answer text response]
          </Text>
        </View>
      )}

      {question.typeCategory === 'paragraph' && (
        <View style={[styles.paragraphPlaceholder, { borderColor: colors.border, backgroundColor: colors.badgeBg }]}>
          <Text style={[styles.placeholderHint, { color: colors.textMuted }]}>
            [Paragraph long answer response]
          </Text>
        </View>
      )}

      {question.typeCategory === 'date' && (
        <Text style={[styles.metaHint, { color: colors.textMuted }]}>
          📅 Date picker format (DD/MM/YYYY)
        </Text>
      )}

      {question.typeCategory === 'time' && (
        <Text style={[styles.metaHint, { color: colors.textMuted }]}>
          ⏰ Time picker format (HH:MM AM/PM)
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  headerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reqBadge: {
    marginLeft: 6,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '700',
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  optionsList: {
    marginTop: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 3,
  },
  optionSymbol: {
    fontSize: 13,
    marginRight: 8,
    marginTop: 1,
  },
  optionText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  jumpNote: {
    fontSize: 11,
    marginLeft: 6,
    fontStyle: 'italic',
  },
  scaleContainer: {
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 6,
  },
  scaleCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleNum: {
    fontWeight: '700',
    fontSize: 13,
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  scaleLabelText: {
    fontSize: 11,
  },
  gridContainer: {
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  gridDetails: {
    fontSize: 11,
  },
  textLinePlaceholder: {
    borderBottomWidth: 1,
    paddingVertical: 6,
    marginTop: 6,
  },
  paragraphPlaceholder: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  placeholderHint: {
    fontSize: 11,
    fontStyle: 'italic',
  },
  metaHint: {
    fontSize: 12,
    marginTop: 6,
  },
});
