/**
 * Date utility functions for handling ISO date strings (yyyy-mm-dd format)
 */

/**
 * Pad a number with leading zeros to ensure 2 digits
 * @internal
 */
function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Get today's date in ISO format (yyyy-mm-dd) using local timezone
 * @returns ISO date string (e.g., "2025-01-15")
 */
export function todayLocalISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/**
 * Get the next day after the given ISO date
 * @param iso - ISO date string (yyyy-mm-dd)
 * @returns Next day in ISO format
 */
export function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/**
 * Calculate the number of days between two dates (exclusive end)
 * @param start - Start date in ISO format (inclusive)
 * @param endExclusive - End date in ISO format (exclusive)
 * @returns Number of days (0 or positive)
 */
export function diffDaysExclusive(start: string, endExclusive: string): number {
  const a = new Date(`${start}T00:00:00Z`).getTime();
  const b = new Date(`${endExclusive}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((b - a) / 86_400_000));
}

/**
 * Enumerate all dates between two ISO dates (inclusive both ends)
 * @param aISO - Start date in ISO format (inclusive)
 * @param bISO - End date in ISO format (inclusive)
 * @returns Array of ISO date strings
 */
export function enumerateInclusive(aISO: string, bISO: string): string[] {
  const out: string[] = [];
  let t = new Date(`${aISO}T00:00:00Z`).getTime();
  const end = new Date(`${bISO}T00:00:00Z`).getTime();
  while (t <= end) {
    const d = new Date(t);
    out.push(`${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`);
    t += 86_400_000;
  }
  return out;
}

