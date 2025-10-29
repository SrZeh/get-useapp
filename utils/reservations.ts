/**
 * Reservation calculation and formatting utilities
 */

import { diffDaysExclusive, nextDay } from './dates';
import type { Item, Reservation, ReservationStatus } from '@/types';
import type { ThemeColors } from './theme';
import type { FirestoreTimestamp } from '@/types/firestore';
import { toDate } from '@/types/firestore';

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

/**
 * Check if reservation is expired (not accepted and past check-in date)
 * @param reservation - Reservation to check
 * @returns True if reservation is expired
 */
export function isExpired(reservation: Reservation): boolean {
  if (
    reservation.status === 'accepted' ||
    reservation.status === 'paid' ||
    reservation.status === 'picked_up' ||
    reservation.status === 'paid_out' ||
    reservation.status === 'returned' ||
    reservation.status === 'rejected' ||
    reservation.status === 'canceled' ||
    reservation.status === 'closed'
  ) {
    return false;
  }

  if (!reservation.startDate) return false;

  try {
    const checkInDate = new Date(`${reservation.startDate}T00:00:00Z`);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    return checkInDate < today;
  } catch {
    return false;
  }
}

/**
 * Get status color gradient for reservation badges
 * @param status - Reservation status
 * @param colors - Theme colors object
 * @param isExpired - Whether reservation is expired
 * @returns Tuple of [startColor, endColor] for gradient
 */
export function getStatusColors(
  status: ReservationStatus | string,
  colors: ThemeColors,
  isExpired: boolean = false
): [string, string] {
  if (isExpired) {
    return [colors.semantic.error, colors.semantic.error];
  }

  switch (status) {
    case 'requested':
      return [colors.semantic.warning, colors.semantic.warning];
    case 'accepted':
      return [colors.semantic.success, colors.brand.dark];
    case 'rejected':
      return [colors.semantic.error, colors.semantic.error];
    case 'paid':
      return [colors.semantic.info, colors.semantic.info];
    case 'picked_up':
      return ['#0891b2', '#0e7490'];
    case 'paid_out':
      return ['#7c3aed', '#6d28d9'];
    case 'returned':
      return [colors.semantic.success, colors.brand.dark];
    case 'canceled':
      return [colors.text.quaternary, colors.text.tertiary];
    default:
      return [colors.text.quaternary, colors.text.tertiary];
  }
}

/**
 * Format ISO date string to Brazilian locale
 * @param iso - ISO date string (YYYY-MM-DD)
 * @returns Formatted date string (DD/MM/YYYY) or "Não informado"
 */
export function formatISODate(iso?: string): string {
  if (!iso) return 'Não informado';
  try {
    const date = new Date(`${iso}T00:00:00Z`);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

/**
 * Format timestamp to relative time or date
 * @param timestamp - Firestore timestamp
 * @returns Formatted relative time or date string
 */
export function formatTimestamp(timestamp?: unknown): string {
  if (!timestamp || (typeof timestamp === 'object' && Object.keys(timestamp).length === 0))
    return '';
  const date = toDate(timestamp as FirestoreTimestamp);
  if (!date) return '';

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `${diffDays} dias atrás`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format payment method name
 * @param method - Payment method string
 * @returns Formatted payment method name
 */
export function formatPaymentMethod(method?: string | null): string {
  if (!method) return '';
  const methodMap: Record<string, string> = {
    pix: 'PIX',
    boleto: 'Boleto',
    card: 'Cartão',
  };
  return methodMap[method.toLowerCase()] ?? method.toUpperCase();
}

/**
 * Translate reservation status to Portuguese with first letter capitalized
 * @param status - Reservation status
 * @returns Translated status string with capital first letter
 */
export function translateStatus(status: string): string {
  const statusMap: Record<string, string> = {
    requested: 'solicitado',
    accepted: 'aceito',
    rejected: 'rejeitado',
    paid: 'pago',
    picked_up: 'recebido',
    paid_out: 'repassado',
    returned: 'devolvido',
    canceled: 'cancelado',
    closed: 'encerrado',
    expired: 'expirado',
  };
  const translated = statusMap[status.toLowerCase()] ?? status;
  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

