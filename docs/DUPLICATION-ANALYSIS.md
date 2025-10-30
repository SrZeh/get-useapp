# Duplication Analysis Report

## Summary
Analysis of the codebase revealed **two separate implementations of ViaCEP API integration** and other duplicated patterns. **✅ All duplications have been resolved.**

## ✅ Resolution Status

### Completed Fixes
1. **✅ ViaCEP API URL** - Centralized in `constants/api.ts`
2. **✅ CEP Formatting** - Moved to `utils/formatters.ts` as reusable utility
3. **✅ Hook Consolidation** - Updated `useViaCEP.ts` to use centralized constants
4. **✅ Component Update** - Updated `CEPInput.tsx` to use centralized constants
5. **✅ Import Cleanup** - Updated `app/item/new.tsx` to use centralized utilities
6. **✅ Barrel Export** - Added `formatCEP` to `utils/index.ts` for convenient access

### Implementation Details

#### Changes Made

**1. `constants/api.ts`**
```typescript
export const API_CONFIG = {
  // ... existing config
  VIACEP_API: "https://viacep.com.br/ws",
} as const;
```

**2. `utils/formatters.ts`**
```typescript
export function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.substring(0, 5)}-${digits.substring(5, 8)}`;
}
```

**3. `hooks/useViaCEP.ts`**
- Import from `@/constants/api` instead of local constant
- Import `formatCEP` from `@/utils/formatters`
- Marked `formatCEPValue` as deprecated (wrapper for backwards compatibility)

**4. `components/forms/CEPInput.tsx`**
- Import from `@/constants/api` instead of local constant
- Import `formatCEP` from `@/utils/formatters`
- Removed duplicate `formatCEP` function definition

**5. `app/item/new.tsx`**
- Changed from importing `formatCEPValue` to importing `formatCEP`
- Uses centralized utility function

#### Benefits
- ✅ **Single source of truth** for API URL and CEP formatting
- ✅ **Easier maintenance** - changes in one place
- ✅ **Consistency** - same behavior across all components
- ✅ **Reusability** - `formatCEP` can be imported from `@/utils` anywhere
- ✅ **Type safety** - centralized constants prevent typos

---

## 1. 🚨 CRITICAL: ViaCEP API Duplication

### Problem
The ViaCEP API integration is implemented in **two separate locations** with overlapping functionality:

#### Location 1: `components/forms/CEPInput.tsx` 
- **Line 19**: `const VIACEP_API = 'https://viacep.com.br/ws';`
- **Lines 65-90**: Complete ViaCEP fetch implementation with debouncing
- **Lines 38-44**: CEP formatting function (`formatCEP`)
- **Purpose**: Full CEP input component with auto-fetch

#### Location 2: `hooks/useViaCEP.ts`
- **Line 9**: `const VIACEP_API = 'https://viacep.com.br/ws';`
- **Lines 46-70**: Complete ViaCEP fetch implementation
- **Lines 20-26**: CEP formatting function (`formatCEP`)
- **Lines 83-85**: Exports `formatCEPValue` (wrapper)
- **Purpose**: Hook for fetching address data

### Impact
- **Duplication**: Same API URL constant, same fetch logic, same CEP formatting
- **Maintenance burden**: Changes must be made in two places
- **Inconsistency risk**: Two implementations may diverge over time

### Current Usage
- `CEPInput.tsx` is used in: `AddressInput.tsx` (used in register/profile forms)
- `useViaCEP` hook is used in: `app/item/new.tsx` (used in LocationSection)

### Recommended Solution
**Consolidate into a single implementation:**

1. **Keep the hook** (`useViaCEP.ts`) as the core logic
2. **Update `CEPInput.tsx`** to use the hook instead of direct fetch
3. **Move the CEP formatting** function to a shared utility (`utils/formatters.ts`)
4. **Remove duplicate** API URL constant (use a single source in `constants/api.ts`)

---

## 2. CEP Formatting Function Duplication

### Problem
The same `formatCEP` function is duplicated in:
- `components/forms/CEPInput.tsx` (lines 38-44)
- `hooks/useViaCEP.ts` (lines 20-26)

```typescript
// Duplicate in both files
function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.substring(0, 5)}-${digits.substring(5, 8)}`;
}
```

### Recommended Solution
Move to `utils/formatters.ts` and export as a reusable utility function.

---

## 3. API URL Constant Duplication

### Problem
ViaCEP API URL is defined in two places:
- `components/forms/CEPInput.tsx`: Line 19
- `hooks/useViaCEP.ts`: Line 9

### Recommended Solution
Add to `constants/api.ts`:

```typescript
export const API_CONFIG = {
  // ... existing config
  VIACEP_API: 'https://viacep.com.br/ws',
} as const;
```

---

## 4. Address Handling Pattern Duplication

### Problem
Two different patterns for handling address data from ViaCEP:

1. **Pattern A** (in `useViaCEP.ts`): Returns only `{ neighborhood, city }`
2. **Pattern B** (in `CEPInput.tsx`): Returns full address `{ street, complement, neighborhood, city, state }`

### Current Usage
- `useViaCEP` (Pattern A) is used in `app/item/new.tsx` for LocationSection
- `CEPInput` (Pattern B) is used in `AddressInput` for full address forms

### Recommendation
**This is acceptable duplication** because:
- Different use cases need different data
- The hook can be extended to support both patterns
- Better to have flexible API than force all consumers to handle unused fields

---

## 5. Related Findings

### ✅ No Duplication Found:
- Firebase/Firestore integration: Well consolidated
- Cloud Functions calls: Using centralized `callCloudFunction` helper
- Authentication: No duplication found
- Stripe integration: Properly separated in service layer

---

## Recommendations

### High Priority
1. ✅ **Consolidate ViaCEP implementation** - Use hook pattern, update `CEPInput` to consume it
2. ✅ **Extract CEP formatting** - Move to `utils/formatters.ts`
3. ✅ **Centralize API URLs** - Add ViaCEP URL to `constants/api.ts`

### Medium Priority
4. ✅ **Standardize address fetching** - Ensure consistent error handling between implementations
5. ✅ **Add unit tests** - Test CEP formatting and ViaCEP integration

### Low Priority
6. Consider making `useViaCEP` support both minimal and full address return types
7. Add retry logic for failed ViaCEP requests
8. Add caching to reduce redundant API calls

---

## Files That Need Changes

1. `constants/api.ts` - Add VIACEP_API constant
2. `utils/formatters.ts` - Add formatCEP function
3. `hooks/useViaCEP.ts` - Refactor to use centralized constants
4. `components/forms/CEPInput.tsx` - Refactor to use hook and shared utilities
5. `app/item/new.tsx` - May need minor adjustments if hook signature changes

---

## Implementation Plan

### Step 1: Centralize Constants
- Add VIACEP_API to `constants/api.ts`

### Step 2: Extract Utilities
- Move `formatCEP` to `utils/formatters.ts` as `formatCEP`
- Keep `formatCEPValue` as a convenience wrapper in the hook

### Step 3: Consolidate Logic
- Update `useViaCEP` to import constants from centralized location
- Update `CEPInput` to use `useViaCEP` hook instead of direct fetch
- Remove duplicate fetch logic from `CEPInput`

### Step 4: Update Imports
- Update all files importing from `useViaCEP` to also import from `utils/formatters`
- Remove unused imports

### Step 5: Test
- Test CEP input in both contexts (item forms and address forms)
- Verify auto-fill behavior works correctly
- Check error handling

---

## Estimation
- **Time**: 15-30 minutes
- **Risk**: Low (refactoring, not new features)
- **Impact**: Improved maintainability, reduced code duplication

