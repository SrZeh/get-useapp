/**
 * Hook to get unique cities and neighborhoods
 * 
 * Now optimized: Extracts locations from cached items instead of querying all Firestore items!
 * This eliminates a massive query that was fetching ALL published items just for filter data.
 */

import { useEffect, useState } from 'react';
import { useLocationsStore } from '@/stores/locationsStore';
import { useItemsStore } from '@/stores/itemsStore';

export interface LocationData {
  cities: string[];
  neighborhoods: string[];
}

interface UseLocationsResult {
  cities: string[];
  neighborhoods: string[];
  loading: boolean;
  error: Error | null;
}

/**
 * Gets unique cities and neighborhoods from cached items (no Firestore query!)
 * 
 * Optimizations:
 * - Extracts from already-cached items in itemsStore
 * - Caches extracted locations with 30-minute TTL
 * - Automatically updates when items are loaded
 * 
 * @returns Object containing cities array, neighborhoods array, loading state, and error
 */
export function useLocations(): UseLocationsResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Get locations from store (extracted from cached items)
  const getLocations = useLocationsStore((state) => state.getLocations);
  const userItems = useItemsStore((state) => state.userItems);
  const userItemsLoading = useItemsStore((state) => state.userItemsLoading);
  
  // Subscribe to user items to auto-refresh locations when items load
  const subscribeToUserItems = useItemsStore((state) => state.subscribeToUserItems);
  
  useEffect(() => {
    subscribeToUserItems();
  }, [subscribeToUserItems]);

  // Get locations from cache/extract from items
  useEffect(() => {
    try {
      setLoading(true);
      // This extracts from cached items, no Firestore query!
      const { cities, neighborhoods } = getLocations();
      
      // If we have user items loading, keep loading state
      if (!userItemsLoading && cities.length === 0 && neighborhoods.length === 0) {
        // Locations will be populated when items load
        setLoading(false);
      } else {
        setLoading(false);
      }
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to get locations');
      setError(error);
      setLoading(false);
    }
  }, [getLocations, userItems, userItemsLoading]);

  const cities = useLocationsStore((state) => state.cities);
  const neighborhoods = useLocationsStore((state) => state.neighborhoods);

  return { cities, neighborhoods, loading, error };
}
