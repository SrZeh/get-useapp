/**
 * Barrel file for hook exports
 * 
 * Re-exports hooks for backward compatibility and convenience.
 * Feature-specific hooks are also available directly from their feature directories.
 */

// Core hooks
export { useColorScheme } from './use-color-scheme';
export { useThemeColor } from './use-theme-color';

// Item hooks (re-exported from features)
export { useUserItems, useItemOperations, useItemForm } from './features/items';
export type { ItemFormInput, ItemListFilters, ItemListActions, UseItemListResult, ResponsiveGridConfig } from './features/items';

// Auth hooks
export { useFormValidation } from './useFormValidation';
export { useRegister, useLogin, useResetPassword } from './useAuth';

// Profile hooks (re-exported from features)
export { useUpdateProfile, useLoadProfile } from './features/profile';

// Review hooks (re-exported from features)
export { useSubmitReview } from './features/reviews';
export type { ReviewFormInput } from './features/reviews';

// Reservation hooks (re-exported from features)
export { useReservationData } from './features/reservations';

// Location hooks
export { useLocations } from './useLocations';

// Utility hooks
export { useDebounce } from './useDebounce';

// Feature hooks (re-exported for convenience)
export * from './features';

