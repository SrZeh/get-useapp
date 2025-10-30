/**
 * Mock ratings utility for testing
 * 
 * This utility adds mock ratings to items for development/testing purposes.
 * Ratings are calculated from reviews and stored directly on item documents.
 */

import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import type { Item } from '@/types';

const ITEMS_PATH = FIRESTORE_COLLECTIONS.ITEMS || 'items';

/**
 * Mock rating data - different ratings for variety
 */
const MOCK_RATINGS = [
  { avg: 5.0, count: 12, sum: 60 },   // Excellent item
  { avg: 4.5, count: 8, sum: 36 },    // Very good
  { avg: 4.0, count: 15, sum: 60 },   // Good
  { avg: 3.5, count: 6, sum: 21 },    // Above average
  { avg: 3.0, count: 4, sum: 12 },   // Average
  { avg: 4.8, count: 20, sum: 96 },  // Popular item
  { avg: 4.2, count: 10, sum: 42 },   // Good with some issues
  { avg: 5.0, count: 3, sum: 15 },    // New item, perfect score
  { avg: 2.5, count: 2, sum: 5 },     // Poor (rare)
  { avg: 4.6, count: 7, sum: 32.2 }, // Great item
] as const;

/**
 * Add mock ratings to all items (or specific items)
 * This simulates having reviews on items
 * 
 * @param itemIds - Optional array of item IDs to update. If not provided, updates all items.
 * @returns Number of items updated
 */
export async function addMockRatingsToItems(itemIds?: string[]): Promise<number> {
  try {
    let items: Item[] = [];

    if (itemIds && itemIds.length > 0) {
      // Update specific items
      items = itemIds.map((id) => ({ id } as Item));
    } else {
      // Fetch all items
      const itemsCollection = collection(db, ITEMS_PATH);
      const snapshot = await getDocs(itemsCollection);
      items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];
    }

    if (items.length === 0) {
      console.warn('No items found to update with mock ratings');
      return 0;
    }

    let updated = 0;
    let ratingIndex = 0;

    // Update each item with a mock rating
    for (const item of items) {
      if (!item.id) continue;

      // Cycle through mock ratings
      const mockRating = MOCK_RATINGS[ratingIndex % MOCK_RATINGS.length];
      
      try {
        await updateDoc(doc(db, ITEMS_PATH, item.id), {
          ratingAvg: mockRating.avg,
          ratingCount: mockRating.count,
          ratingSum: mockRating.sum,
          lastReviewSnippet: 'Excelente item! Recomendo muito.',
          updatedAt: serverTimestamp(),
        });
        updated++;
        ratingIndex++;
      } catch (error) {
        console.error(`Failed to update item ${item.id}:`, error);
      }
    }

    console.log(`✅ Updated ${updated} items with mock ratings`);
    return updated;
  } catch (error) {
    console.error('Error adding mock ratings:', error);
    throw error;
  }
}

/**
 * Clear all ratings from items (reset to default)
 * 
 * @param itemIds - Optional array of item IDs to reset. If not provided, resets all items.
 * @returns Number of items reset
 */
export async function clearRatingsFromItems(itemIds?: string[]): Promise<number> {
  try {
    let items: Item[] = [];

    if (itemIds && itemIds.length > 0) {
      items = itemIds.map((id) => ({ id } as Item));
    } else {
      const itemsCollection = collection(db, ITEMS_PATH);
      const snapshot = await getDocs(itemsCollection);
      items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Item[];
    }

    if (items.length === 0) {
      console.warn('No items found to clear ratings');
      return 0;
    }

    let reset = 0;

    for (const item of items) {
      if (!item.id) continue;

      try {
        await updateDoc(doc(db, ITEMS_PATH, item.id), {
          ratingAvg: 0,
          ratingCount: 0,
          ratingSum: 0,
          lastReviewSnippet: '',
          updatedAt: serverTimestamp(),
        });
        reset++;
      } catch (error) {
        console.error(`Failed to reset item ${item.id}:`, error);
      }
    }

    console.log(`✅ Reset ratings for ${reset} items`);
    return reset;
  } catch (error) {
    console.error('Error clearing ratings:', error);
    throw error;
  }
}

