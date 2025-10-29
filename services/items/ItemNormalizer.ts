/**
 * Item normalization utilities
 * 
 * Provides functions to normalize and sanitize item input data
 * for consistent storage in Firestore.
 */

/**
 * Normalize a string by trimming whitespace
 * @param s - String to normalize
 * @returns Trimmed string or empty string if undefined/null
 */
export function normalize(s?: string): string {
  return (s ?? "").trim();
}

/**
 * Convert a string to searchable format (lowercase, trimmed)
 * @param s - String to convert
 * @returns Lowercase, trimmed string
 */
export function toSearchable(s?: string): string {
  return normalize(s).toLowerCase();
}


