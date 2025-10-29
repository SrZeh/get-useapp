/**
 * Custom hook for managing user items
 * 
 * Handles:
 * - Auth state monitoring
 * - Real-time Firestore subscription for user items
 * - Legacy item fallback support
 * - Loading and error states
 * - Refresh functionality
 * 
 * Follows Single Responsibility Principle by focusing solely on data fetching
 */

import { useEffect, useRef, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type QuerySnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
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
 * Transform Firestore document snapshot to Item
 */
function transformDocument(doc: DocumentSnapshot): Item {
  const data = doc.data() as Partial<Item>;
  return {
    id: doc.id,
    title: data.title ?? '(sem título)',
    description: data.description ?? '',
    photos: data.photos ?? [],
    available: data.available ?? true,
    createdAt: data.createdAt ?? serverTimestamp(),
    ratingCount: data.ratingCount ?? 0,
    ratingSum: data.ratingSum ?? 0,
    ownerRatingCount: data.ownerRatingCount ?? 0,
    ownerRatingSum: data.ownerRatingSum ?? 0,
    ...data,
  } as Item;
}

/**
 * Transform query snapshot to Item array
 */
function transformSnapshot(snap: QuerySnapshot): Item[] {
  return snap.docs.map(transformDocument);
}

/**
 * Fetch legacy items with 'owner' field instead of 'ownerUid'
 */
async function fetchLegacyItems(uid: string): Promise<Item[]> {
  try {
    const qLegacy = query(
      collection(db, FIRESTORE_COLLECTIONS.ITEMS),
      where('owner', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snapLegacy = await getDocs(qLegacy);
    return transformSnapshot(snapLegacy);
  } catch (error: unknown) {
    const err = error as { message?: string };
    if (String(err?.message).includes('requires an index')) {
      logger.warn('Firestore index required', {
        message: 'Crie o índice sugerido pelo Firestore para owner/createdAt.',
      });
    } else {
      logger.warn('Legacy fallback error', { error: err?.message ?? error });
    }
    return [];
  }
}

/**
 * Hook to manage user items with real-time updates
 */
export function useUserItems(): UseUserItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const stopAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listener if exists
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }

      if (!user) {
        setItems([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      logger.debug('Loading items for user', { uid: user.uid });

      // Subscribe to user items (ownerUid == uid)
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.ITEMS),
        where('ownerUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsub = onSnapshot(
        q,
        async (snap) => {
          let data = transformSnapshot(snap);

          // Fallback to legacy items with 'owner' field (not 'ownerUid')
          if (data.length === 0) {
            const legacyItems = await fetchLegacyItems(user.uid);
            if (legacyItems.length > 0) {
              data = legacyItems;
            }
          }

          setItems(data);
          setLoading(false);
          setError(null);
        },
        (err) => {
          setLoading(false);
          setError(err instanceof Error ? err : new Error(String(err)));
          logger.error('Items snapshot listener error', err, {
            code: (err as { code?: string })?.code,
            message: (err as { message?: string })?.message,
          });
        }
      );

      unsubRef.current = unsub;
    });

    return () => {
      if (unsubRef.current) {
        unsubRef.current();
      }
      stopAuth();
    };
  }, []);

  const refresh = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const user = auth.currentUser;
      if (!user) {
        setItems([]);
        return;
      }

      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.ITEMS),
        where('ownerUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const data = transformSnapshot(snap);
      setItems(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      logger.error('Error refreshing items', error);
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

