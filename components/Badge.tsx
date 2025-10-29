import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error';

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: ViewStyle;
  /** Accessibility label (if not provided, uses children text) */
  accessibilityLabel?: string;
  /** Accessibility role */
  accessibilityRole?: 'text' | 'none';
  /** Accessibility hint */
  accessibilityHint?: string;
};

export function Badge({
  variant = 'primary',
  children,
  style,
  textStyle,
  accessibilityLabel,
  accessibilityRole = 'text',
  accessibilityHint,
}: BadgeProps) {
  const colors = useThemeColors();

  const getBadgeStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: Spacing['3xs'],
      paddingHorizontal: Spacing.xs,
      borderRadius: BorderRadius.sm,
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.brand.primary,
        };
      case 'success':
        return {
          ...baseStyle,
          backgroundColor: colors.semantic.success,
        };
      case 'warning':
        return {
          ...baseStyle,
          backgroundColor: colors.semantic.warning,
        };
      case 'error':
        return {
          ...baseStyle,
          backgroundColor: colors.semantic.error,
        };
      default:
        return baseStyle;
    }
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'primary':
        return colors.text.primary; // Dark text on light green
      case 'success':
      case 'warning':
      case 'error':
        return '#ffffff'; // White text on colored backgrounds
      default:
        return colors.text.primary;
    }
  };

  const badgeLabel = accessibilityLabel || (typeof children === 'string' ? children : undefined);

  return (
    <View
      style={[getBadgeStyles(), style]}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={badgeLabel}
      accessibilityHint={accessibilityHint}
      accessible={!!badgeLabel}
    >
      <ThemedText
        type="caption-1"
        style={[
          {
            color: getTextColor(),
            fontWeight: '600',
            fontSize: 12,
            lineHeight: 16,
          },
          textStyle,
        ]}
      >
        {children}
      </ThemedText>
    </View>
  );
}

