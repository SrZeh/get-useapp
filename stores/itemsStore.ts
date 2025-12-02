/**
 * Items Store - Optimized Firestore query management for items
 * 
 * Features:
 * - Caches items by ID to avoid duplicate queries
 * - Caches list queries with TTL
 * - Shares real-time listeners across components
 * - Optimizes user items queries
 */

import { create } from 'zustand';
import { collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, where, type DocumentSnapshot, type QuerySnapshot, type Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { onAuthStateChanged } from 'firebase/auth';
import { logger } from '@/utils';
import type { Item } from '@/types';

interface ItemCache {
  item: Item;
  timestamp: number;
}

interface ListCache {
  items: Item[];
  timestamp: number;
  queryKey: string;
}

interface ItemsStore {
  // Cache
  itemsById: Map<string, ItemCache>;
  listCache: Map<string, ListCache>;
  
  // Real-time listeners
  userItemsListener: Unsubscribe | null;
  userItems: Item[];
  userItemsLoading: boolean;
  userItemsError: Error | null;
  
  // Actions
  getItem: (id: string, forceRefresh?: boolean) => Promise<Item | null>;
  getUserItems: () => Item[];
  subscribeToUserItems: () => void;
  unsubscribeFromUserItems: () => void;
  invalidateItem: (id: string) => void;
  invalidateUserItems: () => void;
  invalidateListCache: (queryKey?: string) => void;
  setItem: (item: Item) => void;
  setUserItems: (items: Item[]) => void;
  setUserItemsLoading: (loading: boolean) => void;
  setUserItemsError: (error: Error | null) => void;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const LIST_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

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
    createdAt: data.createdAt ?? null,
    ratingCount: data.ratingCount ?? 0,
    ratingSum: data.ratingSum ?? 0,
    ownerRatingCount: data.ownerRatingCount ?? 0,
    ownerRatingSum: data.ownerRatingSum ?? 0,
    // Explicitly preserve offeredItems array (important for help requests)
    offeredItems: Array.isArray(data.offeredItems) ? data.offeredItems : undefined,
    ...data,
  } as Item;
}

/**
 * Transform query snapshot to Item array
 */
function transformSnapshot(snap: QuerySnapshot): Item[] {
  return snap.docs.map(transformDocument);
}

