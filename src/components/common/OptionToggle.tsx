import React from 'react';
import { StyleSheet, Switch, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { triggerHaptic } from '../../utils/haptics';

interface OptionToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
}

export function OptionToggle({
  label,
  description,
  value,
  onValueChange,
  icon,
  disabled = false,
  style,
  labelStyle,
}: OptionToggleProps) {
  const { colors } = useAppTheme();

  const handleToggle = (newVal: boolean) => {
    triggerHaptic('light');
    onValueChange(newVal);
  };

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: colors.borderSubtle,
        },
        style,
      ]}
    >
      <View style={styles.leftRow}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text style={[styles.label, { color: colors.textPrimary }, labelStyle]}>
            {label}
          </Text>
          {description && (
            <Text style={[styles.description, { color: colors.textMuted }]}>
              {description}
            </Text>
          )}
        </View>
      </View>

      <Switch
        value={value}
        onValueChange={handleToggle}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={colors.isDark ? (value ? '#FFFFFF' : '#94A3B8') : '#FFFFFF'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 16,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  description: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
});
