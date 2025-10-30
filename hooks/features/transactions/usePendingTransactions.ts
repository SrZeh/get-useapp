/**
 * usePendingTransactions - Legacy hook for backward compatibility
 * 
 * Now uses Zustand store for optimized query management:
 * - Shares real-time listener across components
 * - Optimizes Firestore reads
 * 
 * Returns true if there are any reservations requiring user action.
 */

import { useEffect } from "react";
import { useTransactionsStore } from "@/stores/transactionsStore";

/** 
 * Returns true if there is any transaction requiring action from the user
 * (e.g., accept, pay, mark received)
 */
export function usePendingTransactions() {
  // Get data from Zustand store
  const hasPendingTransactions = useTransactionsStore((state) => state.hasPendingTransactions);
  const loading = useTransactionsStore((state) => state.pendingTransactionsLoading);
  const subscribeToPendingTransactions = useTransactionsStore((state) => state.subscribeToPendingTransactions);
  const unsubscribeFromPendingTransactions = useTransactionsStore((state) => state.unsubscribeFromPendingTransactions);

  // Subscribe to pending transactions on mount
  useEffect(() => {
    subscribeToPendingTransactions();
    
    return () => {
      // Note: We don't unsubscribe here because other components might be using the listener
      // The store manages the listener lifecycle
    };
  }, [subscribeToPendingTransactions]);

  // Return false if still loading, true if has pending transactions
  return loading ? false : hasPendingTransactions;
}
