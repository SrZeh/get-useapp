# Service Layer Organization

This document describes the service layer organization patterns in Get-UseApp and explains the architectural decisions.

## Current Structure

```
/services
  /interfaces          # Service interface definitions (contracts)
    - IItemService.ts
    - IItemReader.ts
    - IItemWriter.ts
    - IReservationService.ts
    - IReviewService.ts
    - INavigationService.ts
    - index.ts          # Barrel export
  
  /implementations     # Concrete service implementations
    - FirebaseItemService.ts
    - FirebaseReservationService.ts
    - FirebaseReviewService.ts
    - ExpoRouterNavigationService.ts
    - index.ts          # Barrel export
  
  /items               # Item feature services
    - ItemReader.ts
    - ItemWriter.ts
    - ItemBuilder.ts
    - ItemNormalizer.ts
    - ItemRestClient.ts
    - index.ts          # Barrel export
  
  /reservations        # Reservation feature services
    - ReservationService.ts
    - ReservationRules.ts
    - index.ts          # Barrel export
  
  /reviews             # Review feature services
    - ReviewService.ts
    - index.ts          # Barrel export
  
  /images              # Image services
    - ImageUploadService.ts
    - index.ts
  
  /stripe              # Stripe payment services
    - StripeOnboardingService.ts
    - index.ts
  
  - auth.ts            # Authentication service
  - cloudFunctions.ts  # Firebase Cloud Functions client
  - profile.ts         # Profile service
  - uploadImage.ts     # Legacy image upload (deprecated?)
  - index.ts           # Root barrel export
```

## Organizational Patterns

### 1. Interface Segregation Pattern

Services follow the **Interface Segregation Principle** (SOLID):

- **Interfaces** (`/services/interfaces/`) define contracts
- **Implementations** (`/services/implementations/`) provide concrete implementations
- Services are injected via dependency injection (see `ServicesProvider`)

**Benefits:**
- Easy to swap implementations (testing, mocking)
- Clear separation of concerns
- Follows Dependency Inversion Principle

### 2. Feature-Based Organization

Feature-specific services are organized by domain:

- `/services/items/` - All item-related services
- `/services/reservations/` - All reservation-related services  
- `/services/reviews/` - All review-related services

Each feature folder contains:
- Service implementations (e.g., `ItemReader`, `ItemWriter`)
- Business logic utilities (e.g., `ReservationRules`)
- Feature-specific helpers (e.g., `ItemNormalizer`, `ItemBuilder`)
- Barrel exports (`index.ts` Botton export)

**Benefits:**
- Easy to find feature-related services
- Clear feature boundaries
- Maintainable and discoverable

### 3. Cross-Cutting Services

Some services don't belong to a specific feature:

- `/services/images/` - Image upload/processing (used across features)
- `/services/stripe/` - Payment processing (used in reservations)
- `cloudFunctions.ts` - Firebase Functions client (used across features)
- `auth.ts` - Authentication (used everywhere)

These stay at the root or in their own folders.

## Evaluation: `services/features/` Pattern

### Proposed Structure

```
/services
  /features
    /items
    /reservations
    /reviews
  /interfaces
  /implementations
```

### Analysis

**Pros:**
- Consistent with `/components/features/` and `/hooks/features/` patterns
- Clear separation between feature and cross-cutting services

**Cons:**
- Adds an extra nesting level without significant benefit
- Current structure already clearly organizes by feature
- Imports become longer: `@/services/features/items` vs `@/services/items`
- No ambiguity - current structure is already clear

**Current Structure is Already Feature-Based:**

The current structure already follows feature-based organization:
- Feature services are in dedicated folders (`/items`, `/reservations`, `/reviews`)
- Cross-cutting services are separate (`/images`, `/stripe`, root level)
- Interfaces and implementations are clearly separated

## Decision: Keep Current Structure

**Rationale:**
1. **Already well-organized** - Services are grouped by feature
2. **Clear and discoverable** - Easy to find feature-specific services
3. **No nesting overhead** - Direct feature folders are clearer than `/features/` wrapper
4. **Consistent with imports** - Matches how services are imported in codebase
5. **SOLID principles** - Interface/implementation separation is already excellent

The `services/features/` pattern would add unnecessary nesting without improving discoverability or maintainability.

## Service Usage Patterns

### Importing Services

```typescript
// ✅ Feature services from feature folders
import { safeListItems, safeGetItem } from '@/services/items';
import { ReservationService } from '@/services/reservations';
import { ReviewService } from '@/services/reviews';

// ✅ Interfaces for dependency injection
import type { IItemService, IReservationService } from '@/services/interfaces';

// ✅ Implementations
import { FirebaseItemService } from '@/services/implementations';

// ✅ Cross-cutting services
import { uploadUserImageFromUri } from '@/services/images';
import { syncStripeAccount } from '@/services/stripe';
```

### Dependency Injection

Services are provided via `ServicesProvider`:

```typescript
// providers/ServicesProvider.tsx
export function useItemService(): IItemService {
  return firebaseItemService; // Can be swapped for testing
}

export function useReservationService(): IReservationService {
  return firebaseReservationService;
}
```

## Guidelines

### ✅ Do

1. **Organize by feature** - Group related services in feature folders
2. **Use interfaces** - Define contracts in `/services/interfaces/`
3. **Separate implementations** - Put concrete implementations in `/services/implementations/`
4. **Create barrel exports** - Each feature folder should have `index.ts`
5. **Keep cross-cutting services separate** - Images, auth, etc. don't need feature folders

### ❌ Don't

1. **Don't mix interfaces with implementations** - Keep them separate
2. **Don't create feature folders for single services** - Only if there are multiple related services
3. **Don't duplicate services** - One service per feature domain
4. **Don't bypass interfaces** - Use dependency injection, not direct imports of implementations

## Future Considerations

If the service layer grows significantly:

1. **When to add `services/features/` wrapper:**
   - If we have 10+ suitability features
   - If cross-cutting services become ambiguous
   - If we need sub-features (e.g., `features/items/listing`, `features/items/management`)

2. **When to split services:**
   - Service files exceed 500 lines
   - Service has multiple responsibilities
   - Service becomes hard to test

For now, the current structure is optimal and follows best practices.

---

**Last Updated:** 2025  
**Status:** Current structure is well-organized and maintainable

