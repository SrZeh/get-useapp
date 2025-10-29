# Codebase Improvements TODO

This document tracks code quality improvements, refactoring tasks, and enhancements to make the codebase more maintainable and AI-friendly.

## 📋 TypeScript & Type Safety

### High Priority
- [x] **Remove all `any` types** - COMPLETED for app code (remaining: Firebase Cloud Functions only)
  - [x] Replace `any` in `services/items.ts` (4 instances)
  - [ ] Replace `any` in Firebase Cloud Functions (`functions/src/index.ts` - 38+ instances)
  - [x] Replace `any` in transaction hooks (`src/hooks/useTransactionActions.ts`)
  - [x] Replace `any` in app screens - Completed: transactions, items, profile, item detail, reservations, login
  - [x] Replace `any` in remaining screens: register, verify-email, verify-phone, chat, transaction flows, item/edit, review screens, profile screens - COMPLETED
  - [x] Replace `any` in components: ScrollableCategories, ResponsiveGrid, LiquidGlassView, AuthHeaderRight, TabIcon, CoachmarkOverlay
  - [x] Replace `any` in hooks: useOnboarding, useTermsAccepted
  - [x] Replace `any` in lib: auth.web.ts, auth.native.ts
  - [x] Create proper type definitions for Firestore documents
  - [x] Add type guards for runtime type checking

- [x] **Create centralized type definitions**
  - [x] Create `types/item.ts` for Item-related types (consolidated from multiple files)
  - [x] Create `types/transaction.ts` for Transaction types
  - [x] Create `types/reservation.ts` for Reservation types
  - [x] Create `types/user.ts` for User profile types
  - [x] Create `types/review.ts` for Review types
  - [x] Create `types/errors.ts` for Error types
  - [x] Create `types/firestore.ts` for Firestore utilities
  - [x] Export types from a central `types/index.ts` barrel file

- [x] **Improve Firebase type safety**
  - [x] Create typed Firestore collection references (`collection<T>`) - Added `lib/firestore-helpers.ts` with typed collections
  - [x] Add type-safe document converters (FirestoreDataConverter) - Created converters for Item, Reservation, Transaction, UserProfile, Review
  - [ ] Type all Firestore queries properly - Foundation ready, migration to typed collections is optional
  - [x] Create type guards for Firestore document data validation - Added in `types/firestore.ts`

### Medium Priority
- [x] **Add strict null checks** - `strict: true` enabled in `tsconfig.json`
- [ ] **Create type utilities** - Add utility types for Partial, Required, Pick where needed
- [x] **Type function parameters** - Most function parameters explicitly typed (work in progress)
- [x] **Add return type annotations** - Added to most new/modified functions

## 🛡️ Error Handling & Resilience

### High Priority
- [x] **Replace console.log/error with proper logging**
  - [x] Replace `console.log` with structured logging utility - Migrated all app code (excluding functions and scripts)
  - [x] Create `utils/logger.ts` with log levels (debug, info, warn, error)
  - [x] Add environment-based logging (suppress debug in production)
  - [x] Integrate logger in hooks (useTransactionsDot, useUnreadMessages updated)
  - [x] Integrate logger in utilities (upload.ts updated)
  - [x] Integrate logger in app screens (index, items, transactions, item detail, new item, register, verify-email)
  - [x] Integrate logger in components (TransactionCard, WebStyles, ThemeProvider)
  - [ ] Implement error reporting to monitoring service (Sentry, etc.) - Hook ready for integration

- [x] **Create Error Boundary components**
  - [x] Create `components/ErrorBoundary.tsx` for React error boundaries
  - [x] Wrap critical app sections with error boundaries - App wrapped, ready for section-specific boundaries
  - [x] Add user-friendly error messages
  - [x] Implement error recovery mechanisms

- [x] **Improve async error handling**
  - [x] Create consistent error handling pattern for all async operations
  - [x] Add proper error types (e.g., `NetworkError`, `ValidationError`, `AuthError`)
  - [ ] Implement retry logic for network operations - Foundation ready
  - [x] Add error recovery UI patterns

- [x] **Standardize error messages**
  - [x] Create `constants/errors.ts` with user-facing error messages
  - [x] Add error code constants
  - [x] Localize error messages (prepare for i18n) - Structure ready, needs translation integration

