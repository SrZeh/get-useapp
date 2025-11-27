/**
 * Transactions Store - Optimized Firestore query management for transactions/reservations
 * 
 * Features:
 * - Combines multiple transaction queries into efficient listeners
 * - Caches transaction data
 * - Shares real-time listeners across components
 * - Optimizes pending transactions queries
 */

import { create } from 'zustand';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  type DocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { onAuthStateChanged } from 'firebase/auth';
import { logger } from '@/utils';
import type { Transaction, Reservation } from '@/types';

interface TransactionCache {
  transaction: Transaction | Reservation;
  timestamp: number;
}

interface TransactionsStore {
  // Cache
  transactionsById: Map<string, TransactionCache>;
  
  // Real-time listeners
  userTransactionsListener: Unsubscribe | null;
  userTransactions: (Transaction | Reservation)[];
  userTransactionsLoading: boolean;
  userTransactionsError: Error | null;
  
  // Pending transactions (optimized single query instead of 3)
  pendingTransactionsListener: Unsubscribe | null;
  hasPendingTransactions: boolean;
  pendingTransactionsLoading: boolean;
  
  // Actions
  getTransaction: (id: string, forceRefresh?: boolean) => Promise<Transaction | Reservation | null>;
  getUserTransactions: () => (Transaction | Reservation)[];
  subscribeToUserTransactions: () => void;
  unsubscribeFromUserTransactions: () => void;
  subscribeToPendingTransactions: () => void;
  unsubscribeFromPendingTransactions: () => void;
  invalidateTransaction: (id: string) => void;
  invalidateUserTransactions: () => void;
  setTransaction: (id: string, transaction: Transaction | Reservation) => void;
  setUserTransactions: (transactions: (Transaction | Reservation)[]) => void;
  setUserTransactionsLoading: (loading: boolean) => void;
  setUserTransactionsError: (error: Error | null) => void;
}

const CACHE_TTL = 3 * 60 * 1000; // 3 minutes

/**
 * Transform Firestore document to Transaction/Reservation
 */
function transformTransactionDocument<T extends Transaction | Reservation>(
  doc: DocumentSnapshot,
  defaultType: 'transaction' | 'reservation' = 'transaction'
): T {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: data?.createdAt ?? null,
    updatedAt: data?.updatedAt ?? null,
  } as T;
}

/**
 * Transform query snapshot
 */
function transformTransactionSnapshot(
  snap: QuerySnapshot
): (Transaction | Reservation)[] {
  return snap.docs.map((d) => transformTransactionDocument(d));
}

