/**
 * Firebase Item Service Implementation
 * 
 * Concrete implementation of IItemService using Firebase Firestore.
 * This is the default implementation used in production.
 */

import type { IItemService, ItemServiceResult } from '../interfaces';
import type { Item, NewItemInput } from '@/types';
import {
  safeCreateItemFull,
  safeCreateItem,
  safeUpdateItem,
  safeBumpRating,
  safeListItems,
  safeGetItem,
} from '../items';

/**
 * Firebase implementation of Item Service
 */
export class FirebaseItemService implements IItemService {
  async getItem(itemId: string): Promise<Item | null> {
    return await safeGetItem(itemId);
  }

  async createItem(input: NewItemInput): Promise<ItemServiceResult<{ id: string }>> {
    const result = await safeCreateItemFull(input);
    return {
      via: result.via,
      data: { id: result.id },
    };
  }

  async createItemSimple(title: string): Promise<ItemServiceResult<void>> {
    const result = await safeCreateItem(title);
    return {
      via: result.via,
      data: undefined,
    };
  }

  async updateItem(itemId: string, patch: Partial<NewItemInput>): Promise<ItemServiceResult<void>> {
    const result = await safeUpdateItem(itemId, patch);
    return {
      via: result.via,
      data: undefined,
    };
  }

  async updateItemRating(itemId: string, rating: number, lastSnippet?: string): Promise<ItemServiceResult<void>> {
    const result = await safeBumpRating(itemId, rating, lastSnippet);
    return {
      via: result.via,
      data: undefined,
    };
  }

  async listItems(): Promise<
    | { via: 'sdk'; items: Item[] }
    | { via: 'rest'; items: Array<{ id: string; title: string; createdAt?: string }> }
  > {
    return await safeListItems();
  }
}

// Export singleton instance
export const firebaseItemService = new FirebaseItemService();

