/**
 * Reservation calculation utilities
 */

import { diffDaysExclusive, nextDay } from './dates';
import type { Item } from '@/types';

/**
 * Calculate the total cost for a reservation
 * @param days - Number of rental days
 * @param dailyRate - Daily rental rate
 * @param isFree - Whether the item is free
 * @returns Total cost (0 if free or invalid)
 */
export function calculateReservationTotal(
  days: number,
  dailyRate: number,
  isFree: boolean
): number {
  if (isFree || days <= 0) return 0;
  return dailyRate * days;
}

/**
 * Calculate reservation summary from date range
 * @param startISO - Start date (inclusive) in ISO format
 * @param endISOInc - End date (inclusive) in ISO format
 * @param item - Item being reserved
 * @returns Reservation summary with days count and total
 */
export function calculateReservationSummary(
  startISO: string | null,
  endISOInc: string | null,
  item: Item | null
): {
  endExclusive: string | null;
  daysCount: number;
  minDays: number;
  rate: number;
  total: number;
} {
  const endExclusive = endISOInc ? nextDay(endISOInc) : null;
  const daysCount = startISO && endExclusive ? diffDaysExclusive(startISO, endExclusive) : 0;
  const minDays = item?.minRentalDays ?? 1;
  const rate = item?.isFree ? 0 : (item?.dailyRate ?? 0);
  const total = calculateReservationTotal(daysCount, rate, item?.isFree ?? false);

  return {
    endExclusive,
    daysCount,
    minDays,
    rate,
    total,
  };
}


