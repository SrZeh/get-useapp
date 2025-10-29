# Codebase Improvements TODO

This document tracks code quality improvements, refactoring tasks, and enhancements to make the codebase more maintainable and AI-friendly.

## 📋 TypeScript & Type Safety

### High Priority
- [ ] **Remove all `any` types (67 instances found)** - Replace with proper TypeScript types
  - [ ] Replace `any` in `services/items.ts` (4 instances)
  - [ ] Replace `any` in Firebase Cloud Functions (`functions/src/index.ts` - 9+ instances)
  - [ ] Replace `any` in transaction hooks (`src/hooks/useTransactionActions.ts`)
  - [ ] Replace `any` in app screens (login, register, transactions, items, etc.)
  - [ ] Create proper type definitions for Firestore documents
  - [ ] Add type guards for runtime type checking

- [ ] **Create centralized type definitions**
  - [ ] Create `types/item.ts` for Item-related types (currently duplicated in `app/(tabs)/index.tsx` and `app/(tabs)/items.tsx`)
  - [ ] Create `types/transaction.ts` for Transaction types
  - [ ] Create `types/reservation.ts` for Reservation types
  - [ ] Create `types/user.ts` for User profile types
  - [ ] Export types from a central `types/index.ts` barrel file

- [ ] **Improve Firebase type safety**
  - [ ] Create typed Firestore collection references (`collection<T>`)
  - [ ] Add type-safe document converters (FirestoreDataConverter)
  - [ ] Type all Firestore queries properly
  - [ ] Create type guards for Firestore document data validation

### Medium Priority
- [ ] **Add strict null checks** - Enable `strictNullChecks` if not already enabled
- [ ] **Create type utilities** - Add utility types for Partial, Required, Pick where needed
- [ ] **Type function parameters** - Ensure all function parameters are explicitly typed
- [ ] **Add return type annotations** - Explicitly type all function return values

## 🛡️ Error Handling & Resilience

### High Priority
- [ ] **Replace console.log/error with proper logging**
  - [ ] Replace `console.log` with structured logging utility (54 instances found)
  - [ ] Create `utils/logger.ts` with log levels (debug, info, warn, error)
  - [ ] Add environment-based logging (suppress debug in production)
  - [ ] Implement error reporting to monitoring service (Sentry, etc.)

- [ ] **Create Error Boundary components**
  - [ ] Create `components/ErrorBoundary.tsx` for React error boundaries
  - [ ] Wrap critical app sections with error boundaries
  - [ ] Add user-friendly error messages
  - [ ] Implement error recovery mechanisms

- [ ] **Improve async error handling**
  - [ ] Create consistent error handling pattern for all async operations
  - [ ] Add proper error types (e.g., `NetworkError`, `ValidationError`, `AuthError`)
  - [ ] Implement retry logic for network operations
  - [ ] Add error recovery UI patterns

- [ ] **Standardize error messages**
  - [ ] Create `constants/errors.ts` with user-facing error messages
  - [ ] Add error code constants
  - [ ] Localize error messages (prepare for i18n)

### Medium Priority
- [ ] **Add input validation utilities**
  - [ ] Create `utils/validation.ts` with validation functions
  - [ ] Add Zod or Yup for runtime schema validation
  - [ ] Validate all user inputs before API calls

## 🏗️ Code Organization & Structure

### High Priority
- [ ] **Consolidate duplicate code**
  - [ ] Extract duplicate `Item` type definitions into `types/item.ts`
  - [ ] Extract shared utility functions (e.g., `formatBRL`, `shuffle`)
  - [ ] Merge duplicate hooks (e.g., `useTransactionsDot.ts` appears in both `/hooks` and `/src/hooks`)

- [ ] **Organize service layer**
  - [ ] Review and organize `services/` directory structure
  - [ ] Split large service files into smaller, focused modules
  - [ ] Create service interfaces for better testability
  - [ ] Add dependency injection pattern for services

- [ ] **Improve component organization**
  - [ ] Break down large components (>200 lines) into smaller components
  - [ ] Extract complex logic from components into custom hooks
  - [ ] Create reusable form components (TextInput, Button, etc.)
  - [ ] Standardize component prop interfaces

### Medium Priority
- [ ] **Create constants file for magic numbers/strings**
  - [ ] Move hardcoded values to `constants/`
  - [ ] Create `constants/api.ts` for API endpoints
  - [ ] Create `constants/validation.ts` for validation rules

- [ ] **Improve file structure**
  - [ ] Review and consolidate `/src` vs root-level directories
  - [ ] Ensure consistent export patterns (named vs default exports)
  - [ ] Add index files for cleaner imports

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

- [ ] **Improve error UI**
  - [ ] Create consistent error message components
  - [ ] Add retry mechanisms in error states
  - [ ] Improve empty state designs

## 🤖 AI Enhancement & Developer Experience

### High Priority
- [ ] **Add comprehensive TypeScript types for better AI understanding**
  - [ ] Create detailed interfaces for all data structures
  - [ ] Add branded types for IDs (e.g., `type ItemId = string & { readonly __brand: 'ItemId' }`)
  - [ ] Add type predicates for runtime type checking
  - [ ] Document complex types with JSDoc

- [ ] **Improve code discoverability**
  - [ ] Add index files for all major directories
  - [ ] Use consistent naming conventions
  - [ ] Add clear file organization comments
  - [ ] Document module purposes

- [ ] **Create utility type helpers**
  - [ ] Create helper types for common patterns (e.g., `AsyncResult<T>`, `Maybe<T>`)
  - [ ] Add type utilities in `types/utils.ts`
  - [ ] Document utility types with examples

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

- [ ] **Improve code duplication**
  - [ ] Extract common patterns into utilities
  - [ ] Create reusable hooks for common patterns
  - [ ] Standardize async operation patterns

- [ ] **Modernize code patterns**
  - [ ] Use modern React patterns (hooks, functional components)
  - [ ] Replace class components if any exist
  - [ ] Use modern async/await patterns consistently

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

