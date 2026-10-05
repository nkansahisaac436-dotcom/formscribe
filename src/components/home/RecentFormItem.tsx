import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { RecentFormItem as RecentItemType } from '../../types/history';
import { triggerHaptic } from '../../utils/haptics';
import { Badge } from '../common/Badge';

interface RecentFormItemProps {
  item: RecentItemType;
  onSelect: (item: RecentItemType) => void;
  onDelete: (id: string) => void;
}

export function RecentFormItem({ item, onSelect, onDelete }: RecentFormItemProps) {
  const { colors } = useAppTheme();

  const handlePress = () => {
    triggerHaptic('light');
    onSelect(item);
  };

  const handleDelete = () => {
    triggerHaptic('medium');
    onDelete(item.id);
  };

  const formattedDate = new Date(item.savedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text
            numberOfLines={2}
            style={[styles.title, { color: colors.textPrimary }]}
          >
            {item.title || 'Untitled Google Form'}
          </Text>
          <TouchableOpacity
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.deleteBtn}
          >
            <Text style={[styles.deleteIcon, { color: colors.textMuted }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text
          numberOfLines={1}
          style={[styles.urlText, { color: colors.textMuted }]}
        >
          {item.url}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.badgesRow}>
            <Badge
              label={`${item.totalPages} ${item.totalPages === 1 ? 'Page' : 'Pages'}`}
              variant="primary"
              size="sm"
              style={styles.badge}
            />
            <Badge
              label={`${item.totalQuestions} Questions`}
              variant="default"
              size="sm"
              style={styles.badge}
            />
          </View>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {formattedDate}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  content: {
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    paddingRight: 8,
    lineHeight: 20,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  urlText: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
