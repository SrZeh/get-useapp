# Routing Patterns & Guidelines

This document outlines the routing patterns used in Get-UseApp and provides guidelines for when to use route layouts vs component composition.

## Current Route Structure

### Route Organization

```
/app
  /(auth)              # Auth route group (login, register, verification)
  /(tabs)              # Tab navigation group (home, items, transactions)
    /_layout.tsx       # Tab layout with shared header/navigation
  /item
    /[id].tsx          # Item detail view
    /new.tsx           # Create new item
    /edit/[id].tsx     # Edit existing item
  /profile
    /index.tsx         # Profile view
    /edit.tsx          # Edit profile
    /reviews.tsx       # User reviews
  /transaction
    /[id]
      /chat.tsx        # Transaction chat
      /pay.tsx         # Payment flow
      /return.tsx      # Return item
    /request/[itemId].tsx  # Request reservation
  /reservations/[resId].tsx  # Reservation detail
  /review/[transactionId].tsx  # Review submission
  /chat/[id].tsx       # Chat detail
```

## Route Layout Pattern

### When to Use Route Layouts (`_layout.tsx`)

Route layouts are beneficial when routes in a group share:

1. **Common authentication checks**
   ```typescript
   // app/profile/_layout.tsx
   // Would check auth and redirect if not logged in
   ```

2. **Shared header/navigation structure**
   ```typescript
   // app/(tabs)/_layout.tsx - Already implemented
   // Shared header with logo, title, auth actions
   ```

3. **Common data fetching/loading**
   ```typescript
   // Would fetch shared data for all routes in group
   ```

4. **Persistent UI elements**
   ```typescript
   // Shared sidebars, navigation drawers, etc.
   ```

### When NOT to Use Route Layouts

Avoid route layouts when:

1. **Routes are functionally independent** - Each route has its own purpose and behavior
   - ✅ Current item routes (`[id]`, `new`, `edit`) - each is independent
   - ✅ Current profile routes (`index`, `edit`, `reviews`) - each is independent

2. **Common behavior is better handled in components** - Use component composition instead
   - ✅ Loading states - handled in individual components
   - ✅ Error handling - handled in components or error boundaries
   - ✅ Auth checks - handled in components or route guards

3. **Routes don't share navigation patterns** - Different back behaviors, headers, etc.
   - ✅ Item routes have different navigation needs
   - ✅ Profile routes have different UI requirements

## Current Implementation Approach

### Component Composition Over Route Layouts

Our routes follow the **thin route pattern** where routes are minimal wrappers that compose feature components:

```typescript
// ✅ Good: Thin route, delegates to components
// app/(tabs)/transactions.tsx
export default function TransactionsScreen() {
  return <TransactionsTabs />; // From components/features/transactions
}
```

This approach:
- Keeps routes simple and focused
- Makes components reusable and testable
- Allows flexible composition
- Avoids unnecessary layout nesting

### Transaction Actions Pattern

Transaction actions (accept, reject, pay, return) are handled via **components and callbacks**, not separate routes:

```typescript
// ✅ Good: Actions in components
// components/features/transactions/OwnerInbox.tsx
const accept = async (id: string) => {
  await reservationService.acceptReservation(id, uid);
};
// ...
<OwnerReservationActions
  reservation={reservation}
  onAccept={accept}
  onReject={reject}
/>
```

This pattern:
- Keeps actions close to where they're displayed
- Avoids unnecessary route navigation
- Provides better UX (no page transitions for simple actions)
- Maintains state in the parent component

### Navigation Paths

Use consistent navigation paths:

```typescript
// Item routes
router.push('/item/new')
router.push(`/item/${itemId}`)
router.push(`/item/edit/${itemId}`)

// Profile routes
router.push('/profile')
router.push('/profile/edit')
router.push('/profile/reviews')

// Transaction routes
router.push(`/transaction/${transactionId}/chat`)
router.push(`/transaction/${transactionId}/pay`)
router.push(`/transaction/request/${itemId}`)
```

## Route Groups

### When to Use Route Groups `(group-name)`

Route groups organize routes without affecting URLs:

1. **Logical grouping without URL change**
   - ✅ `(auth)` - All auth-related routes grouped together
   - ✅ `(tabs)` - Tab navigation routes grouped together

2. **Different layout requirements**
   - ✅ `(tabs)` uses `Tabs` layout
   - ✅ `(auth)` routes don't use tabs

3. **URL segment organization**
   - Considered but not needed for transactions (current flat structure is clearer)

### Transaction Route Grouping (Deferred)

While route groups could organize transaction routes:

```
/transaction
  /(manage)      # Owner actions
  /(request)     # Renter actions
```

The **current flat structure is preferred** because:
- Routes are discoverable and clear
- URLs are simpler: `/transaction/[id]/pay` vs `/transaction/(manage)/[id]/pay`
- Navigation paths are more intuitive
- Less nesting complexity

**Decision:** Keep current flat structure for transactions.

## Guidelines Summary

### ✅ Do

1. Use route layouts when routes share common behavior (auth, header, navigation)
2. Keep routes thin - delegate to feature components
3. Use route groups for logical organization without URL changes
4. Handle actions in components via callbacks when appropriate
5. Use consistent navigation path patterns

### ❌ Don't

1. Create layouts for routes that don't share behavior
2. Add route groups just for folder organization (they don't affect URLs but add complexity)
3. Create separate routes for simple actions (use component callbacks)
4. Duplicate navigation logic in multiple routes (extract to components/services)

## Future Considerations

If the app grows and needs:

- **Shared auth guards** for item/profile routes → Consider route layouts
- **Complex multi-step flows** → Consider dedicated route groups
- **Shared context providers** → Consider route layouts with context providers
- **Persistent navigation** → Consider route layouts with navigation drawers

For now, the current component composition approach is optimal for maintainability and flexibility.

---

**Last Updated:** 2025  
**Status:** Current structure is adequate and well-organized

