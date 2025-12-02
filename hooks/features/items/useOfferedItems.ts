/**
 * useOfferedItems - Hook to fetch items offered to a request
 * 
 * Fetches multiple items by their IDs using Firestore query with whereIn
 * This is more efficient than fetching items one by one
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { useItemsStore } from '@/stores/itemsStore';
import type { Item } from '@/types';

/**
 * Hook to fetch items by their IDs using Firestore whereIn query
 * @param itemIds - Array of item IDs to fetch
 * @param refreshTrigger - Optional trigger to force refresh (e.g., timestamp)
 */
export function useOfferedItems(itemIds: string[], refreshTrigger?: number): {
  items: Item[];
  loading: boolean;
  refresh: () => void;
} {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [internalRefresh, setInternalRefresh] = useState(0);
  const setItem = useItemsStore((state) => state.setItem);

  // Create a stable sorted key for dependency comparison
  const itemIdsKey = useMemo(() => {
    const sorted = [...itemIds].sort().join(',');
    console.log('[useOfferedItems] Item IDs key:', {
      original: itemIds,
      sorted,
      key: sorted,
    });
    return sorted;
  }, [itemIds.join(',')]);

  const fetchItems = useCallback(async () => {
    if (itemIds.length === 0) {
      console.log('[useOfferedItems] No item IDs provided');
      setItems([]);
      setLoading(false);
      return;
    }

    console.log('[useOfferedItems] Fetching items directly from Firestore:', itemIds);
    try {
      setLoading(true);
      
      // Fetch all items in parallel using getDoc
      const itemPromises = itemIds.map(async (id) => {
        try {
          const itemDoc = await getDoc(doc(db, FIRESTORE_COLLECTIONS.ITEMS, id));
          if (!itemDoc.exists()) {
            console.warn('[useOfferedItems] Item not found:', id);
            return null;
          }
          
          const data = itemDoc.data() as Partial<Item>;
          const item: Item = {
            id: itemDoc.id,
            title: data.title ?? '(sem título)',
            description: data.description ?? '',
            photos: data.photos ?? [],
            available: data.available ?? true,
            createdAt: data.createdAt ?? null,
            ratingCount: data.ratingCount ?? 0,
            ratingSum: data.ratingSum ?? 0,
            ownerRatingCount: data.ownerRatingCount ?? 0,
            ownerRatingSum: data.ownerRatingSum ?? 0,
            offeredItems: Array.isArray(data.offeredItems) ? data.offeredItems : undefined,
            ...data,
          } as Item;
          
          // Cache the item
          setItem(item);
          
          return item;
        } catch (error) {
          console.error('[useOfferedItems] Error fetching item:', id, error);
          return null;
        }
      });
      
      const fetchedItems = await Promise.all(itemPromises);
      const validItems = fetchedItems.filter((item): item is Item => item !== null);
      
      console.log('[useOfferedItems] Fetched items:', {
        itemIds,
        requestedCount: itemIds.length,
        fetchedCount: validItems.length,
        items: validItems.map(i => ({ id: i.id, title: i.title })),
      });
      
      setItems(validItems);
    } catch (error) {
      console.error('[useOfferedItems] Error fetching offered items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [itemIdsKey, setItem]);

  useEffect(() => {
    console.log('[useOfferedItems] useEffect triggered:', {
      itemIdsKey,
      refreshTrigger,
      internalRefresh,
      itemIdsLength: itemIds.length,
    });
    fetchItems();
  }, [fetchItems, refreshTrigger, internalRefresh]);

  const refresh = useCallback(() => {
    setInternalRefresh((prev) => prev + 1);
  }, []);

  return { items, loading, refresh };
}