### Medium Priority
- [x] **Add input validation utilities**
  - [x] Create `utils/validation.ts` with validation functions
  - [x] Add Zod for runtime schema validation
  - [ ] Validate all user inputs before API calls - Schemas ready for integration

## 🏗️ Code Organization & Structure

### High Priority
- [x] **Consolidate duplicate code**
  - [x] Extract duplicate `Item` type definitions into `types/item.ts`
  - [x] Extract shared utility functions: `formatBRL`, `shuffle` → `utils/formatters.ts`
  - [x] Extract rating utilities: `calcAvg`, `renderStars` → `utils/ratings.ts`
  - [x] Merge duplicate hooks (e.g., `useTransactionsDot.ts` - removed from `/src/hooks`)
  - [x] Merge duplicate upload utilities (removed duplicate from `/src/utils`)

- [x] **Organize service layer**
  - [x] Review and organize `services/` directory structure - Consolidated duplicate cloud function helpers
  - [x] Created centralized `callCloudFunction` helper in `services/cloudFunctions.ts`
  - [x] Consolidated all Cloud Function calls from app screens into service functions
  - [x] Removed duplicate `callFn` helpers from app screens (pay.tsx, return.tsx, transactions.tsx, reservations/[resId].tsx)
  - [ ] Split large service files into smaller, focused modules - Partial (items.ts could be split)
  - [ ] Create service interfaces for better testability - Future work
  - [ ] Add dependency injection pattern for services - Future work

- [ ] **Improve component organization**
  - [ ] Break down large components (>200 lines) into smaller components
  - [ ] Extract complex logic from components into custom hooks
  - [ ] Create reusable form components (TextInput, Button, etc.)
  - [ ] Standardize component prop interfaces

### Medium Priority
- [ ] **Create constants file for magic numbers/strings**
  - [x] Move error messages to `constants/errors.ts`
  - [ ] Move hardcoded values to `constants/`
  - [ ] Create `constants/api.ts` for API endpoints
  - [ ] Create `constants/validation.ts` for validation rules (validation rules exist in `utils/validation.ts`)

- [x] **Improve file structure**
  - [x] Review and consolidate `/src` vs root-level directories - Merged duplicate hooks and upload utilities
  - [x] Ensure consistent export patterns (named vs default exports) - Types use named exports via barrel file
  - [x] Add index files for cleaner imports - `types/index.ts` barrel file created
  - [ ] Add index files for other directories (utils, services, components)

## 🧪 Testing Infrastructure

### High Priority
- [ ] **Set up testing framework**
  - [ ] Install and configure Jest for React Native
  - [ ] Set up React Native Testing Library
  - [ ] Configure test environment and mocks
  - [ ] Add test coverage reporting

- [ ] **Write unit tests**
  - [ ] Test utility functions (`utils/`)
  - [ ] Test custom hooks (`hooks/`, `src/hooks/`)
  - [ ] Test service functions (`services/`)
  - [ ] Test validation logic

- [ ] **Write component tests**
  - [ ] Test core UI components (`components/`)
  - [ ] Test screen components (`app/`)
  - [ ] Test form components
  - [ ] Test navigation flows

- [ ] **Write integration tests**
  - [ ] Test Firebase integration
  - [ ] Test authentication flows
  - [ ] Test transaction flows
  - [ ] Test payment integration

### Medium Priority
- [ ] **Add E2E testing**
  - [ ] Set up Detox or Maestro for E2E tests
  - [ ] Write critical user flow tests
  - [ ] Add CI/CD integration for E2E tests

## 📝 Documentation

### High Priority
- [ ] **Add JSDoc comments**
  - [ ] Document all exported functions and classes
  - [ ] Add parameter descriptions
  - [ ] Add return type descriptions
  - [ ] Add usage examples for complex functions

- [ ] **Improve code comments**
  - [ ] Add "why" comments for complex business logic
  - [ ] Document algorithm decisions
  - [ ] Explain non-obvious code patterns

- [ ] **Create architecture documentation**
  - [ ] Document data flow diagrams
  - [ ] Document component hierarchy
  - [ ] Document state management approach
  - [ ] Create API documentation

