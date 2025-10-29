import React from 'react';
import { View, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';

type EmptyStateProps = {
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
  intensity?: 'subtle' | 'standard' | 'strong';
};

/**
 * EmptyState component - displays an empty state message
 * 
 * Features:
 * - Consistent empty state styling
 * - Optional action button
 * - Supports light/dark mode
 * - Liquid glass effect
 */
export function EmptyState({
  message,
  icon,
  actionLabel,
  onAction,
  style,
  intensity = 'subtle',
}: EmptyStateProps) {
  return (
    <LiquidGlassView intensity={intensity} cornerRadius={16} style={[{ padding: 24, alignItems: 'center' }, style]}>
      {icon && (
        <ThemedText type="large-title" style={{ marginBottom: 12 }}>
          {icon}
        </ThemedText>
      )}
      <ThemedText 
        type="callout" 
        style={{ textAlign: 'center', marginBottom: actionLabel ? 16 : 0 }}
        className="text-light-text-tertiary dark:text-dark-text-tertiary"
      >
        {message}
      </ThemedText>
      {actionLabel && onAction && (
        <Button variant="primary" onPress={onAction} style={{ marginTop: 8 }}>
          {actionLabel}
        </Button>
      )}
    </LiquidGlassView>
  );
}

