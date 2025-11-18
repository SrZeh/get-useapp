/**
 * ReturnedActions - Status display for returned items
 */

import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/spacing';
import { Button } from '@/components/Button';

type ReturnedActionsProps = {
  reservationId: string;
  canReviewRenter: boolean;
  onReviewRenter: (reservationId: string) => void;
};

export function ReturnedActions({ reservationId, canReviewRenter, onReviewRenter }: ReturnedActionsProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText>Devolvido ✅ — avaliações liberadas.</ThemedText>
      {canReviewRenter ? (
        <Button
          variant="primary"
          size="sm"
          onPress={() => onReviewRenter(reservationId)}
          style={{ alignSelf: 'flex-start' }}
        >
          Avaliar locatário
        </Button>
      ) : (
        <ThemedText className="text-light-text-tertiary dark:text-dark-text-tertiary">
          Você já avaliou o locatário.
        </ThemedText>
      )}
    </View>
  );
}

