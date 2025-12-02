/**
 * Help Request Detail Screen
 * 
 * Requests are now items, so redirect to item detail
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useThemeColors } from '@/utils';

export default function HelpRequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();

  // Requests are now items, redirect to item detail
  useEffect(() => {
    if (id) {
      router.replace(`/item/${id}`);
    } else {
      router.replace('/help');
    }
  }, [id]);

  // Show loading while redirecting
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={colors.brand.primary} />
    </ThemedView>
  );
}
