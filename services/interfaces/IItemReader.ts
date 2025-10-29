/**
 * Item Reader Interface
 * 
 * Defines read-only operations for items.
 * Components that only need to read items don't depend on write methods.
 * Follows Interface Segregation Principle (ISP).
 */

import type { Item } from '@/types';
import type { ItemServiceResult } from './IItemService';

/**
 * Item Reader Interface
 */
export interface IItemReader {
  /**
   * Get a single item by ID
   * @param itemId - Item ID
   * @returns Item or null if not found
   */
  getItem(itemId: string): Promise<Item | null>;

  /**
   * List items (with SDK fallback to REST API)
   * @returns Items list with source indicator
   */
  listItems(): Promise<
    | { via: 'sdk'; items: Item[] }
    | { via: 'rest'; items: Array<{ id: string; title: string; createdAt?: string }> }
  >;
}

