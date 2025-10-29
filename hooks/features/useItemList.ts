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
import { collection, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
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
  const buildQuery = useCallback(
    (firstPage: boolean, lastDoc: DocumentSnapshot | null) => {
      const base = collection(db, 'items');
      if (firstPage || !lastDoc) {
        return query(
          base,
          where('published', '==', true),
          orderBy('createdAt', 'desc'),
          limit(PAGE_SIZE)
        );
      }
      return query(
        base,
        where('published', '==', true),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );
    },
    []
  );

  // Pagination
  const { items, loading, loadingMore, hasMore, refreshing, refresh, loadMore } = usePagination<Item>({
    queryBuilder: buildQuery,
    pageSize: PAGE_SIZE,
    defaultTransform: (docs) =>
      docs
        .map((d) => ({ id: d.id, ...(d.data() as Partial<Item>) } as Item))
        .filter((it) => it.published === true && it.available !== false),
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
  const filteredItems = useMemo(() => filterItems(items, itemFilters), [items, itemFilters]);

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

