/**
 * Custom hook for managing user items
 * 
 * Now uses Zustand store for optimized query management:
 * - Shares real-time listener across components
 * - Caches items to avoid duplicate queries
 * - Optimizes Firestore reads
 * 
 * Follows Single Responsibility Principle by focusing solely on data fetching
 */

import { useEffect, useState } from 'react';
import { useItemsStore } from '@/stores/itemsStore';
import { logger } from '@/utils';
import type { Item } from '@/types';

type UseUserItemsResult = {
  items: Item[];
  loading: boolean;
  refreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
};

/**
 * Hook to manage user items with real-time updates
 * Now uses Zustand store to share listeners and cache data
 */
export function useUserItems(): UseUserItemsResult {
  const [refreshing, setRefreshing] = useState(false);
  
  // Get data from Zustand store
  const items = useItemsStore((state) => state.userItems);
  const loading = useItemsStore((state) => state.userItemsLoading);
  const error = useItemsStore((state) => state.userItemsError);
  const subscribeToUserItems = useItemsStore((state) => state.subscribeToUserItems);
  const unsubscribeFromUserItems = useItemsStore((state) => state.unsubscribeFromUserItems);
  const invalidateUserItems = useItemsStore((state) => state.invalidateUserItems);

  // Subscribe to user items on mount
  useEffect(() => {
    subscribeToUserItems();
    
    return () => {
      // Note: We don't unsubscribe here because other components might be using the listener
      // The store manages the listener lifecycle
    };
  }, [subscribeToUserItems]);

  const refresh = async () => {
    try {
      setRefreshing(true);
      // Invalidate cache and trigger refetch
      invalidateUserItems();
    } catch (err) {
      logger.error('Error refreshing items', err);
    } finally {
      setRefreshing(false);
    }
  };

  return {
    items,
    loading,
    refreshing,
    error,
    refresh,
  };
}