### Medium Priority
- [ ] **Update README.md**
  - [ ] Add more detailed setup instructions
  - [ ] Add development workflow guide
  - [ ] Add contribution guidelines
  - [ ] Add troubleshooting section

## ⚡ Performance Optimizations

### High Priority
- [ ] **Optimize image handling**
  - [ ] Ensure all images use `expo-image` instead of `react-native` Image
  - [ ] Add image optimization/compression before upload
  - [ ] Implement lazy loading for images
  - [ ] Add image caching strategy

- [ ] **Optimize list rendering**
  - [ ] Review FlatList implementations for optimal performance
  - [ ] Add `getItemLayout` where possible
  - [ ] Implement virtual scrolling optimizations
  - [ ] Add list item memoization (`React.memo`)

- [ ] **Optimize Firebase queries**
  - [ ] Add proper Firestore indexes
  - [ ] Review query complexity
  - [ ] Implement query result caching where appropriate
  - [ ] Add pagination limits and cursors

- [ ] **Optimize re-renders**
  - [ ] Add `React.memo` to expensive components
  - [ ] Review `useMemo` and `useCallback` usage
  - [ ] Identify unnecessary re-renders with React DevTools Profiler

### Medium Priority
- [ ] **Bundle size optimization**
  - [ ] Analyze bundle size
  - [ ] Remove unused dependencies
  - [ ] Implement code splitting where beneficial
  - [ ] Add tree shaking verification

## 🔒 Security Improvements

### High Priority
- [ ] **Secure sensitive data**
  - [ ] Review Firebase config exposure (`lib/firebase.ts`)
  - [ ] Move Firebase config to environment variables
  - [ ] Ensure no API keys are hardcoded
  - [ ] Review usage of `expo-secure-store` vs `AsyncStorage`

- [ ] **Improve input sanitization**
  - [ ] Sanitize all user inputs
  - [ ] Validate data on client and server
  - [ ] Prevent XSS in user-generated content
  - [ ] Add rate limiting for API calls

- [ ] **Review Firebase Security Rules**
  - [ ] Audit Firestore security rules (`firestore.appdb.rules`)
  - [ ] Add comprehensive rules for all collections
  - [ ] Test security rules
  - [ ] Document security rule logic

### Medium Priority
- [ ] **Add security headers**
  - [ ] Configure security headers for web
  - [ ] Review CORS settings
  - [ ] Add content security policy

## 🎨 UI/UX Improvements

### High Priority
- [ ] **Standardize styling**
  - [ ] Create reusable style components (Button, Card, Input, etc.)
  - [ ] Replace inline styles with NativeWind classes where possible
  - [ ] Ensure consistent spacing using design system tokens
  - [ ] Review dark mode implementation for all components

- [ ] **Improve accessibility**
  - [ ] Add accessibility labels to all interactive elements
  - [ ] Ensure proper semantic HTML on web
  - [ ] Add keyboard navigation support
  - [ ] Test with screen readers

### Medium Priority
- [ ] **Add loading states**
  - [ ] Ensure all async operations show loading indicators
  - [ ] Add skeleton screens for better perceived performance
  - [ ] Implement optimistic UI updates where appropriate

- [x] **Improve error UI**
  - [x] Create consistent error message components - ErrorBoundary component created
  - [x] Add retry mechanisms in error states - ErrorBoundary has retry/reload functionality
  - [ ] Improve empty state designs - Foundation ready

## 🤖 AI Enhancement & Developer Experience

### High Priority
- [x] **Add comprehensive TypeScript types for better AI understanding**
  - [x] Create detailed interfaces for all data structures - Item, Reservation, Transaction, User, Review types created
  - [ ] Add branded types for IDs (e.g., `type ItemId = string & { readonly __brand: 'ItemId' }`)
  - [x] Add type predicates for runtime type checking - isItem, isReservation, isTransaction, isUserProfile, isReview, isValidRating
  - [x] Document complex types with JSDoc - Types include JSDoc comments

- [x] **Improve code discoverability**
  - [x] Add index files for all major directories - `types/index.ts` barrel file created
  - [x] Use consistent naming conventions - Following project conventions
  - [x] Add clear file organization comments - Types, utils, and constants have clear documentation
  - [x] Document module purposes - JSDoc comments added to key modules

