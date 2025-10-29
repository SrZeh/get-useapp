/**
 * Loading Spinner Component
 * 
 * Standardized loading spinner with design system colors and sizing.
 * Supports different sizes and accessibility features.
 */

import React from 'react';
import { ActivityIndicator, View, ViewStyle, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { useThemeColors } from '@/utils';

type LoadingSpinnerSize = 'small' | 'medium' | 'large';

type LoadingSpinnerProps = {
  /** Spinner size */
  size?: LoadingSpinnerSize;
  
  /** Show loading text */
  label?: string;
  
  /** Custom style */
  style?: ViewStyle;
  
  /** Container style */
  containerStyle?: ViewStyle;
  
  /** Custom color */
  color?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
};

const sizeMap: Record<LoadingSpinnerSize, number> = {
  small: 20,
  medium: 28,
  large: 40,
};

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({
  size = 'medium',
  label,
  style,
  containerStyle,
  color,
  accessibilityLabel = label || 'Carregando',
}: LoadingSpinnerProps) {
  const colors = useThemeColors();
  const spinnerColor = color || colors.brand.primary;
  const spinnerSize = sizeMap[size];

  return (
    <View
      style={[
        styles.container,
        containerStyle,
      ]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityLiveRegion="polite"
    >
      <ActivityIndicator
        size={spinnerSize}
        color={spinnerColor}
        style={style}
      />
      {label && (
        <ThemedText
          type="body-small"
          style={[
            styles.label,
            { color: colors.text.secondary },
          ]}
        >
          {label}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    marginTop: 8,
  },
});

/**
 * Loading Spinner with default export
 */
export default LoadingSpinner;

