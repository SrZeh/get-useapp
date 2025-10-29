# Open/Closed Principle (OCP) Implementation

This document describes the OCP implementation with dependency injection in the codebase.

## Overview

The Open/Closed Principle states that software entities should be **open for extension but closed for modification**. We've implemented this through:

1. **Service Interfaces** - Define contracts without implementation
2. **Dependency Injection** - Inject services via React Context
3. **Component Extensibility** - Make components extensible via render props

## Architecture

### Service Layer Structure

```
services/
├── interfaces/              # Service contracts (abstract)
│   ├── IItemService.ts
│   ├── IReservationService.ts
│   ├── IReviewService.ts
│   └── index.ts
├── implementations/         # Concrete implementations
│   ├── FirebaseItemService.ts
│   ├── FirebaseReservationService.ts
│   ├── FirebaseReviewService.ts
│   └── index.ts
└── index.ts                 # Exports interfaces + implementations
```

### Dependency Injection Provider

```typescript
// providers/ServicesProvider.tsx
<ServicesProvider>
  <App />
</ServicesProvider>
```

Provides services via React Context:
- `useServices()` - Get all services
- `useItemService()` - Get item service
- `useReservationService()` - Get reservation service
- `useReviewService()` - Get review service

## Usage Examples

### Production Use (Default)

```tsx
// app/_layout.tsx
<ServicesProvider>
  <App />
</ServicesProvider>

// In components
function MyComponent() {
  const reservationService = useReservationService();
  
  const handleCreate = async () => {
    await reservationService.createReservation(data);
  };
}
```

### Testing Use (Mock Services)

```tsx
const mockReservationService: IReservationService = {
  createReservation: jest.fn(),
  getReservation: jest.fn(),
  // ... other methods
};

<ServicesProvider services={{ reservationService: mockReservationService }}>
  <ComponentUnderTest />
</ServicesProvider>
```

### Custom Implementation

```tsx
class CustomItemService implements IItemService {
  async createItem(input: NewItemInput) {
    // Custom implementation (e.g., API, GraphQL, etc.)
  }
  // ... implement all interface methods
}

<ServicesProvider services={{ itemService: new CustomItemService() }}>
  <App />
</ServicesProvider>
```

## Updated Components

The following components now use services from context:

1. **OwnerInbox** (`app/(tabs)/transactions/_components/OwnerInbox.tsx`)
   - Uses `useReservationService()` for all reservation operations
   - Methods: `subscribeToOwnerReservations()`, `acceptReservation()`, `rejectReservation()`, `deleteReservation()`

2. **MyReservations** (`app/(tabs)/transactions/_components/MyReservations.tsx`)
   - Uses `useReservationService()` for subscription and deletion
   - Methods: `subscribeToRenterReservations()`, `deleteReservation()`

3. **ItemDetailScreen** (`app/item/[id].tsx`)
   - Uses `useReservationService()` for reservation creation and listing
   - Uses `useReviewService()` for review operations
   - Methods: `createReservation()`, `listEligibleReservationsForReview()`, `createItemReview()`, `subscribeToItemReviews()`, `validateReviewInput()`

## Benefits

### 1. Testability
- Easy to mock services for unit/integration tests
- No need to mock Firebase directly
- Components testable in isolation

### 2. Flexibility
- Swap implementations without modifying components
- Easy to add new service implementations (e.g., GraphQL, REST API)
- Support multiple backends simultaneously

### 3. Maintainability
- Single source of truth for service contracts
- Clear separation between interfaces and implementations
- Type-safe service usage

### 4. Open/Closed Principle
- ✅ **Open for Extension**: Can add new implementations without modifying components
- ✅ **Closed for Modification**: Components depend on interfaces, not implementations

### 5. Dependency Inversion Principle
- ✅ Components depend on abstractions (interfaces)
- ✅ High-level modules don't depend on low-level modules
- ✅ Both depend on abstractions

## Service Interface Examples

### IReservationService

```typescript
interface IReservationService {
  createReservation(input: NewReservationInput): Promise<string>;
  getReservation(id: string): Promise<Reservation | null>;
  listOwnerReservations(ownerUid: string): Promise<Reservation[]>;
  subscribeToOwnerReservations(...): Unsubscribe;
  acceptReservation(id: string, ownerUid: string): Promise<void>;
  // ... more methods
}
```

### IReviewService

```typescript
interface IReviewService {
  createItemReview(itemId: string, input: NewReviewInput): Promise<string>;
  subscribeToItemReviews(...): Unsubscribe;
  validateReviewInput(input: Partial<NewReviewInput>): ReviewValidationResult;
  // ... more methods
}
```

## Migration Guide

### Before (Direct Import)

```typescript
import { createReservation } from '@/services/reservations';

function Component() {
  const handleCreate = async () => {
    await createReservation(data);
  };
}
```

### After (Dependency Injection)

```typescript
import { useReservationService } from '@/providers/ServicesProvider';

function Component() {
  const reservationService = useReservationService();
  
  const handleCreate = async () => {
    await reservationService.createReservation(data);
  };
}
```

## Future Enhancements

1. **Service Factories** - Create services based on environment
2. **Service Middleware** - Add logging, caching, retry logic
3. **Service Composition** - Compose multiple services
4. **Service State Management** - Add service-level state management
5. **Service Monitoring** - Add telemetry and error tracking

## Testing Strategy

### Unit Tests

```typescript
describe('Component', () => {
  it('creates reservation', async () => {
    const mockService = {
      createReservation: jest.fn().mockResolvedValue('res-123')
    };
    
    render(
      <ServicesProvider services={{ reservationService: mockService }}>
        <Component />
      </ServicesProvider>
    );
    
    // Test component behavior with mocked service
  });
});
```

### Integration Tests

```typescript
// Use real Firebase implementation
render(
  <ServicesProvider>
    <Component />
  </ServicesProvider>
);
```

## Conclusion

The OCP implementation provides a robust, testable, and maintainable architecture that follows SOLID principles. Components are now decoupled from specific implementations, making the codebase more flexible and easier to test.

