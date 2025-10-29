/**
 * Firestore-related type definitions and utilities
 */

import type { Timestamp } from 'firebase/firestore';

/**
 * Type for Firestore Timestamp in documents (can be Timestamp object or converted Date)
 */
export type FirestoreTimestamp = Timestamp | Date | string | null | undefined;

/**
 * Utility type for Firestore document data with optional timestamp fields
 */
export type FirestoreDocument<T> = T & {
  id: string;
  createdAt?: FirestoreTimestamp;
  updatedAt?: FirestoreTimestamp;
};

/**
 * Type guard to check if a value is a Firestore Timestamp
 */
export function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof (value as { toDate?: unknown }).toDate === 'function'
  );
}

/**
 * Convert Firestore Timestamp to Date
 */
export function toDate(timestamp: FirestoreTimestamp): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp === 'string') {
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }
  if (isTimestamp(timestamp)) {
    return timestamp.toDate();
  }
  return null;
}

