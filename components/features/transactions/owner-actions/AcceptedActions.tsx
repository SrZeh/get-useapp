/**
 * AcceptedActions - Actions for accepted reservations (Stripe sync)
 */

import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/Button';
import { ThemedText } from '@/components/themed-text';
import { getDepositMessage } from '@/utils';
import { Spacing } from '@/constants/spacing';

interface AcceptedActionsProps {
  paymentMethodType?: string;
  onSyncStripe: () => void;
  isSyncing: boolean;
}

export function AcceptedActions({
  paymentMethodType,
  onSyncStripe,
  isSyncing,
}: AcceptedActionsProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <Button
        variant="secondary"
        size="sm"
        onPress={onSyncStripe}
        disabled={isSyncing}
        loading={isSyncing}
      >
        Sincronizar conta Stripe
      </Button>
      <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
        {getDepositMessage(paymentMethodType)}
      </ThemedText>
    </View>
  );
}

