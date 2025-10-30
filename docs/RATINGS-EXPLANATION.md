# Item Ratings Explanation

## Where Ratings Come From

Item ratings (`ratingAvg`, `ratingCount`, `ratingSum`) are automatically calculated and stored on the **item document itself** when reviews are created.

### Flow:

1. **User creates a review** for an item (after completing a reservation)
   - Review is stored in: `items/{itemId}/reviews/{reviewId}`
   
2. **Firestore Trigger** (`functions/src/index.ts::onItemReviewCreated`)
   - Automatically fires when a review document is created
   - Calculates new average: `ratingAvg = ratingSum / ratingCount`
   - Updates the item document with:
     - `ratingAvg` (average rating, e.g., 4.5)
     - `ratingCount` (number of reviews, e.g., 12)
     - `ratingSum` (sum of all ratings, e.g., 54)
     - `lastReviewSnippet` (latest review text)

3. **ItemCard displays ratings**
   - Reads `item.ratingAvg` and `item.ratingCount` directly from the item document
   - Shows stars based on `ratingAvg`
   - Shows count: "(12)" next to stars

### Location in Code:

- **Rating calculation**: `functions/src/index.ts` lines 1132-1192
- **Rating display**: `components/features/items/ItemCard.tsx` lines 130-141
- **Rating aggregation**: `services/items/ItemWriter.ts::safeBumpRating` (client-side fallback)

## Adding Mock Ratings for Testing

To add mock ratings to items for testing purposes, you have a few options:

### Option 1: Using the Script (requires Firebase CLI authentication)

```bash
# First authenticate with Firebase
firebase login

# Add mock ratings to all items
npx tsx scripts/addMockRatings.ts

# Clear all ratings
npx tsx scripts/addMockRatings.ts --clear
```

**Note**: The script requires Firestore write permissions. If you get permission errors:
- Make sure your Firestore rules allow writes for development
- Or use the Firebase emulator
- Or use Option 2 below (in-app utility)

### Option 2: Using the Utility Functions

```typescript
import { addMockRatingsToItems, clearRatingsFromItems } from '@/utils/mockRatings';

// Add mock ratings to all items
await addMockRatingsToItems();

// Add mock ratings to specific items
await addMockRatingsToItems(['item-id-1', 'item-id-2']);

// Clear all ratings
await clearRatingsFromItems();

// Clear ratings from specific items
await clearRatingsFromItems(['item-id-1', 'item-id-2']);
```

### Mock Rating Values

The utility cycles through these mock ratings:
- 5.0 ⭐ (12 reviews) - Excellent item
- 4.5 ⭐ (8 reviews) - Very good
- 4.0 ⭐ (15 reviews) - Good
- 3.5 ⭐ (6 reviews) - Above average
- 3.0 ⭐ (4 reviews) - Average
- 4.8 ⭐ (20 reviews) - Popular item
- 4.2 ⭐ (10 reviews) - Good with some issues
- 5.0 ⭐ (3 reviews) - New item, perfect score
- 2.5 ⭐ (2 reviews) - Poor (rare)
- 4.6 ⭐ (7 reviews) - Great item

## Important Notes

⚠️ **Development Only**: Mock ratings are for testing purposes only. In production, ratings should only come from actual user reviews.

⚠️ **Data Structure**: Ratings are stored directly on the item document, not in a subcollection. This allows for fast queries without joins.

⚠️ **Real Reviews**: To create real ratings, users must:
1. Complete a reservation
2. Return the item
3. Leave a review with a rating (1-5 stars)

The Firestore trigger will automatically update the item's rating fields.

