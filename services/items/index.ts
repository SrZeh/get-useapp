/**
 * Item service - barrel export
 * 
 * Exports all item-related services and utilities.
 * Maintains backward compatibility with direct imports from services/items.
 */

// Re-export types
export type { NewItemInput } from "@/types";

// Normalization utilities
export { normalize, toSearchable } from "./ItemNormalizer";

// REST client (for advanced use cases)
export { isUnavailable, restCreateItemFull, restPatchItem, restCreateItem, restListItems } from "./ItemRestClient";

// Builder
export { buildItemDoc } from "./ItemBuilder";

// Read operations
export { safeListItems, safeGetItem } from "./ItemReader";

// Write operations
export { safeCreateItemFull, safeUpdateItem, safeBumpRating, safeCreateItem } from "./ItemWriter";

// Offer item to request
export { offerItemToRequest } from "./offerItemToRequest";

// Repeat request
export { repeatRequest } from "./repeatRequest";


