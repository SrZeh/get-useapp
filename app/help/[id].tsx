/**
 * Help Request Detail Screen
 * 
 * Redirects to main help screen (which shows "coming soon")
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';
import { useThemeColors } from '@/utils';

export default function HelpRequestDetailScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  // Redirect to main help screen (which shows "coming soon")
  useEffect(() => {
    router.replace('/help');
  }, []);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 80, justifyContent: 'center', alignItems: 'center' }]}>
      <ActivityIndicator size="large" color={colors.brand.primary} />
      <ThemedText type="body" style={{ marginTop: Spacing.md, color: colors.text.secondary }}>
        Redirecionando...
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
