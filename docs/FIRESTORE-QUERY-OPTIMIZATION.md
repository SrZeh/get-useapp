# Firestore Query Optimization with Zustand

## Overview

This document describes the Firestore query optimization implementation using Zustand for global state management and caching. The goal is to minimize redundant Firestore queries and share real-time listeners across components.

## Problem Statement

Before optimization, the app had several issues:
- **Duplicate queries**: Multiple components fetching the same data independently
- **No caching**: Every component/hook fetched data fresh from Firestore
- **Redundant listeners**: Multiple `onSnapshot` listeners for the same data
- **Inefficient pending transactions**: 3 separate queries instead of optimized approach

## Solution Architecture

### Zustand Stores

Three main Zustand stores were created to manage and cache Firestore data:

1. **Items Store** (`stores/itemsStore.ts`)
   - Caches items by ID (5-minute TTL)
   - Shares single real-time listener for user items
   - Caches list queries (2-minute TTL)
   - Optimizes item detail fetches

2. **User Profile Store** (`stores/userProfileStore.ts`)
   - Caches user profiles by UID (5-minute TTL)
   - Shares single real-time listener for current user
   - Avoids duplicate profile fetches

3. **Transactions Store** (`stores/transactionsStore.ts`)
   - Caches transactions/reservations by ID (3-minute TTL)
   - Shares single real-time listener for user transactions
   - Optimized pending transactions (2 queries instead of 3)

## Key Optimizations

### 1. Shared Real-Time Listeners

**Before**: Each component created its own `onSnapshot` listener
```typescript
// ❌ Bad: Multiple listeners for same data
useEffect(() => {
  const unsub = onSnapshot(q, callback);
  return () => unsub();
}, []);
```

**After**: Store manages a single listener shared across components
```typescript
// ✅ Good: Single listener managed by store
useEffect(() => {
  subscribeToUserItems(); // Store ensures only one listener exists
}, []);
```

### 2. Cache-First Strategy

**Before**: Always queried Firestore
```typescript
// ❌ Bad: Always fetches from Firestore
const item = await getDoc(doc(db, 'items', id));
```

**After**: Checks cache first, queries Firestore only if needed
```typescript
// ✅ Good: Checks cache first
const item = await getItem(id); // Checks cache with 5-minute TTL
```

### 3. Optimized Pending Transactions

**Before**: 3 separate queries
```typescript
// ❌ Bad: 3 separate listeners
onSnapshot(qOwner, callback1);
onSnapshot(qRenterToPay, callback2);
onSnapshot(qRenterToPickup, callback3);
```

**After**: 2 optimized queries
```typescript
// ✅ Good: 2 queries with shared logic
onSnapshot(qOwner, callback);      // Owner pending
onSnapshot(qRenter, callback);      // Renter pending (accepted OR paid)
```

## Refactored Hooks

### Items Hooks

- **`useUserItems`**: Now uses `itemsStore` instead of direct Firestore queries
- **`useItemDetail`**: Checks cache first via `itemsStore.getItem()`
- **`useItemOperations`**: Invalidates cache after mutations

### Profile Hooks

- **`useProfileData`**: Now uses `userProfileStore` instead of direct queries

### Transaction Hooks

- **`usePendingTransactions`**: Now uses `transactionsStore` instead of 3 separate queries

## Cache Invalidation

Cache is invalidated in these scenarios:
- After item mutations (create, update, delete)
- After user profile updates
- Manual refresh actions
- TTL expiration (automatic)

## Performance Impact

### Query Reduction

- **User Items**: Reduced from N queries (one per component) to 1 shared listener
- **User Profile**: Reduced from N queries to 1 shared listener
- **Pending Transactions**: Reduced from 3 queries to 2 optimized queries
- **Item Details**: Cached for 5 minutes, reducing redundant fetches

### Estimated Savings

Assuming a typical app session:
- **Before**: ~20-30 Firestore queries on app load
- **After**: ~5-8 Firestore queries on app load (mostly shared listeners)
- **Query reduction**: ~60-75% fewer Firestore reads

## Usage Examples

### Using Items Store

```typescript
// In a component
import { useItemsStore } from '@/stores/itemsStore';

function MyComponent() {
  const items = useItemsStore((state) => state.userItems);
  const loading = useItemsStore((state) => state.userItemsLoading);
  const subscribeToUserItems = useItemsStore((state) => state.subscribeToUserItems);
  
  useEffect(() => {
    subscribeToUserItems(); // Shares listener with other components
  }, []);
  
  // Or use the hook
  const { items, loading } = useUserItems(); // Already optimized
}
```

### Cache Invalidation After Mutations

```typescript
import { useItemsStore } from '@/stores/itemsStore';

function updateItem(itemId: string) {
  const invalidateItem = useItemsStore((state) => state.invalidateItem);
  const setItem = useItemsStore((state) => state.setItem);
  
  await updateDoc(doc(db, 'items', itemId), data);
  setItem(updatedItem); // Update cache
  invalidateItem(itemId); // Force refetch on next access
}
```

## Best Practices

1. **Always use hooks**: Prefer existing hooks over direct store access when possible
2. **Cache invalidation**: Always invalidate cache after mutations
3. **TTL consideration**: Cache TTLs are designed for typical usage patterns
4. **Listeners**: Don't manually unsubscribe - store manages lifecycle
5. **Force refresh**: Use `forceRefresh` parameter when you need fresh data

## Future Enhancements

Potential further optimizations:
- [ ] Add pagination caching
- [ ] Implement query deduplication (same query running simultaneously)
- [ ] Add offline persistence
- [ ] Implement background sync
- [ ] Add query result compression for large datasets

## Files Modified

### New Files
- `stores/index.ts` - Barrel export
- `stores/itemsStore.ts` - Items state management
- `stores/userProfileStore.ts` - User profile state management
- `stores/transactionsStore.ts` - Transactions state management
- `docs/FIRESTORE-QUERY-OPTIMIZATION.md` - This document

### Modified Files
- `hooks/features/items/useUserItems.ts` - Now uses itemsStore
- `hooks/features/items/useItemDetail.ts` - Now uses itemsStore cache
- `hooks/features/items/useItemOperations.ts` - Invalidates cache after mutations
- `hooks/features/profile/useProfileData.ts` - Now uses userProfileStore
- `hooks/features/transactions/usePendingTransactions.ts` - Now uses transactionsStore

## Testing Recommendations

When testing the optimizations:
1. Monitor Firestore query count in Firebase Console
2. Verify cache invalidation works after mutations
3. Test multiple components accessing same data (should share listeners)
4. Verify cache TTL expiration works correctly
5. Test offline scenarios (cache should still work)

## Conclusion

The Zustand-based optimization significantly reduces Firestore queries by:
- Sharing real-time listeners across components
- Implementing intelligent caching with TTL
- Optimizing query patterns (e.g., pending transactions)
- Centralizing state management for better performance

This results in faster app performance, reduced Firebase costs, and better user experience.

