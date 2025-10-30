/**
 * Item filtering utilities
 */

import type { Item } from '@/types';
import { PRICE_RANGES, type PriceRange } from '@/constants/filters';

/**
 * Price range filter (by range ID)
 */
export type PriceRangeFilter = {
  rangeIds?: string[];
};

/**
 * Item filter criteria
 */
export type ItemFilters = {
  search?: string;
  category?: string;
  city?: string | string[]; // Support both single string and array for backward compatibility
  neighborhood?: string | string[]; // Support both single string and array for backward compatibility
  priceRange?: string; // Single price range ID (e.g., 'free', '0-50', '50-100', etc.) - legacy dropdown
  minPrice?: number; // Minimum price filter
  maxPrice?: number; // Maximum price filter
  excludeOwnerUid?: string;
};

/**
 * Filter items based on search, category, location, and owner exclusion
 * 
 * @param items - Array of items to filter
 * @param filters - Filter criteria
 * @returns Filtered array of items
 */
export function filterItems(items: Item[], filters: ItemFilters): Item[] {
  const { search, category, city, neighborhood, priceRange, minPrice, maxPrice, excludeOwnerUid } = filters;
  
  const q = (search ?? '').trim().toLowerCase();
  
  // Normalize city filter - support both string and array
  const cityFilter: string[] = Array.isArray(city)
    ? city.map((c) => c.trim().toLowerCase()).filter((c) => c.length > 0)
    : city
    ? [city.trim().toLowerCase()]
    : [];
  
  // Normalize neighborhood filter - support both string and array
  const neighborhoodFilter: string[] = Array.isArray(neighborhood)
    ? neighborhood.map((n) => n.trim().toLowerCase()).filter((n) => n.length > 0)
    : neighborhood
    ? [neighborhood.trim().toLowerCase()]
    : [];

  // Get selected price range (single selection for dropdown)
  const selectedRange: PriceRange | undefined = priceRange && priceRange.trim()
    ? PRICE_RANGES.find((range) => range.id === priceRange.trim())
    : undefined;

  return items.filter((it) => {
    // Exclude items owned by specific user
    if (excludeOwnerUid && it.ownerUid === excludeOwnerUid) {
      return false;
    }

    // Category filter
    if (category && (it.category ?? '') !== category) {
      return false;
    }

    // City filter - supports multiple selections (OR logic)
    if (cityFilter.length > 0) {
      const itemCity = (it.city ?? '').trim().toLowerCase();
      if (!cityFilter.includes(itemCity)) {
        return false;
      }
    }

    // Neighborhood filter - supports multiple selections (OR logic)
    if (neighborhoodFilter.length > 0) {
      const itemNeighborhood = (it.neighborhood ?? '').trim().toLowerCase();
      if (!neighborhoodFilter.includes(itemNeighborhood)) {
        return false;
      }
    }

    // Calculate item effective rate once
    const itemDailyRate = it.dailyRate ?? 0;
    const itemIsFree = it.isFree ?? false;
    const itemEffectiveRate = itemIsFree ? 0 : itemDailyRate;

    // Price range filter - legacy dropdown (still supported)
    if (selectedRange) {
      // Handle "free" range (both min and max are 0)
      if (selectedRange.id === 'free') {
        if (!(itemIsFree || itemEffectiveRate === 0)) {
          return false;
        }
      } else {
        const min = selectedRange.min ?? 0;
        const max = selectedRange.max ?? Infinity;

        // For ranges with null max, check if >= min
        if (selectedRange.max === null) {
          if (itemEffectiveRate < min) {
            return false;
          }
        } else {
          // For normal ranges, check if within min (inclusive) and max (inclusive)
          if (itemEffectiveRate < min || itemEffectiveRate > max) {
            return false;
          }
        }
      }
    }

    // Min/Max price filter - items with dailyRate within range
    // Min price filter
    if (minPrice !== undefined && minPrice !== null && minPrice > 0) {
      if (itemEffectiveRate < minPrice) {
        return false;
      }
    }

    // Max price filter
    if (maxPrice !== undefined && maxPrice !== null && maxPrice > 0) {
      if (itemEffectiveRate > maxPrice) {
        return false;
      }
    }

    // Search filter (matches title, description, category, condition)
    if (q) {
      const hay = `${it.title ?? ''} ${it.description ?? ''} ${it.category ?? ''} ${it.condition ?? ''}`.toLowerCase();
      if (!hay.includes(q)) {
        return false;
      }
    }

    return true;
  });
}

