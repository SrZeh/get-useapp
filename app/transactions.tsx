/**
 * Transactions Screen - Thin route wrapper
 * 
 * Follows thin route pattern: handles routing concerns (focus effect) and delegates
 * UI to feature component. Business logic extracted to TransactionsTabs component.
 */
import { ThemedView } from '@/components/themed-view';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { markTransactionsSeen } from '@/hooks/features/transactions';
import { TransactionsTabs } from '@/components/features/transactions';

export default function TransactionsScreen() {
  useFocusEffect(
    useCallback(() => {
      // Mark transactions as seen whenever screen comes into focus
      markTransactionsSeen();
      return () => {};
    }, [])
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <TransactionsTabs />
    </ThemedView>
  );
}

