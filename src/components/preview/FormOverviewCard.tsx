import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { ParsedForm } from '../../types/form';
import { Card } from '../common/Card';

interface FormOverviewCardProps {
  form: ParsedForm;
}

export function FormOverviewCard({ form }: FormOverviewCardProps) {
  const { colors } = useAppTheme();

  return (
    <Card elevated style={styles.card}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {form.title}
      </Text>

      {form.description ? (
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {form.description}
        </Text>
      ) : null}

      <View style={[styles.statsRow, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accent }]}>
            {form.totalPages}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            {form.totalPages === 1 ? 'Page' : 'Pages'}
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>
            {form.totalQuestions}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Questions
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.danger }]}>
            {form.requiredQuestionsCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>
            Required
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 14,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
});
