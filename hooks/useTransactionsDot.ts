// hooks/useTransactionsDot.ts
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  setDoc,
  serverTimestamp,
  type DocumentData,
  type QuerySnapshot,
  type Timestamp,
} from "firebase/firestore";
import { logger } from "@/utils/logger";

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

  useEffect(() => {
    if (!uid) {
      setDot(false);
      return;
    }

    // Observe user's lastTransactionsSeenAt timestamp
    const userRef = doc(db, "users", uid);
    let lastSeenMs: number | null | undefined = undefined;

    const unsubUser = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) {
          lastSeenMs = null;
          return;
        }

        const data = snap.data();
        const lastSeen = data?.lastTransactionsSeenAt;
        
        if (lastSeen && typeof lastSeen === 'object' && 'toMillis' in lastSeen) {
          const timestamp = lastSeen as Timestamp;
          lastSeenMs = timestamp.toMillis();
        } else {
          lastSeenMs = null;
        }
      },
      (err) => {
        logger.error('Failed to subscribe to user lastTransactionsSeenAt', err, { uid });
      }
    );

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
        (snap) => setDot((prev) => hasNewSince(snap, lastSeenMs) || prev),
        (err) => {
          logger.warn('Failed to subscribe to owner reservations', { uid, error: err });
        }
      ),
      onSnapshot(
        qRenter,
        (snap) => setDot((prev) => hasNewSince(snap, lastSeenMs) || prev),
        (err) => {
          logger.warn('Failed to subscribe to renter reservations', { uid, error: err });
        }
      ),
    ];

    return () => {
      unsubUser();
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
  if (!uid) return;

  try {
    await setDoc(
      doc(db, "users", uid),
      { lastTransactionsSeenAt: serverTimestamp() },
      { merge: true }
    );
    logger.debug('Marked transactions as seen', { uid });
  } catch (error) {
    logger.error('Failed to mark transactions as seen', error, { uid });
  }
}
