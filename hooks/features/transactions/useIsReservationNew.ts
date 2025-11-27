/**
 * useIsReservationNew - Hook to check if a specific reservation is new (unseen)
 * 
 * A reservation is considered "new" if:
 * - It requires action from the current user (owner: "requested", renter: "accepted")
 * - Its updatedAt timestamp is newer than the user's lastSeenAt.reservations
 * 
 * This is used to show notification badges on individual reservation cards.
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot, type Timestamp } from 'firebase/firestore';
import { logger } from '@/utils';
import type { Reservation } from '@/types';

/**
 * Check if a reservation is new based on last seen timestamp
 */
function isReservationNew(
  reservation: Reservation,
  lastSeenMs: number | null | undefined,
  viewerRole: 'owner' | 'renter'
): boolean {
  // Only show badge for reservations requiring action
  const requiresAction = viewerRole === 'owner' 
    ? reservation.status === 'requested'
    : reservation.status === 'accepted';
  
  if (!requiresAction) {
    return false;
  }

  // If never seen, show badge if reservation exists
  if (lastSeenMs === null || lastSeenMs === undefined) {
    return true;
  }

  // Check if reservation was updated after last seen
  const updatedAt = reservation.updatedAt;
  if (!updatedAt) {
    return false;
  }

  // Handle Firestore Timestamp
  if (typeof updatedAt === 'object' && 'toMillis' in updatedAt) {
    const timestamp = updatedAt as Timestamp;
    const reservationMs = timestamp.toMillis();
    const isNew = reservationMs > lastSeenMs;
    
    // Log for debugging
    if (isNew) {
      logger.debug('isReservationNew: reservation is new', {
        reservationId: reservation.id,
        reservationMs,
        lastSeenMs,
        diff: reservationMs - lastSeenMs,
        viewerRole,
        status: reservation.status,
      });
    }
    
    return isNew;
  }

  return false;
}

/**
 * Hook to check if a specific reservation is new (unseen)
 * 
 * @param reservation - The reservation to check
 * @param viewerRole - Role of the current viewer ('owner' or 'renter')
 * @returns true if the reservation is new and requires action
 */
export function useIsReservationNew(
  reservation: Reservation,
  viewerRole: 'owner' | 'renter'
): boolean {
  const uid = auth.currentUser?.uid ?? null;
  const [isNew, setIsNew] = useState(false);
  const lastSeenMsRef = useRef<number | null | undefined>(undefined);
  const reservationRef = useRef(reservation);
  const viewerRoleRef = useRef(viewerRole);

  // Update refs when props change
  useEffect(() => {
    reservationRef.current = reservation;
    viewerRoleRef.current = viewerRole;
  }, [reservation, viewerRole]);

  // Helper to recalculate
  const recalculate = useCallback(() => {
    const lastSeen = lastSeenMsRef.current;
    const currentReservation = reservationRef.current;
    const currentViewerRole = viewerRoleRef.current;
    const shouldShow = isReservationNew(currentReservation, lastSeen, currentViewerRole);
    setIsNew(shouldShow);
  }, []);

  useEffect(() => {
    if (!uid) {
      setIsNew(false);
      return;
    }

    // Observe user's lastSeenAt.reservations timestamp
    // This is updated by the markAsSeen cloud function when type="reservations"
    const userRef = doc(db, 'users', uid);

    const unsubUser = onSnapshot(
      userRef,
      (snap) => {
        if (!snap.exists()) {
          lastSeenMsRef.current = null;
          recalculate();
          return;
        }

        const data = snap.data();
        // Check both lastSeenAt.reservations (new) and lastTransactionsSeenAt (legacy) for compatibility
        const lastSeenAtObj = data?.lastSeenAt as Record<string, Timestamp> | undefined;
        const lastSeen = lastSeenAtObj?.reservations ?? data?.lastTransactionsSeenAt;
        
        let newLastSeenMs: number | null | undefined = undefined;
        if (lastSeen && typeof lastSeen === 'object' && 'toMillis' in lastSeen) {
          const timestamp = lastSeen as Timestamp;
          newLastSeenMs = timestamp.toMillis();
        } else {
          newLastSeenMs = null;
        }

        // Only update and recalculate if the value actually changed
        if (lastSeenMsRef.current !== newLastSeenMs) {
          lastSeenMsRef.current = newLastSeenMs;
          logger.debug('useIsReservationNew: lastSeenAt.reservations changed', {
            reservationId: reservationRef.current.id,
            lastSeenMs: newLastSeenMs,
            reservationUpdatedAt: reservationRef.current.updatedAt,
          });
          recalculate();
        }
      },
      (err) => {
        logger.error('Failed to subscribe to user lastSeenAt in useIsReservationNew', err, { uid });
        setIsNew(false);
      }
    );

    return () => unsubUser();
  }, [uid, recalculate]);

  // Recalculate when reservation changes
  useEffect(() => {
    recalculate();
  }, [reservation.id, reservation.status, reservation.updatedAt, viewerRole, recalculate]);

  return isNew;
}

