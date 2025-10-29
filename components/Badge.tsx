import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useThemeColors } from '@/utils';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error';

type BadgeProps = {
  variant?: BadgeVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  textStyle?: ViewStyle;
};

export function Badge({
  variant = 'primary',
  children,
  style,
  textStyle,
}: BadgeProps) {
  const colors = useThemeColors();

  const getBadgeStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: 4,
      paddingHorizontal: 12,
      borderRadius: 12,
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

  return (
    <View style={[getBadgeStyles(), style]}>
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

