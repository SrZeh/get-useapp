/**
 * Item filtering utilities
 */

import type { Item } from '@/types';

/**
 * Item filter criteria
 */
export type ItemFilters = {
  search?: string;
  category?: string;
  city?: string;
  neighborhood?: string;
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
  const { search, category, city, neighborhood, excludeOwnerUid } = filters;
  
  const q = (search ?? '').trim().toLowerCase();
  const cityQ = (city ?? '').trim().toLowerCase();
  const neighQ = (neighborhood ?? '').trim().toLowerCase();

  return items.filter((it) => {
    // Exclude items owned by specific user
    if (excludeOwnerUid && it.ownerUid === excludeOwnerUid) {
      return false;
    }

    // Category filter
    if (category && (it.category ?? '') !== category) {
      return false;
    }

    // City filter (exact match)
    if (cityQ && (it.city ?? '').toLowerCase() !== cityQ) {
      return false;
    }

    // Neighborhood filter (exact match)
    if (neighQ && (it.neighborhood ?? '').toLowerCase() !== neighQ) {
      return false;
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

