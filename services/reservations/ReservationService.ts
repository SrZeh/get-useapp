/**
 * Reservation Service
 * 
 * Provides CRUD operations and business logic for reservations.
 * Wraps Firestore operations with consistent error handling.
 */

import { auth, db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import type { Reservation, ReservationStatus, NewReservationInput } from '@/types';
import { logger } from '@/utils';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';

const RESERVATIONS_PATH = FIRESTORE_COLLECTIONS.RESERVATIONS || 'reservations';

/**
 * Create a new reservation
 * @param input - Reservation input data
 * @returns Created reservation ID
 */
export async function createReservation(input: NewReservationInput): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Usuário não autenticado');

  if (input.renterUid !== uid) {
    throw new Error('Você só pode criar reservas para si mesmo');
  }

  const reservationData = {
    ...input,
    status: 'requested' as ReservationStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, RESERVATIONS_PATH), reservationData);
  return ref.id;
}

/**
 * Get a reservation by ID
 * @param reservationId - Reservation ID
 * @returns Reservation or null if not found
 */
export async function getReservation(reservationId: string): Promise<Reservation | null> {
  const snap = await getDoc(doc(db, RESERVATIONS_PATH, reservationId));
  if (!snap.exists()) {
    return null;
  }
  return { id: snap.id, ...(snap.data() as Partial<Reservation>) } as Reservation;
}

/**
 * List reservations for a specific owner
 * @param ownerUid - Owner user ID
 * @param statusFilter - Optional status filter
 * @returns Array of reservations
 */
export async function listOwnerReservations(
  ownerUid: string,
  statusFilter?: ReservationStatus[]
): Promise<Reservation[]> {
  let q = query(
    collection(db, RESERVATIONS_PATH),
    where('itemOwnerUid', '==', ownerUid),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);
  const reservations = snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Partial<Reservation>) } as Reservation)
  );

  if (statusFilter && statusFilter.length > 0) {
    return reservations.filter((r) => statusFilter.includes(r.status));
  }

  return reservations;
}

/**
 * List reservations for a specific renter
 * @param renterUid - Renter user ID
 * @returns Array of reservations
 */
export async function listRenterReservations(renterUid: string): Promise<Reservation[]> {
  const q = query(
    collection(db, RESERVATIONS_PATH),
    where('renterUid', '==', renterUid),
    orderBy('createdAt', 'desc')
  );

  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Partial<Reservation>) } as Reservation)
  );
}

/**
 * List eligible reservations for review (completed reservations)
 * @param renterUid - Renter user ID
 * @param itemId - Item ID
 * @returns Array of eligible reservations with labels
 */
export async function listEligibleReservationsForReview(
  renterUid: string,
  itemId: string
): Promise<Array<{ id: string; label: string; itemOwnerUid: string; renterUid: string }>> {
  const q = query(
    collection(db, RESERVATIONS_PATH),
    where('renterUid', '==', renterUid),
    where('itemId', '==', itemId),
    where('status', 'in', ['returned', 'closed'])
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const r = d.data() as { startDate?: string; endDate?: string; itemOwnerUid?: string; renterUid?: string };
    const dateLabel = r.startDate && r.endDate ? `(${r.startDate} → ${r.endDate})` : '';
    return {
      id: d.id,
      label: `#${d.id.slice(0, 6)} ${dateLabel}`,
      itemOwnerUid: String(r.itemOwnerUid ?? ''),
      renterUid: String(r.renterUid ?? ''),
    };
  });
}

