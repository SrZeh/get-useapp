/**
 * useItemDetail - Hook for fetching and loading item detail data
 * 
 * Now uses Zustand store for optimized query management:
 * - Checks cache first before querying Firestore
 * - Caches fetched items to avoid duplicate queries
 * - Optimizes Firestore reads
 */

import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useItemsStore } from '@/stores/itemsStore';
import { logger } from '@/utils';
import type { Item } from '@/types';

export function useItemDetail(itemId: string) {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Item | null>(null);
  
  const getItem = useItemsStore((state) => state.getItem);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        // Get item from store (checks cache first)
        const fetchedItem = await getItem(itemId);
        
        if (!mounted) return;
        
        if (!fetchedItem) {
          Alert.alert("Item", "Item não encontrado.");
          router.back();
          return;
        }
        
        setItem(fetchedItem);
      } catch (e: unknown) {
        if (!mounted) return;
        const error = e as { message?: string };
        logger.error("Error loading item detail", error);
        Alert.alert("Erro", error?.message ?? String(e));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [itemId, getItem]);

  return { item, loading };
}