export const useItemsStore = create<ItemsStore>((set, get) => ({
  // Initial state
  itemsById: new Map(),
  listCache: new Map(),
  userItemsListener: null,
  userItems: [],
  userItemsLoading: false,
  userItemsError: null,

  /**
   * Get item by ID with caching
   */
  getItem: async (id: string, forceRefresh = false) => {
    const state = get();
    const cached = state.itemsById.get(id);
    const now = Date.now();

    // Return cached item if still valid
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL) {
      return cached.item;
    }

    try {
      const snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.ITEMS, id));
      
      if (!snap.exists()) {
        // Remove from cache if not found
        set((state) => {
          const newCache = new Map(state.itemsById);
          newCache.delete(id);
          return { itemsById: newCache };
        });
        return null;
      }

      const item = transformDocument(snap);

      // Update cache
      set((state) => {
        const newCache = new Map(state.itemsById);
        newCache.set(id, { item, timestamp: now });
        return { itemsById: newCache };
      });

      return item;
    } catch (error) {
      logger.error('Error fetching item', error);
      throw error;
    }
  },

  /**
   * Get user items from cache
   */
  getUserItems: () => {
    return get().userItems;
  },

  /**
   * Subscribe to user items with real-time updates
   * Only creates one listener that's shared across all components
   * Note: This doesn't return a cleanup function because the store manages the listener lifecycle
   */
  subscribeToUserItems: () => {
    const state = get();
    
    // If listener already exists, don't create another
    if (state.userItemsListener) {
      return;
    }

    let stopAuth: (() => void) | null = null;
    let currentUnsub: (() => void) | null = null;

    stopAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listener
      if (currentUnsub) {
        currentUnsub();
        currentUnsub = null;
      }

      if (!user) {
        set({
          userItems: [],
          userItemsLoading: false,
          userItemsError: null,
          userItemsListener: null,
        });
        return;
      }

      set({ userItemsLoading: true, userItemsError: null });
      logger.debug('Loading items for user', { uid: user.uid });

      // Query user items
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.ITEMS),
        where('ownerUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          const items = transformSnapshot(snap);
          
          // Check if items actually changed to avoid unnecessary updates
          const currentItems = get().userItems;
          const itemsChanged = 
            items.length !== currentItems.length ||
            items.some((item, index) => {
              const current = currentItems[index];
              return !current || current.id !== item.id || 
                     JSON.stringify(current) !== JSON.stringify(item);
            });
          
          // Only update if items actually changed
          if (!itemsChanged && !get().userItemsLoading) {
            return; // Skip update if nothing changed
          }
          
          // Also update individual item cache
          const newCache = new Map(get().itemsById);
          items.forEach((item) => {
            newCache.set(item.id, { item, timestamp: Date.now() });
          });

          set({
            userItems: items,
            userItemsLoading: false,
            userItemsError: null,
            itemsById: newCache,
          });
        },
        (err) => {
          const error = err instanceof Error ? err : new Error(String(err));
          set({
            userItemsLoading: false,
            userItemsError: error,
          });
          logger.error('Items snapshot listener error', err);
        }
      );

      currentUnsub = unsub;
      
      // Store combined cleanup function
      const combinedCleanup = () => {
        if (currentUnsub) {
          currentUnsub();
          currentUnsub = null;
        }
        if (stopAuth) {
          stopAuth();
          stopAuth = null;
        }
      };

      set({ userItemsListener: combinedCleanup });
    });
  },

  /**
   * Unsubscribe from user items
   */
  unsubscribeFromUserItems: () => {
    const state = get();
    if (state.userItemsListener) {
      state.userItemsListener();
      set({ userItemsListener: null });
    }
  },

  /**
   * Invalidate item cache
   */
  invalidateItem: (id: string) => {
    set((state) => {
      const newCache = new Map(state.itemsById);
      newCache.delete(id);
      return { itemsById: newCache };
    });
  },

  /**
   * Invalidate user items cache
   */
  invalidateUserItems: () => {
    set({ userItems: [] });
    // Force refetch by clearing listener
    const state = get();
    if (state.userItemsListener) {
      state.userItemsListener();
      set({ userItemsListener: null });
    }
    get().subscribeToUserItems();
  },

  /**
   * Invalidate list cache
   */
  invalidateListCache: (queryKey?: string) => {
    set((state) => {
      const newCache = new Map(state.listCache);
      if (queryKey) {
        newCache.delete(queryKey);
      } else {
        newCache.clear();
      }
      return { listCache: newCache };
    });
  },

  /**
   * Set item in cache (useful after mutations)
   * NOTE: Does NOT update userItems to avoid infinite loops with Firestore listeners
   * The listener will update userItems automatically when Firestore changes
   */
  setItem: (item: Item) => {
    set((state) => {
      const newCache = new Map(state.itemsById);
      newCache.set(item.id, { item, timestamp: Date.now() });
      
      // Only update cache, NOT userItems - let the Firestore listener handle userItems updates
      // This prevents infinite loops when listeners trigger setItem
      return {
        itemsById: newCache,
      };
    });
  },

  /**
   * Set user items directly (useful for mutations)
   */
  setUserItems: (items: Item[]) => {
    // Update cache
    const newCache = new Map(get().itemsById);
    items.forEach((item) => {
      newCache.set(item.id, { item, timestamp: Date.now() });
    });

    set({
      userItems: items,
      itemsById: newCache,
    });
  },

  /**
   * Set loading state
   */
  setUserItemsLoading: (loading: boolean) => {
    set({ userItemsLoading: loading });
  },

  /**
   * Set error state
   */
  setUserItemsError: (error: Error | null) => {
    set({ userItemsError: error });
  },
}));

