/**
 * Transaction-related type definitions
 */

import type { FirestoreTimestamp, FirestoreDocument } from './firestore';

/**
 * Transaction status types (for the older transaction system)
 */
export type TransactionStatus =
  | 'requested'
  | 'approved'
  | 'rejected'
  | 'in_use'
  | 'returned'
  | 'closed'
  | 'cancelled';

/**
 * Base Transaction interface (for the older transaction system)
 */
export interface Transaction {
  id: string;
  itemTitle?: string;
  status: TransactionStatus;
  lenderId: string;
  borrowerId: string;
  participants: string[];
  itemId?: string;
  updatedAt?: FirestoreTimestamp;
  createdAt?: FirestoreTimestamp;
  
  // Chat-related
  lastMessage?: {
    text?: string;
    senderId?: string;
    createdAt?: FirestoreTimestamp;
  };
}

/**
 * Transaction document as stored in Firestore
 */
export type TransactionDocument = FirestoreDocument<Omit<Transaction, 'id' | 'updatedAt' | 'createdAt'>>;

/**
 * Input type for creating a new transaction
 */
export interface NewTransactionInput {
  lenderId: string;
  borrowerId: string;
  itemId: string;
  itemTitle?: string;
  status: TransactionStatus;
}

/**
 * Type guard to check if an object is a valid Transaction
 */
export function isTransaction(obj: unknown): obj is Transaction {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'status' in obj &&
    'lenderId' in obj &&
    'borrowerId' in obj &&
    'participants' in obj &&
    typeof (obj as { id: unknown }).id === 'string' &&
    typeof (obj as { status: unknown }).status === 'string' &&
    typeof (obj as { lenderId: unknown }).lenderId === 'string' &&
    typeof (obj as { borrowerId: unknown }).borrowerId === 'string' &&
    Array.isArray((obj as { participants: unknown }).participants)
  );
}

/**
 * Check if a transaction status transition is valid
 */
export function isValidStatusTransition(
  currentStatus: TransactionStatus,
  newStatus: TransactionStatus,
  userId: string,
  transaction: Transaction
): boolean {
  const isLender = transaction.lenderId === userId;
  const isBorrower = transaction.borrowerId === userId;

  switch (newStatus) {
    case 'approved':
      return currentStatus === 'requested' && isLender;
    case 'rejected':
      return currentStatus === 'requested' && isLender;
    case 'in_use':
      return currentStatus === 'approved' && (isLender || isBorrower);
    case 'returned':
      return currentStatus === 'in_use' && (isLender || isBorrower);
    case 'closed':
      return currentStatus === 'returned' && isLender;
    case 'cancelled':
      return currentStatus === 'requested' && isBorrower;
    default:
      return false;
  }
}

