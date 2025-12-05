/**
 * useUserPublicItems - Hook for fetching items from a specific user
 * 
 * Used for public user profiles to display items that a user has available for rent/loan.
 * This is different from useUserItems which only works for the current authenticated user.
 */

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { logger } from '@/utils';
import type { Item } from '@/types';

type UseUserPublicItemsResult = {
  items: Item[];
  loading: boolean;
  error: Error | null;
};

/**
 * Hook to fetch items from a specific user (for public profiles)
 * @param ownerUid - User ID of the owner whose items to fetch
 * @param realTime - Whether to subscribe to real-time updates (default: true)
 * @returns Items, loading state, and error
 */
export function useUserPublicItems(ownerUid: string | undefined, realTime = true): UseUserPublicItemsResult {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ownerUid) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    let unsubscribe: Unsubscribe | null = null;
    let alive = true;

    const fetchItems = async () => {
      try {
        setLoading(true);
        setError(null);

        const q = query(
          collection(db, FIRESTORE_COLLECTIONS.ITEMS),
          where('ownerUid', '==', ownerUid),
          where('published', '==', true),
          orderBy('createdAt', 'desc')
        );

        if (realTime) {
          // Subscribe to real-time updates
          unsubscribe = onSnapshot(
            q,
            (snapshot) => {
              if (!alive) return;

              const fetchedItems: Item[] = snapshot.docs.map((doc) => {
                const data = doc.data() as Partial<Item>;
                return {
                  id: doc.id,
                  title: data.title ?? '(sem título)',
                  description: data.description ?? '',
                  photos: data.photos ?? [],
                  available: data.available ?? true,
                  createdAt: data.createdAt ?? null,
                  ratingCount: data.ratingCount ?? 0,
                  ratingSum: data.ratingSum ?? 0,
                  ownerRatingCount: data.ownerRatingCount ?? 0,
                  ownerRatingSum: data.ownerRatingSum ?? 0,
                  ...data,
                } as Item;
              });

              setItems(fetchedItems);
              setLoading(false);
            },
            (err) => {
              if (!alive) return;
              logger.error('Error fetching user public items', err);
              setError(err instanceof Error ? err : new Error('Erro ao carregar itens'));
              setLoading(false);
            }
          );
        } else {
          // One-time fetch
          const snapshot = await getDocs(q);
          if (!alive) return;

          const fetchedItems: Item[] = snapshot.docs.map((doc) => {
            const data = doc.data() as Partial<Item>;
            return {
              id: doc.id,
              title: data.title ?? '(sem título)',
              description: data.description ?? '',
              photos: data.photos ?? [],
              available: data.available ?? true,
              createdAt: data.createdAt ?? null,
              ratingCount: data.ratingCount ?? 0,
              ratingSum: data.ratingSum ?? 0,
              ownerRatingCount: data.ownerRatingCount ?? 0,
              ownerRatingSum: data.ownerRatingSum ?? 0,
              ...data,
            } as Item;
          });

          setItems(fetchedItems);
          setLoading(false);
        }
      } catch (err) {
        if (!alive) return;
        logger.error('Error fetching user public items', err);
        setError(err instanceof Error ? err : new Error('Erro ao carregar itens'));
        setLoading(false);
      }
    };

    fetchItems();

    return () => {
      alive = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [ownerUid, realTime]);

  return { items, loading, error };
}



