/**
 * Item Writer Interface
 * 
 * Defines write operations for items.
 * Components that only need to write items don't depend on read methods.
 * Follows Interface Segregation Principle (ISP).
 */

import type { NewItemInput } from '@/types';
import type { ItemServiceResult } from './IItemService';

/**
 * Item Writer Interface
 */
export interface IItemWriter {
  /**
   * Create a new item
   * @param input - Item input data
   * @returns Created item ID and method used
   */
  createItem(input: NewItemInput): Promise<ItemServiceResult<{ id: string }>>;

  /**
   * Create a simple item (legacy method)
   * @param title - Item title
   * @returns Method used
   */
  createItemSimple(title: string): Promise<ItemServiceResult<void>>;

  /**
   * Update an existing item
   * @param itemId - Item ID to update
   * @param patch - Partial item data to update
   * @returns Method used
   */
  updateItem(itemId: string, patch: Partial<NewItemInput>): Promise<ItemServiceResult<void>>;

  /**
   * Update item rating aggregates
   * @param itemId - Item ID
   * @param rating - Rating value (1-5)
   * @param lastSnippet - Optional review snippet
   * @returns Method used
   */
  updateItemRating(itemId: string, rating: number, lastSnippet?: string): Promise<ItemServiceResult<void>>;
}

