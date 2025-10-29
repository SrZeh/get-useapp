import React from 'react';
import { View, ActivityIndicator, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Spacing } from '@/constants/spacing';

type LoadingStateProps = {
  message?: string;
  style?: ViewStyle;
};

/**
 * LoadingState component - displays a loading indicator
 * 
 * Features:
 * - Consistent loading state styling
 * - Supports light/dark mode
 * - Customizable message
 */
export function LoadingState({ message = 'Carregando…', style }: LoadingStateProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View style={[{ flex: 1, padding: Spacing.sm, justifyContent: 'center', alignItems: 'center' }, style]}>
      <ActivityIndicator size="large" color={palette.tint} />
      {message && (
        <ThemedText style={{ marginTop: Spacing.sm }} className="text-light-text-secondary dark:text-dark-text-secondary">
          {message}
        </ThemedText>
      )}
    </View>
  );
}