export const useTransactionsStore = create<TransactionsStore>((set, get) => ({
  // Initial state
  transactionsById: new Map(),
  userTransactionsListener: null,
  userTransactions: [],
  userTransactionsLoading: false,
  userTransactionsError: null,
  pendingTransactionsListener: null,
  hasPendingTransactions: false,
  pendingTransactionsLoading: false,

  /**
   * Get transaction/reservation by ID with caching
   */
  getTransaction: async (id: string, forceRefresh = false) => {
    console.log('[transactionsStore] getTransaction called:', { id, forceRefresh });
    const state = get();
    const cached = state.transactionsById.get(id);
    const now = Date.now();

    // Return cached transaction if still valid
    if (!forceRefresh && cached && (now - cached.timestamp) < CACHE_TTL) {
      console.log('[transactionsStore] getTransaction - Returning from cache:', {
        id,
        cachedId: cached.transaction.id,
        status: (cached.transaction as any)?.status,
      });
      return cached.transaction;
    }

    // Try reservations collection first (transactions are just reservations with a different name)
    try {
      console.log('[transactionsStore] getTransaction - Fetching from RESERVATIONS collection:', id);
      let snap: DocumentSnapshot | null = null;
      
      try {
        snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.RESERVATIONS, id));
        console.log('[transactionsStore] getTransaction - RESERVATIONS result:', {
          exists: snap.exists(),
          id: snap.id,
          data: snap.exists() ? { 
            status: snap.data()?.status,
            renterUid: snap.data()?.renterUid,
            itemOwnerUid: snap.data()?.itemOwnerUid,
          } : null,
        });
      } catch (err: any) {
        console.error('[transactionsStore] getTransaction - Error fetching from RESERVATIONS:', {
          error: err,
          code: err?.code,
          message: err?.message,
        });
        throw err;
      }
      
      // If not found in reservations, try transactions (legacy support)
      if (!snap || !snap.exists()) {
        console.log('[transactionsStore] getTransaction - Not found in RESERVATIONS, trying TRANSACTIONS (legacy):', id);
        try {
          snap = await getDoc(doc(db, FIRESTORE_COLLECTIONS.TRANSACTIONS, id));
          console.log('[transactionsStore] getTransaction - TRANSACTIONS result:', {
            exists: snap.exists(),
            id: snap.id,
          });
        } catch (err: any) {
          console.error('[transactionsStore] getTransaction - Error fetching from TRANSACTIONS:', {
            error: err,
            code: err?.code,
            message: err?.message,
          });
          // Don't throw, just continue - transactions might not have rules
        }
      }

      if (!snap.exists()) {
        console.log('[transactionsStore] getTransaction - Not found in any collection:', id);
        // Remove from cache if not found
        set((state) => {
          const newCache = new Map(state.transactionsById);
          newCache.delete(id);
          return { transactionsById: newCache };
        });
        return null;
      }

      const transaction = transformTransactionDocument(snap);
      console.log('[transactionsStore] getTransaction - Transaction transformed:', {
        id: transaction.id,
        hasItemId: 'itemId' in transaction,
        status: (transaction as any)?.status,
      });

      // Update cache
      set((state) => {
        const newCache = new Map(state.transactionsById);
        newCache.set(id, { transaction, timestamp: now });
        return { transactionsById: newCache };
      });

      return transaction;
    } catch (error) {
      console.error('[transactionsStore] getTransaction - Error:', {
        error,
        message: (error as any)?.message,
        code: (error as any)?.code,
        stack: (error as any)?.stack,
      });
      logger.error('Error fetching transaction', error);
      throw error;
    }
  },

  /**
   * Get user transactions from cache
   */
  getUserTransactions: () => {
    return get().userTransactions;
  },

  /**
   * Subscribe to user transactions with real-time updates
   * Uses a single query for all user transactions
   * Note: This doesn't return a cleanup function because the store manages the listener lifecycle
   */
  subscribeToUserTransactions: () => {
    const state = get();
    
    // If listener already exists, don't create another
    if (state.userTransactionsListener) {
      return;
    }

    let stopAuth: (() => void) | null = null;
    let currentUnsub: (() => void) | null = null;

    stopAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listener
      if (currentUnsub) {
        currentUnsub();
        currentUnsub = null;
      }

      if (!user) {
        set({
          userTransactions: [],
          userTransactionsLoading: false,
          userTransactionsError: null,
          userTransactionsListener: null,
        });
        return;
      }

      set({ userTransactionsLoading: true, userTransactionsError: null });
      logger.debug('Loading transactions for user', { uid: user.uid });

      // Single query for all transactions where user participates
      const q = query(
        collection(db, FIRESTORE_COLLECTIONS.TRANSACTIONS),
        where('participants', 'array-contains', user.uid),
        orderBy('updatedAt', 'desc')
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          const transactions = transformTransactionSnapshot(snap);
          
          // Also update individual transaction cache
          const newCache = new Map(get().transactionsById);
          transactions.forEach((tx) => {
            newCache.set(tx.id, { transaction: tx, timestamp: Date.now() });
          });

          set({
            userTransactions: transactions,
            userTransactionsLoading: false,
            userTransactionsError: null,
            transactionsById: newCache,
          });
        },
        (err) => {
          const error = err instanceof Error ? err : new Error(String(err));
          set({
            userTransactionsLoading: false,
            userTransactionsError: error,
          });
          logger.error('Transactions snapshot listener error', err);
        }
      );

      currentUnsub = unsub;
      
      // Store combined cleanup function
      const combinedCleanup = () => {
        if (currentUnsub) {
          currentUnsub();
          currentUnsub = null;
        }
        if (stopAuth) {
          stopAuth();
          stopAuth = null;
        }
      };

      set({ userTransactionsListener: combinedCleanup });
    });
  },

  /**
   * Unsubscribe from user transactions
   */
  unsubscribeFromUserTransactions: () => {
    const state = get();
    if (state.userTransactionsListener) {
      state.userTransactionsListener();
      set({ userTransactionsListener: null });
    }
  },

  /**
   * Subscribe to pending transactions
   * Optimized: Uses two queries instead of 3 separate queries
   * Note: This doesn't return a cleanup function because the store manages the listener lifecycle
   */
  subscribeToPendingTransactions: () => {
    const state = get();
    
    // If listener already exists, don't create another
    if (state.pendingTransactionsListener) {
      return;
    }

    let stopAuth: (() => void) | null = null;
    let ownerUnsub: Unsubscribe | null = null;
    let renterUnsub: Unsubscribe | null = null;
    let hasOwnerPending = false;
    let hasRenterPending = false;

    stopAuth = onAuthStateChanged(auth, (user) => {
      // Clean up previous listeners
      if (ownerUnsub) {
        ownerUnsub();
        ownerUnsub = null;
      }
      if (renterUnsub) {
        renterUnsub();
        renterUnsub = null;
      }

      if (!user) {
        set({
          hasPendingTransactions: false,
          pendingTransactionsLoading: false,
          pendingTransactionsListener: null,
        });
        return;
      }

      set({ pendingTransactionsLoading: true });
      logger.debug('Checking pending transactions for user', { uid: user.uid });

      // Optimized: Two queries instead of 3
      const uid = user.uid;
      
      // Query 1: Owner pending (requested)
      const qOwner = query(
        collection(db, FIRESTORE_COLLECTIONS.RESERVATIONS),
        where('itemOwnerUid', '==', uid),
        where('status', '==', 'requested')
      );

      // Query 2: Renter pending (accepted or paid)
      const qRenter = query(
        collection(db, FIRESTORE_COLLECTIONS.RESERVATIONS),
        where('renterUid', '==', uid),
        where('status', 'in', ['accepted', 'paid'])
      );

      const checkPending = () => {
        const hasPending = hasOwnerPending || hasRenterPending;
        set({ hasPendingTransactions: hasPending, pendingTransactionsLoading: false });
      };

      ownerUnsub = onSnapshot(
        qOwner,
        (snap) => {
          hasOwnerPending = !snap.empty;
          checkPending();
        },
        (err) => {
          logger.error('Owner pending transactions error', err);
          set({ pendingTransactionsLoading: false });
        }
      );

      renterUnsub = onSnapshot(
        qRenter,
        (snap) => {
          hasRenterPending = !snap.empty;
          checkPending();
        },
        (err) => {
          logger.error('Renter pending transactions error', err);
          set({ pendingTransactionsLoading: false });
        }
      );

      // Combined cleanup function
      const combinedCleanup = () => {
        if (ownerUnsub) {
          ownerUnsub();
          ownerUnsub = null;
        }
        if (renterUnsub) {
          renterUnsub();
          renterUnsub = null;
        }
        if (stopAuth) {
          stopAuth();
          stopAuth = null;
        }
      };

      set({ pendingTransactionsListener: combinedCleanup });
    });
  },

  /**
   * Unsubscribe from pending transactions
   */
  unsubscribeFromPendingTransactions: () => {
    const state = get();
    if (state.pendingTransactionsListener) {
      state.pendingTransactionsListener();
      set({ pendingTransactionsListener: null });
    }
  },

  /**
   * Invalidate transaction cache
   */
  invalidateTransaction: (id: string) => {
    set((state) => {
      const newCache = new Map(state.transactionsById);
      newCache.delete(id);
      return { transactionsById: newCache };
    });
  },

  /**
   * Invalidate user transactions cache
   */
  invalidateUserTransactions: () => {
    set({ userTransactions: [] });
    // Force refetch by clearing listener
    const state = get();
    if (state.userTransactionsListener) {
      state.userTransactionsListener();
      set({ userTransactionsListener: null });
    }
    get().subscribeToUserTransactions();
  },

  /**
   * Set transaction in cache (useful after mutations)
   */
  setTransaction: (id: string, transaction: Transaction | Reservation) => {
    set((state) => {
      const newCache = new Map(state.transactionsById);
      newCache.set(id, { transaction, timestamp: Date.now() });
      
      // Also update in userTransactions if it's there
      const userTransactions = state.userTransactions.map((tx) =>
        tx.id === id ? transaction : tx
      );
      
      return {
        transactionsById: newCache,
        userTransactions,
      };
    });
  },

  /**
   * Set user transactions directly (useful for mutations)
   */
  setUserTransactions: (transactions: (Transaction | Reservation)[]) => {
    // Update cache
    const newCache = new Map(get().transactionsById);
    transactions.forEach((tx) => {
      newCache.set(tx.id, { transaction: tx, timestamp: Date.now() });
    });

    set({
      userTransactions: transactions,
      transactionsById: newCache,
    });
  },

  /**
   * Set loading state
   */
  setUserTransactionsLoading: (loading: boolean) => {
    set({ userTransactionsLoading: loading });
  },

  /**
   * Set error state
   */
  setUserTransactionsError: (error: Error | null) => {
    set({ userTransactionsError: error });
  },
}));

