/**
 * useItemBookingCalendar - Hook for managing item booking calendar state
 * 
 * Handles:
 * - Booked days subscription from Firestore
 * - Date range state (start/end dates)
 * - Reservation calculations (days count, total)
 */

import { useEffect, useState, useMemo } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger, nextDay, diffDaysExclusive, enumerateInclusive } from '@/utils';
import type { Item } from '@/types';

type UseItemBookingCalendarResult = {
  booked: Set<string>;
  startISO: string | null;
  endISOInc: string | null;
  setStartISO: (date: string | null) => void;
  setEndISOInc: (date: string | null) => void;
  handleDateRangeChange: (start: string | null, end: string | null) => void;
  // Calculated values
  endExclusive: string | null;
  daysCount: number;
  minDays: number;
  rate: number;
  total: number;
  // Validation
  isDateRangeValid: (item: Item | null) => boolean;
  hasOverlappingDates: boolean;
};

export function useItemBookingCalendar(itemId: string, item: Item | null): UseItemBookingCalendarResult {
  const [booked, setBooked] = useState<Set<string>>(new Set());
  const [startISO, setStartISO] = useState<string | null>(null);
  const [endISOInc, setEndISOInc] = useState<string | null>(null);

  // Subscribe to booked days
  useEffect(() => {
    const qCal = collection(db, "items", itemId, "bookedDays");
    const unsub = onSnapshot(
      qCal,
      (snap) => {
        const s = new Set<string>();
        snap.forEach((d) => s.add(d.id)); // yyyy-mm-dd
        setBooked(s);
      },
      (err) => logger.error("Booked days snapshot listener error", err, { code: err?.code, message: err?.message })
    );
    return () => unsub();
  }, [itemId]);

  // Date range change handler
  const handleDateRangeChange = (start: string | null, end: string | null) => {
    setStartISO(start);
    setEndISOInc(end);
  };

  // Calculated values
  const endExclusive = useMemo(() => endISOInc ? nextDay(endISOInc) : null, [endISOInc]);
  const daysCount = useMemo(() => {
    return startISO && endExclusive ? diffDaysExclusive(startISO, endExclusive) : 0;
  }, [startISO, endExclusive]);
  const minDays = item?.minRentalDays ?? 1;
  const rate = item?.isFree ? 0 : (item?.dailyRate ?? 0);
  const total = useMemo(() => (daysCount > 0 ? rate * daysCount : 0), [daysCount, rate]);

  // Validation helpers
  const isDateRangeValid = useMemo(() => {
    return (item: Item | null): boolean => {
      if (!item || !startISO || !endExclusive) return false;
      if (daysCount < (item.minRentalDays ?? 1)) return false;
      return true;
    };
  }, [startISO, endExclusive, daysCount]);

  const hasOverlappingDates = useMemo(() => {
    if (!startISO || !endISOInc) return false;
    return Array.from(enumerateInclusive(startISO, endISOInc)).some((x) => booked.has(x));
  }, [startISO, endISOInc, booked]);

  return {
    booked,
    startISO,
    endISOInc,
    setStartISO,
    setEndISOInc,
    handleDateRangeChange,
    endExclusive,
    daysCount,
    minDays,
    rate,
    total,
    isDateRangeValid,
    hasOverlappingDates,
  };
}

