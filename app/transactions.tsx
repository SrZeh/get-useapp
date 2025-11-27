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
      console.log('[TransactionsScreen] Screen focused, calling markTransactionsSeen');
      markTransactionsSeen().catch((err) => {
        console.error('[TransactionsScreen] Error marking transactions as seen', err);
      });
      return () => {};
    }, [])
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <TransactionsTabs />
    </ThemedView>
  );
}

