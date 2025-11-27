/**
 * ReservationActions - Action buttons wrapper for reservations
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '@/components/Button';
import { HapticFeedback } from '@/utils';
import { Spacing } from '@/constants/spacing';
import type { UseThemeColorsReturn } from '@/utils/theme';

type ReservationActionsProps = {
  reservationId: string;
  onNavigateToChat: (id: string) => void;
  actions?: React.ReactNode;
  colors: UseThemeColorsReturn;
};

export const ReservationActions = React.memo(function ReservationActions({
  reservationId,
  onNavigateToChat,
  actions,
  colors,
}: ReservationActionsProps) {
  if (!actions) return null;

  return (
    <View style={styles.container}>
      <Button
        variant="ghost"
        onPress={() => {
          HapticFeedback.light();
          onNavigateToChat(reservationId);
        }}
        style={styles.actionButton}
        textStyle={{ color: colors.semantic.info } as any}
      >
        💬 Mensagens
      </Button>
      {actions}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.xs,
    gap: Spacing.xs,
    alignItems: 'center',
  },
  actionButton: {
    alignSelf: 'center',
  },
});

