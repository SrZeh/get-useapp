/**
 * Rating and review utility functions
 */

/**
 * Calculate average rating from sum and count
 * Clamps result between 0 and 5
 * @param sum - Sum of all ratings
 * @param count - Number of ratings
 * @returns Average rating (0-5) or null if invalid
 */
export function calcAvg(sum?: number, count?: number): number | null {
  if (!count || !sum) return null;
  if (count <= 0) return null;
  const avg = sum / count;
  // Clamp between 0 and 5
  return Math.max(0, Math.min(5, avg));
}

/**
 * Render star rating as string (e.g., "★★★★☆")
 * Rounds to nearest half star
 * @param avg - Average rating (0-5)
 * @returns String representation with full (★), half (☆), and empty (✩) stars
 */
export function renderStars(avg: number): string {
  // Round to nearest half star
  const rounded = Math.round(avg * 2) / 2;
  const full = Math.floor(rounded);
  const half = rounded - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return "★".repeat(full) + (half ? "☆" : "") + "✩".repeat(empty);
}

/**
 * Format rating with stars and number
 * @param avg - Average rating
 * @param count - Number of ratings
 * @param showCount - Whether to show count in parentheses
 * @returns Formatted string (e.g., "★★★★☆ 4.5 (12)")
 */
export function formatRating(avg: number | null, count?: number, showCount = true): string {
  if (avg === null) return "—";
  const stars = renderStars(avg);
  const number = avg.toFixed(1);
  if (showCount && count !== undefined) {
    return `${stars} ${number} (${count})`;
  }
  return `${stars} ${number}`;
}

