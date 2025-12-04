/**
 * Transactions Screen - Thin route wrapper
 * 
 * Follows thin route pattern: handles routing concerns (focus effect) and delegates
 * UI to feature component. Business logic extracted to TransactionsTabs component.
 */
import { ThemedView } from '@/components/themed-view';
import { useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { TransactionsTabs } from '@/components/features/transactions';
import { useNotificationBadges } from '@/hooks/features/notifications';

export default function TransactionsScreen() {
  const badges = useNotificationBadges();
  const isMarkingRef = React.useRef(false);
  const lastMarkAttemptRef = React.useRef<number>(0);
  
  useFocusEffect(
    useCallback(() => {
      // Prevent rapid-fire calls - only mark if not already marking and at least 2 seconds since last attempt
      const now = Date.now();
      if (isMarkingRef.current || (now - lastMarkAttemptRef.current < 2000)) {
        return;
      }

      isMarkingRef.current = true;
      lastMarkAttemptRef.current = now;

      // Mark transactions as seen whenever screen comes into focus
      console.log('[TransactionsScreen] Screen focused, marking as seen');
      
      // Usa o novo sistema otimista (apenas se houver badge)
      const markPromise = badges.transactions
        ? badges.markAsSeen("transactions").catch((err) => {
            // Silently fail for CORS errors - don't spam console
            if (err?.code !== 'functions/internal' && err?.message !== 'internal') {
              console.error('[TransactionsScreen] Error marking transactions as seen', err);
            }
          })
        : Promise.resolve();

      // Não chama o método legado - apenas um sistema
      markPromise.finally(() => {
        isMarkingRef.current = false;
      });
      
      return () => {};
    }, [badges])
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <TransactionsTabs defaultTab="owner" />
    </ThemedView>
  );
}

