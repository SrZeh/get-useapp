/**
 * Locations Store - Optimized location/filter data management
 * 
 * Features:
 * - Extracts cities and neighborhoods from cached items (no extra queries!)
 * - Caches extracted locations with TTL
 * - Automatically updates when items change
 */

import { create } from 'zustand';
import { useItemsStore } from './itemsStore';

interface LocationsStore {
  cities: string[];
  neighborhoods: string[];
  lastUpdated: number | null;
  loading: boolean;
  
  // Actions
  getLocations: () => { cities: string[]; neighborhoods: string[] };
  refreshLocations: () => void;
}

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes (locations don't change often)

/**
 * Extract unique cities and neighborhoods from items
 */
function extractLocations(items: Array<{ city?: string; neighborhood?: string }>): {
  cities: string[];
  neighborhoods: string[];
} {
  const citySet = new Set<string>();
  const neighborhoodSet = new Set<string>();

  items.forEach((item) => {
    if (item.city && typeof item.city === 'string' && item.city.trim()) {
      citySet.add(item.city.trim());
    }
    if (item.neighborhood && typeof item.neighborhood === 'string' && item.neighborhood.trim()) {
      neighborhoodSet.add(item.neighborhood.trim());
    }
  });

  const cities = Array.from(citySet).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const neighborhoods = Array.from(neighborhoodSet).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  return { cities, neighborhoods };
}

export const useLocationsStore = create<LocationsStore>((set, get) => ({
  cities: [],
  neighborhoods: [],
  lastUpdated: null,
  loading: false,

  /**
   * Get locations - extracts from cached items, no Firestore query!
   */
  getLocations: () => {
    const state = get();
    const now = Date.now();

    // Return cached locations if still valid
    if (state.lastUpdated && (now - state.lastUpdated) < CACHE_TTL && state.cities.length > 0) {
      return {
        cities: state.cities,
        neighborhoods: state.neighborhoods,
      };
    }

    // Extract from all cached items (from itemsStore)
    const itemsStore = useItemsStore.getState();
    
    // Get all items from cache (user items + any other cached items)
    const allItems: Array<{ city?: string; neighborhood?: string }> = [];
    
    // Add user items
    allItems.push(...itemsStore.userItems);
    
    // Add items from cache map
    itemsStore.itemsById.forEach((cache) => {
      allItems.push(cache.item);
    });

    const { cities, neighborhoods } = extractLocations(allItems);

    set({
      cities,
      neighborhoods,
      lastUpdated: now,
    });

    return { cities, neighborhoods };
  },

  /**
   * Refresh locations cache
   */
  refreshLocations: () => {
    set({ lastUpdated: null });
    get().getLocations();
  },
}));

