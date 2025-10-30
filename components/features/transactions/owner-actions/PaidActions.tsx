/**
 * PaidActions - Status display for paid reservations (waiting for renter pickup)
 */

import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { getDepositMessage } from '@/utils';
import { Spacing } from '@/constants/spacing';

interface PaidActionsProps {
  paymentMethodType?: string;
}

export function PaidActions({ paymentMethodType }: PaidActionsProps) {
  return (
    <View style={{ gap: Spacing['2xs'] }}>
      <ThemedText>Pago 💙 — aguardando o locatário marcar &quot;Recebido!&quot;.</ThemedText>
      <ThemedText type="caption-1" style={{ opacity: 0.7 }}>
        {getDepositMessage(paymentMethodType)}
      </ThemedText>
    </View>
  );
}