- [ ] **Create utility type helpers**
  - [ ] Create helper types for common patterns (e.g., `AsyncResult<T>`, `Maybe<T>`)
  - [ ] Add type utilities in `types/utils.ts` - Consider adding for common async patterns
  - [x] Document utility types with examples - Existing type utilities documented

- [ ] **Improve error context**
  - [ ] Add context to error messages (what operation failed, why)
  - [ ] Include relevant IDs in error messages
  - [ ] Add stack trace information in development

### Medium Priority
- [ ] **Add code examples**
  - [ ] Create example usage for complex hooks
  - [ ] Add example patterns in documentation
  - [ ] Create component usage examples

- [ ] **Improve naming clarity**
  - [ ] Review variable names for clarity
  - [ ] Ensure function names clearly describe their purpose
  - [ ] Use consistent naming patterns across codebase

## 🔧 Tooling & Developer Experience

### High Priority
- [ ] **Set up pre-commit hooks**
  - [ ] Add Husky for git hooks
  - [ ] Add lint-staged for pre-commit linting
  - [ ] Add format check on commit
  - [ ] Add type check on commit

- [ ] **Improve ESLint configuration**
  - [ ] Add more strict rules
  - [ ] Add custom rules for project conventions
  - [ ] Set up auto-fix on save
  - [ ] Add import sorting rules

- [ ] **Set up formatting**
  - [ ] Configure Prettier (if not already)
  - [ ] Add format script to package.json
  - [ ] Ensure consistent formatting across codebase

- [ ] **Set up CI/CD**
  - [ ] Add GitHub Actions or similar
  - [ ] Add automated testing in CI
  - [ ] Add automated linting in CI
  - [ ] Add automated type checking in CI

### Medium Priority
- [ ] **Add development tools**
  - [ ] Set up React DevTools
  - [ ] Add Redux DevTools if using state management
  - [ ] Add Firebase emulator setup
  - [ ] Create development scripts

## 📦 Dependencies & Maintenance

### High Priority
- [ ] **Review dependencies**
  - [ ] Audit dependencies for security vulnerabilities
  - [ ] Update outdated packages
  - [ ] Remove unused dependencies
  - [ ] Review peer dependencies

- [ ] **Add dependency management**
  - [ ] Set up Dependabot or similar
  - [ ] Add dependency update automation
  - [ ] Document dependency choices

### Medium Priority
- [ ] **Optimize dependencies**
  - [ ] Review large dependencies for alternatives
  - [ ] Consider tree-shaking compatibility
  - [ ] Review bundle impact of dependencies

## 🚀 Refactoring Opportunities

### High Priority
- [ ] **Refactor large files**
  - [ ] Split `functions/src/index.ts` (1143+ lines) into multiple files
  - [ ] Split large screen components
  - [ ] Extract complex logic from components

- [x] **Improve code duplication**
  - [x] Extract common patterns into utilities - formatBRL, shuffle, calcAvg, renderStars extracted
  - [x] Create reusable hooks for common patterns - Consolidated duplicate hooks
  - [x] Standardize async operation patterns - Error handling pattern established

- [x] **Modernize code patterns**
  - [x] Use modern React patterns (hooks, functional components) - Project uses hooks and functional components
  - [x] Replace class components if any exist - ErrorBoundary is only class component (required for error boundaries)
  - [x] Use modern async/await patterns consistently - Async/await used throughout

### Medium Priority
- [ ] **Improve state management**
  - [ ] Review Context usage for optimization
  - [ ] Consider state management library if needed
  - [ ] Optimize provider updates

## 📊 Code Quality Metrics

### High Priority
- [ ] **Set up code quality tools**
  - [ ] Add SonarQube or similar
  - [ ] Set up code complexity tracking
  - [ ] Add technical debt tracking
  - [ ] Set quality gates

- [ ] **Establish coding standards**
  - [ ] Document code review checklist
  - [ ] Create PR template
  - [ ] Define "definition of done"

---

## Notes

- Prioritize tasks marked as "High Priority"
- Complete tasks in order within each category
- Update this file by checking off completed items
- Add notes or links to PRs when completing tasks

