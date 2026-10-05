import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { triggerHaptic } from '../../utils/haptics';
import { Input } from '../common/Input';

interface QuestionFilterBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  requiredOnly: boolean;
  setRequiredOnly: (val: boolean) => void;
  totalFilteredQuestions: number;
}

export function QuestionFilterBar({
  searchTerm,
  setSearchTerm,
  requiredOnly,
  setRequiredOnly,
  totalFilteredQuestions,
}: QuestionFilterBarProps) {
  const { colors } = useAppTheme();

  const toggleRequired = () => {
    triggerHaptic('light');
    setRequiredOnly(!requiredOnly);
  };

  return (
    <View style={styles.container}>
      <Input
        placeholder="🔍 Search questions, options, descriptions..."
        value={searchTerm}
        onChangeText={setSearchTerm}
        onClear={() => setSearchTerm('')}
        containerStyle={styles.inputContainer}
      />

      <View style={styles.filtersRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={toggleRequired}
          style={[
            styles.filterChip,
            {
              backgroundColor: requiredOnly
                ? colors.danger
                : colors.badgeBg,
              borderColor: requiredOnly ? colors.danger : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.filterChipText,
              { color: requiredOnly ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {requiredOnly ? '✓ Required Questions Only' : 'Filter: Required Only'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.resultCount, { color: colors.textMuted }]}>
          {totalFilteredQuestions} matching
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 8,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 12,
    fontWeight: '500',
  },
});
