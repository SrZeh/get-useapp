/**
 * Script to add mock ratings to items for testing
 * 
 * Usage (with Firebase CLI authentication):
 *   1. First authenticate: firebase login
 *   2. Then run: npx tsx scripts/addMockRatings.ts
 *   3. Or clear: npx tsx scripts/addMockRatings.ts --clear
 * 
 * Alternative: Use the in-app utility function from utils/mockRatings.ts
 * in a development screen or console.
 * 
 * This script uses Firebase JS SDK (web version) to avoid React Native dependencies.
 * Note: Requires Firestore write permissions or emulator connection.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, collection, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDgl2Bpk86KmwKvs_z83p5ZADlBaz9LwRk",
  authDomain: "upperreggae.firebaseapp.com",
  projectId: "upperreggae",
  storageBucket: "upperreggae.appspot.com",
  messagingSenderId: "497063452237",
  appId: "1:497063452237:web:9b80a71d703be95fab8604",
  measurementId: "G-X8P30NJSGN",
};

// Mock rating data - different ratings for variety
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

// Initialize Firebase
function initializeFirebase() {
  if (getApps().length === 0) {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app, 'appdb');
    
    // If using emulator, uncomment:
    // if (process.env.FIRESTORE_EMULATOR_HOST) {
    //   connectFirestoreEmulator(db, 'localhost', 8080);
    // }
    
    return db;
  }
  return getFirestore(getApps()[0], 'appdb');
}

async function addMockRatingsToItems(itemIds?: string[]): Promise<number> {
  const db = initializeFirebase();
  const ITEMS_PATH = 'items';

  try {
    let items: Array<{ id: string }> = [];

    if (itemIds && itemIds.length > 0) {
      items = itemIds.map((id) => ({ id }));
    } else {
      const itemsSnapshot = await getDocs(collection(db, ITEMS_PATH));
      items = itemsSnapshot.docs.map((doc) => ({ id: doc.id }));
    }

    if (items.length === 0) {
      console.warn('⚠️  No items found to update with mock ratings');
      return 0;
    }

    let updated = 0;
    let ratingIndex = 0;

    for (const item of items) {
      if (!item.id) continue;

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
        console.log(`  ✅ Item ${item.id}: ${mockRating.avg} ⭐ (${mockRating.count} reviews)`);
      } catch (error: any) {
        console.error(`  ❌ Failed to update item ${item.id}:`, error.message);
      }
    }

    return updated;
  } catch (error: any) {
    console.error('❌ Error adding mock ratings:', error.message);
    throw error;
  }
}

async function clearRatingsFromItems(itemIds?: string[]): Promise<number> {
  const db = initializeFirebase();
  const ITEMS_PATH = 'items';

  try {
    let items: Array<{ id: string }> = [];

    if (itemIds && itemIds.length > 0) {
      items = itemIds.map((id) => ({ id }));
    } else {
      const itemsSnapshot = await getDocs(collection(db, ITEMS_PATH));
      items = itemsSnapshot.docs.map((doc) => ({ id: doc.id }));
    }

    if (items.length === 0) {
      console.warn('⚠️  No items found to clear ratings');
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
        console.log(`  ✅ Cleared ratings for item ${item.id}`);
      } catch (error: any) {
        console.error(`  ❌ Failed to reset item ${item.id}:`, error.message);
      }
    }

    return reset;
  } catch (error: any) {
    console.error('❌ Error clearing ratings:', error.message);
    throw error;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const shouldClear = args.includes('--clear') || args.includes('-c');

  try {
    console.log('🔥 Initializing Firebase...');
    
    if (shouldClear) {
      console.log('🧹 Clearing all ratings from items...\n');
      const cleared = await clearRatingsFromItems();
      console.log(`\n✅ Done! Cleared ratings from ${cleared} items`);
    } else {
      console.log('⭐ Adding mock ratings to items...\n');
      const updated = await addMockRatingsToItems();
      console.log(`\n✅ Done! Added mock ratings to ${updated} items`);
      console.log('\n💡 Tip: Run with --clear to reset all ratings');
    }
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'permission-denied') {
      console.error('\n💡 Authentication required. You may need to:');
      console.error('   1. Login via Firebase CLI: firebase login');
      console.error('   2. Or use the Firebase emulator');
      console.error('   3. Or ensure Firestore rules allow writes');
    }
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
main();
