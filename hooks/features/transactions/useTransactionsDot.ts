/**
 * useTransactionsDot - Hook for transaction notification dot indicator
 * 
 * Shows notification dot when user has reservations requiring action:
 * - As OWNER: reservations with status "requested"
 * - As RENTER: reservations with status "accepted"
 * 
 * Uses timestamp-based tracking to only show new items since last viewed.
 */

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  type DocumentData,
  type QuerySnapshot,
  type Timestamp,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";
import { logger } from "@/utils";

/**
 * Check if there are new reservations since the last seen timestamp
 */
function hasNewSince(snap: QuerySnapshot<DocumentData>, lastSeenMs?: number | null): boolean {
  // If never seen, show dot if there are any documents
  if (!lastSeenMs) return !snap.empty;
  
  let show = false;
  snap.forEach((d) => {
    const data = d.data();
    const updatedAt = data?.updatedAt;
    
    // Handle Firestore Timestamp
    if (updatedAt && typeof updatedAt === 'object' && 'toMillis' in updatedAt) {
      const timestamp = updatedAt as Timestamp;
      const millis = timestamp.toMillis();
      if (millis > lastSeenMs) {
        show = true;
      }
    }
  });
  return show;
}

/**
 * Hook to show notification dot on transactions tab
 * 
 * Shows dot if:
 * - You are OWNER and have "requested" reservations newer than last seen, or
 * - You are RENTER and have "accepted" reservations newer than last seen
 */
export function useTransactionsDot(): boolean {
  const uid = auth.currentUser?.uid ?? null;
  const [dot, setDot] = useState(false);
  const lastSeenMsRef = useRef<number | null | undefined>(undefined);
  const ownerSnapRef = useRef<QuerySnapshot<DocumentData> | null>(null);
  const renterSnapRef = useRef<QuerySnapshot<DocumentData> | null>(null);

  // Helper to re-check both snapshots
  const recheckDot = () => {
    const ownerSnap = ownerSnapRef.current;
    const renterSnap = renterSnapRef.current;
    const lastSeen = lastSeenMsRef.current;
    
    const hasNewOwner = ownerSnap ? hasNewSince(ownerSnap, lastSeen) : false;
    const hasNewRenter = renterSnap ? hasNewSince(renterSnap, lastSeen) : false;
    
    setDot(hasNewOwner || hasNewRenter);
  };

  useEffect(() => {
    if (!uid) {
      setDot(false);
      return;
    }

    // Observe user's lastSeenAt.reservations timestamp
    // This is updated by the markAsSeen cloud function when type="reservations"
    const userRef = doc(db, "users", uid);

    // Reservations requiring action from OWNER (requested)
    const qOwner = query(
      collection(db, "reservations"),
      where("itemOwnerUid", "==", uid),
      where("status", "in", ["requested"])
    );

    // Reservations requiring action from RENTER (accepted)
    const qRenter = query(
      collection(db, "reservations"),
      where("renterUid", "==", uid),
      where("status", "in", ["accepted"])
    );

    const unsubs = [
      onSnapshot(
        qOwner,
        (snap) => {
          ownerSnapRef.current = snap;
          recheckDot();
        },
        (err) => {
          logger.warn('Failed to subscribe to owner reservations', { uid, error: err });
        }
      ),
      onSnapshot(
        qRenter,
        (snap) => {
          renterSnapRef.current = snap;
          recheckDot();
        },
        (err) => {
          logger.warn('Failed to subscribe to renter reservations', { uid, error: err });
        }
      ),
    ];

    // Update the ref when lastSeenMs changes
    const unsubUserWithRef = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) {
          lastSeenMsRef.current = null;
          recheckDot();
          return;
        }

        const data = snap.data();
        const lastSeenAtObj = data?.lastSeenAt as Record<string, Timestamp> | undefined;
        const lastSeen = lastSeenAtObj?.reservations ?? data?.lastTransactionsSeenAt;
        
        let newLastSeenMs: number | null | undefined = undefined;
        if (lastSeen && typeof lastSeen === 'object' && 'toMillis' in lastSeen) {
          const timestamp = lastSeen as Timestamp;
          newLastSeenMs = timestamp.toMillis();
        } else {
          newLastSeenMs = null;
        }

        // Only update and recheck if the value actually changed
        if (lastSeenMsRef.current !== newLastSeenMs) {
          logger.debug('useTransactionsDot: lastSeenAt.reservations changed', {
            uid,
            oldValue: lastSeenMsRef.current,
            newValue: newLastSeenMs,
            lastSeenAtObj: lastSeenAtObj ? Object.keys(lastSeenAtObj) : null,
          });
          lastSeenMsRef.current = newLastSeenMs;
          recheckDot();
        }
      },
      (err) => {
        logger.error('Failed to subscribe to user lastSeenAt in useTransactionsDot', err, { uid });
      }
    );

    return () => {
      unsubUserWithRef();
      unsubs.forEach((unsub) => unsub());
    };
  }, [uid]);

  return dot;
}

/**
 * Mark transactions as seen (call when transactions tab comes into focus)
 */
export async function markTransactionsSeen(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    logger.warn('markTransactionsSeen called but user is not authenticated');
    return;
  }

  try {
    const fns = getFunctions(app, "southamerica-east1");
    const markAsSeen = httpsCallable<{ type: "messages" | "reservations" | "payments" | "interactions" }, { ok: true }>(fns, "markAsSeen");
    // Zera reservas e pagamentos ao focar a tela de transações
    await Promise.all([
      markAsSeen({ type: "reservations" }),
      markAsSeen({ type: "payments" }),
    ]);
    logger.debug('Marked transactions counters as seen', { uid, timestamp: new Date().toISOString() });
  } catch (error) {
    logger.error('Failed to mark transactions as seen', error, { uid });
  }
}

