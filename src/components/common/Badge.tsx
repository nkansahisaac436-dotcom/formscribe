import React from 'react';
import { StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export function Badge({
  label,
  variant = 'default',
  icon,
  style,
  textStyle,
  size = 'md',
}: BadgeProps) {
  const { colors } = useAppTheme();

  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.isDark ? '#1E3A8A44' : '#EFF6FF',
          text: colors.accent,
          border: colors.isDark ? '#3B82F644' : '#BFDBFE',
        };
      case 'success':
        return {
          bg: colors.isDark ? '#064E3B44' : '#ECFDF5',
          text: colors.success,
          border: colors.isDark ? '#05966944' : '#A7F3D0',
        };
      case 'warning':
        return {
          bg: colors.isDark ? '#78350F44' : '#FFFBEB',
          text: colors.warning,
          border: colors.isDark ? '#D9770644' : '#FDE68A',
        };
      case 'danger':
        return {
          bg: colors.isDark ? '#7F1D1D44' : '#FEF2F2',
          text: colors.danger,
          border: colors.isDark ? '#DC262644' : '#FECACA',
        };
      case 'purple':
        return {
          bg: colors.isDark ? '#4C1D9544' : '#F5F3FF',
          text: '#8B5CF6',
          border: colors.isDark ? '#7C3AED44' : '#DDD6FE',
        };
      case 'default':
      default:
        return {
          bg: colors.badgeBg,
          text: colors.textSecondary,
          border: colors.border,
        };
    }
  };

  const badgeTheme = getColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: badgeTheme.bg,
          borderColor: badgeTheme.border,
          paddingHorizontal: isSmall ? 6 : 9,
          paddingVertical: isSmall ? 2 : 4,
          borderRadius: isSmall ? 6 : 8,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.label,
          {
            color: badgeTheme.text,
            fontSize: isSmall ? 11 : 12,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontWeight: '600',
  },
});