export async function listEligibleReservationsForUserReview(
  uid: string,
  role: 'renter' | 'owner'
): Promise<Array<{ id: string; label: string; itemOwnerUid: string; renterUid: string }>> {
  const q = query(
    collection(db, RESERVATIONS_PATH),
    where(role === 'renter' ? 'renterUid' : 'itemOwnerUid', '==', uid),
    where('status', 'in', ['returned', 'closed'])
  );
  const snap = await getDocs(q);

  return snap.docs.map((d) => {
    const r = d.data() as {
      startDate?: string;
      endDate?: string;
      itemOwnerUid?: string;
      renterUid?: string;
    };
    const dateLabel = r.startDate && r.endDate ? `(${r.startDate} → ${r.endDate})` : '';
    return {
      id: d.id,
      label: `#${d.id.slice(0, 6)} ${dateLabel}`,
      itemOwnerUid: String(r.itemOwnerUid ?? ''),
      renterUid: String(r.renterUid ?? ''),
    };
  });
}

/**
 * Subscribe to owner reservations with real-time updates
 * @param ownerUid - Owner user ID
 * @param statusFilter - Optional status filter
 * @param callback - Callback function for updates
 * @returns Unsubscribe function
 */
export function subscribeToOwnerReservations(
  ownerUid: string,
  callback: (reservations: Reservation[]) => void,
  statusFilter?: ReservationStatus[]
): Unsubscribe {
  const q = query(
    collection(db, RESERVATIONS_PATH),
    where('itemOwnerUid', '==', ownerUid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const all = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Partial<Reservation>) } as Reservation)
      );

      if (statusFilter && statusFilter.length > 0) {
        const filtered = all.filter((r) => statusFilter.includes(r.status));
        callback(filtered);
      } else {
        callback(all);
      }
    },
    (err) => logger.error('Owner reservations snapshot listener error', err, { code: err?.code, message: err?.message })
  );
}

/**
 * Subscribe to renter reservations with real-time updates
 * @param renterUid - Renter user ID
 * @param callback - Callback function for updates
 * @returns Unsubscribe function
 */
export function subscribeToRenterReservations(
  renterUid: string,
  callback: (reservations: Reservation[]) => void
): Unsubscribe {
  const q = query(
    collection(db, RESERVATIONS_PATH),
    where('renterUid', '==', renterUid),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(
    q,
    (snap) => {
      const reservations = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Partial<Reservation>) } as Reservation)
      );
      callback(reservations);
    },
    (err) => logger.error('Renter reservations snapshot listener error', err, { code: err?.code, message: err?.message })
  );
}

/**
 * Accept a reservation (owner action)
 * @param reservationId - Reservation ID
 * @param ownerUid - Owner user ID
 */
export async function acceptReservation(reservationId: string, ownerUid: string): Promise<void> {
  await updateDoc(doc(db, RESERVATIONS_PATH, reservationId), {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
    acceptedBy: ownerUid,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reject a reservation (owner action)
 * @param reservationId - Reservation ID
 * @param ownerUid - Owner user ID
 * @param reason - Optional rejection reason
 */
export async function rejectReservation(
  reservationId: string,
  ownerUid: string,
  reason?: string
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status: 'rejected',
    rejectedAt: serverTimestamp(),
    rejectedBy: ownerUid,
    updatedAt: serverTimestamp(),
  };

  if (reason) {
    updateData.rejectReason = reason.slice(0, 300);
  }

  await updateDoc(doc(db, RESERVATIONS_PATH, reservationId), updateData);
}

/**
 * Delete a reservation
 * @param reservationId - Reservation ID
 */
export async function deleteReservation(reservationId: string): Promise<void> {
  await deleteDoc(doc(db, RESERVATIONS_PATH, reservationId));
}

/**
 * Update reservation status
 * @param reservationId - Reservation ID
 * @param status - New status
 * @param additionalData - Optional additional fields to update
 */
export async function updateReservationStatus(
  reservationId: string,
  status: ReservationStatus,
  additionalData?: Record<string, unknown>
): Promise<void> {
  const updateData: Record<string, unknown> = {
    status,
    updatedAt: serverTimestamp(),
    ...additionalData,
  };

  await updateDoc(doc(db, RESERVATIONS_PATH, reservationId), updateData);
}

