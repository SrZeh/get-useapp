/**
 * Transactions Feature - Barrel Export
 * 
 * Centralized exports for all transaction-related components.
 * This follows the feature-based architecture pattern for better organization.
 */

export { OwnerInbox } from './OwnerInbox';
export { MyReservations } from './MyReservations';
export { TransactionsTabs } from './TransactionsTabs';

// Reservation card sub-components
export { ReservationStatusBadge } from './ReservationStatusBadge';
export { ReservationDates } from './ReservationDates';
export { ReservationPrice } from './ReservationPrice';
export { ReservationActions } from './ReservationActions';
export { ReservationTimestamps } from './ReservationTimestamps';
export { NotificationBadge } from './NotificationBadge';

// Re-export types for convenience
export type * from './types';
