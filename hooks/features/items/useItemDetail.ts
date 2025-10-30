/**
 * useItemDetail - Hook for fetching and loading item detail data
 */

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { db } from '@/lib/firebase';
import { logger } from '@/utils';
import type { Item } from '@/types';

export function useItemDetail(itemId: string) {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const snap = await getDoc(doc(db, "items", itemId));
        
        if (!mounted) return;
        
        if (!snap.exists()) {
          Alert.alert("Item", "Item não encontrado.");
          router.back();
          return;
        }
        
        setItem({ id: snap.id, ...(snap.data() as Partial<Item>) } as Item);
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
  }, [itemId]);

  return { item, loading };
}

