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

// Profile hooks
export { useUpdateProfile, useLoadProfile } from './useProfile';

// Review hooks
export { useSubmitReview } from './useReview';

// Location hooks
export { useLocations } from './useLocations';

// Feature hooks (re-exported for convenience)
export * from './features';

