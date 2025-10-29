/**
 * ReturnedActions - Status display for returned items
 */

import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';

export function ReturnedActions() {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText>Devolvido ✅ — avaliações liberadas.</ThemedText>
    </View>
  );
}

