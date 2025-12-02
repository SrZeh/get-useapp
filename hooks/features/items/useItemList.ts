/**
 * useItemList - Hook for managing item list state, filtering, and pagination
 * 
 * Encapsulates all item list logic including:
 * - Filter state management
 * - Pagination
 * - Local filtering
 * - Query building
 * 
 * This follows the screen composition pattern where hooks contain business logic
 * and components handle presentation.
 */

import { useCallback, useMemo, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import type { DocumentSnapshot } from 'firebase/firestore';
import { collection, limit, orderBy, query, startAfter, where, Timestamp } from 'firebase/firestore';
import { usePagination } from '@/hooks/usePagination';
import { useLocations } from '@/hooks/useLocations';
import type { Item, ItemFilters } from '@/types';
import { filterItems } from '@/utils';

const PAGE_SIZE = 20;

export interface ItemListFilters {
  search: string;
  category: string;
  city: string;
  neighborhood: string;
  selectedCity: string;
  selectedNeighborhood: string;
  minPrice: number | null;
  maxPrice: number | null;
}

export interface ItemListActions {
  setSearch: (value: string) => void;
  setCategory: (value: string) => void;
  setCity: (value: string) => void;
  setNeighborhood: (value: string) => void;
  setSelectedCity: (value: string) => void;
  setSelectedNeighborhood: (value: string) => void;
  setMinPrice: (value: number | null) => void;
  setMaxPrice: (value: number | null) => void;
}

export interface UseItemListResult {
  // Data
  items: Item[];
  filteredItems: Item[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  refreshing: boolean;
  
  // Filters
  filters: ItemListFilters;
  itemFilters: ItemFilters; // For filterItems utility
  
  // Locations
  cities: string[];
  neighborhoods: string[];
  locationsLoading: boolean;
  
  // Actions
  actions: ItemListActions;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
}

/**
 * Hook for managing item list with filtering and pagination
 */
export function useItemList(): UseItemListResult {
  const me = auth.currentUser?.uid || null;
  
  // Filter state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  // Locations
  const { cities, neighborhoods, loading: locationsLoading } = useLocations();

  // Build query for pagination
  // Includes both offers and non-expired requests
  const buildQuery = useCallback(
    (firstPage: boolean, lastDoc: DocumentSnapshot | null) => {
      const base = collection(db, 'items');
      const now = Timestamp.now();
      
      // Query: published items that are either:
      // 1. Offers (itemType !== 'request' or itemType is undefined)
      // 2. Requests that haven't expired (expiresAt > now)
      // Note: Firestore doesn't support OR queries easily, so we'll filter requests in the transform
      if (firstPage || !lastDoc) {
        return query(
          base,
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE * 2) // Get more to account for filtering
        );
      }
      return query(
        base,
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE * 2) // Get more to account for filtering
      );
    },
    []
  );

  // Pagination
  const { items, loading, loadingMore, hasMore, refreshing, refresh, loadMore } = usePagination<Item>({
    queryBuilder: buildQuery,
    pageSize: PAGE_SIZE,
    defaultTransform: (docs) => {
      const now = Date.now();
      return docs
        .map((d) => ({ id: d.id, ...(d.data() as Partial<Item>) } as Item))
        .filter((it) => {
          // Must be published and available
          if (it.published !== true || it.available === false) return false;
          
          // If it's a request, check if it's expired
          if (it.itemType === 'request' && it.expiresAt) {
            const expiration = it.expiresAt instanceof Date 
              ? it.expiresAt 
              : (it.expiresAt as any)?.toDate?.() || new Date(it.expiresAt as any);
            if (expiration.getTime() <= now) return false; // Expired request
          }
          
          return true;
        });
    },
  });

  // Combine filters for filterItems utility
  const itemFilters: ItemFilters = useMemo(
    () => ({
      search,
      category,
      city: selectedCity || city || undefined,
      neighborhood: selectedNeighborhood || neighborhood || undefined,
      minPrice: minPrice !== null ? minPrice : undefined,
      maxPrice: maxPrice !== null ? maxPrice : undefined,
      excludeOwnerUid: me || undefined,
    }),
    [search, category, city, neighborhood, selectedCity, selectedNeighborhood, minPrice, maxPrice, me]
  );

  // Apply local filters
  const filteredItems = useMemo(() => {
    const filtered = filterItems(items, itemFilters);
    
    // Separate requests (help requests) from offers (rentals)
    const requests = filtered.filter(item => item.itemType === 'request');
    const offers = filtered.filter(item => item.itemType !== 'request');
    
    // Sort requests by most recent (createdAt desc)
    const sortedRequests = [...requests].sort((a, b) => {
      const aDate = a.createdAt instanceof Date 
        ? a.createdAt 
        : (a.createdAt as any)?.toDate?.() || new Date(a.createdAt as any);
      const bDate = b.createdAt instanceof Date 
        ? b.createdAt 
        : (b.createdAt as any)?.toDate?.() || new Date(b.createdAt as any);
      return bDate.getTime() - aDate.getTime(); // Most recent first
    });
    
    // Interleave: request, offer, request, offer, etc.
    const interleaved: Item[] = [];
    const maxLength = Math.max(sortedRequests.length, offers.length);
    
    for (let i = 0; i < maxLength; i++) {
      // Prioritize requests - add one if available
      if (i < sortedRequests.length) {
        interleaved.push(sortedRequests[i]);
      }
      // Then add an offer if available
      if (i < offers.length) {
        interleaved.push(offers[i]);
      }
    }
    
    return interleaved;
  }, [items, itemFilters]);

  // Filter state object
  const filters: ItemListFilters = useMemo(
    () => ({
      search,
      category,
      city,
      neighborhood,
      selectedCity,
      selectedNeighborhood,
      minPrice,
      maxPrice,
    }),
    [search, category, city, neighborhood, selectedCity, selectedNeighborhood, minPrice, maxPrice]
  );

  // Actions
  const actions: ItemListActions = useMemo(
    () => ({
      setSearch,
      setCategory,
      setCity,
      setNeighborhood,
      setSelectedCity,
      setSelectedNeighborhood,
      setMinPrice,
      setMaxPrice,
    }),
    []
  );

  return {
    items,
    filteredItems,
    loading,
    loadingMore,
    hasMore,
    refreshing,
    filters,
    itemFilters,
    cities,
    neighborhoods,
    locationsLoading,
    actions,
    refresh,
    loadMore,
  };
}

