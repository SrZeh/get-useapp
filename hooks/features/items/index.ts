/**
 * Item-related hooks - Barrel Export
 * 
 * All hooks related to item management, listing, and operations.
 */

// Item form hook
export { useItemForm } from './useItemForm';
export type { ItemFormInput } from './useItemForm';

// Item operations hook
export { useItemOperations } from './useItemOperations';

// User items hook
export { useUserItems } from './useUserItems';

// Item list hook
export { useItemList } from './useItemList';
export type { ItemListFilters, ItemListActions, UseItemListResult } from './useItemList';

// Responsive grid hook
export { useResponsiveGrid } from './useResponsiveGrid';
export type { ResponsiveGridConfig } from './useResponsiveGrid';

// Item detail hooks
export { useItemDetail } from './useItemDetail';
export { useItemBookingCalendar } from './useItemBookingCalendar';
export { useItemReviewSubmission } from './useItemReviewSubmission';
export { useItemReservation } from './useItemReservation';

