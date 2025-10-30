import { useCallback, useEffect, useRef, useState } from 'react';
import { getDocs, Query, DocumentSnapshot } from 'firebase/firestore';
import { logger, shuffle } from '@/utils';
import type { Item } from '@/types';
import { useItemsStore } from '@/stores/itemsStore';

type UsePaginationOptions<T> = {
  queryBuilder: (firstPage: boolean, lastDoc: DocumentSnapshot | null) => Query;
  pageSize: number;
  transform?: (docs: DocumentSnapshot[]) => T[];
  defaultTransform?: (docs: DocumentSnapshot[]) => T[];
};

type UsePaginationResult<T> = {
  items: T[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  error: Error | null;
};

/**
 * Generic pagination hook for Firestore queries
 * 
 * Features:
 * - Automatic pagination state management
 * - Loading and error states
 * - Refresh capability
 * - Load more on demand
 * - Prevents duplicate fetches
 * 
 * @param options - Pagination configuration
 * @returns Pagination state and controls
 */
export function usePagination<T = Item>({
  queryBuilder,
  pageSize,
  transform,
  defaultTransform,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const lastDocRef = useRef<DocumentSnapshot | null>(null);
  const hasMoreRef = useRef(true);
  const isFetchingRef = useRef(false);

  // Get setItem from store to cache items as they're fetched
  const setItem = useItemsStore((state) => state.setItem);

  const transformDocs = transform || defaultTransform || ((docs: DocumentSnapshot[]) => {
    return docs.map((d) => ({ id: d.id, ...(d.data() as Partial<Item>) } as T));
  });

  const fetchPage = useCallback(
    async (reset = false) => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;

      if (reset) {
        setLoading(true);
        setHasMore(true);
        hasMoreRef.current = true;
        lastDocRef.current = null;
        setError(null);
      } else {
        if (!hasMoreRef.current) {
          isFetchingRef.current = false;
          return;
        }
        setLoadingMore(true);
      }

      try {
        const q = queryBuilder(reset, lastDocRef.current);
        const snap = await getDocs(q);
        const page = transformDocs(snap.docs);

        // Cache items in store as they're fetched (optimization!)
        if (page.length > 0 && typeof page[0] === 'object' && page[0] !== null && 'id' in page[0]) {
          page.forEach((item: any) => {
            if (item && item.id && typeof item.id === 'string') {
              // Type guard: only cache if it looks like an Item
              const maybeItem = item as Partial<Item>;
              if (maybeItem.title !== undefined || maybeItem.ownerUid !== undefined) {
                setItem(item as Item);
              }
            }
          });
        }

        if (snap.docs.length) {
          lastDocRef.current = snap.docs[snap.docs.length - 1];
        }
        if (snap.docs.length < pageSize) {
          setHasMore(false);
          hasMoreRef.current = false;
        }

        setItems((prev) => (reset ? shuffle(page) : [...prev, ...shuffle(page)]));
      } catch (e) {
        const err = e instanceof Error ? e : new Error(String(e));
        logger.warn('Error loading paginated items', { error: err });
        setError(err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        isFetchingRef.current = false;
      }
    },
    [queryBuilder, pageSize, transformDocs, defaultTransform, setItem]
  );

  useEffect(() => {
    // Initial load
    fetchPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPage(true);
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMoreRef.current) return;
    await fetchPage(false);
  }, [loading, loadingMore, fetchPage]);

  return {
    items,
    loading,
    loadingMore,
    hasMore,
    refreshing,
    refresh,
    loadMore,
    error,
  };
}

