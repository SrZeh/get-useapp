/**
 * Review Service
 * 
 * Provides CRUD operations for item reviews.
 * Handles review creation, fetching, and rating aggregation.
 */

import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import type {
  Review,
  NewItemReviewInput,
  NewUserReviewInput,
  UserReview,
  ReviewParticipantRole,
} from '@/types';
import { logger } from '@/utils';
import { isValidRating } from '@/types/review';
import { createUserReview as createUserReviewCF } from '@/services/cloudFunctions';

/**
 * Create a new review for an item
 * @param itemId - Item ID
 * @param input - Review input data
 * @returns Created review ID
 */
export async function createItemReview(itemId: string, input: NewItemReviewInput): Promise<string> {
  console.log('[ReviewService] createItemReview called', { itemId, reservationId: input.reservationId, renterUid: input.renterUid });
  
  if (!isValidRating(input.rating)) {
    throw new Error('Rating deve ser entre 1 e 5');
  }

  const trimmedComment = input.comment?.trim();
  if (input.rating <= 2 && (!trimmedComment || trimmedComment.length === 0)) {
    throw new Error('Para notas 1 ou 2, explique o motivo no comentário.');
  }

  // Verify reservation exists and is accessible
  const reservationRef = doc(db, 'reservations', input.reservationId);
  const reservationSnap = await getDoc(reservationRef);
  if (!reservationSnap.exists()) {
    throw new Error('Reserva não encontrada.');
  }
  const reservation = reservationSnap.data();
  console.log('[ReviewService] Reservation status:', reservation?.status, 'renterUid:', reservation?.renterUid, 'itemId:', reservation?.itemId);
  
  if (reservation?.status !== 'returned' && reservation?.status !== 'closed') {
    throw new Error(`Reserva precisa estar devolvida para avaliar. Status atual: ${reservation?.status ?? 'desconhecido'}`);
  }
  
  if (reservation?.renterUid !== input.renterUid) {
    throw new Error('Você não é o locatário desta reserva.');
  }
  
  if (reservation?.itemId !== itemId) {
    throw new Error('Item da reserva não corresponde.');
  }

  const reservationReviewRef = doc(db, 'items', itemId, 'reviews', input.reservationId);
  const existingReview = await getDoc(reservationReviewRef);
  if (existingReview.exists()) {
    throw new Error('Você já avaliou esta reserva.');
  }

  // Create review document
  const reviewData = {
    renterUid: input.renterUid,
    reservationId: input.reservationId,
    itemId: input.itemId ?? itemId,
    itemOwnerUid: input.itemOwnerUid,
    type: 'item' as const,
    rating: input.rating,
    comment: trimmedComment ?? '',
    createdAt: serverTimestamp(),
  };

  console.log('[ReviewService] Creating review document:', reviewData);
  try {
    await setDoc(reservationReviewRef, reviewData, { merge: false });
    console.log('[ReviewService] Review created successfully');
  } catch (error: any) {
    console.error('[ReviewService] Error creating review:', error);
    if (error?.code === 'permission-denied') {
      throw new Error('Permissão negada. Verifique se a reserva está com status "returned" e se você é o locatário.');
    }
    throw error;
  }

  try {
    // Atualizar reviewsOpen e verificar se todas as avaliações foram feitas
    const reservationRef = doc(db, 'reservations', input.reservationId);
    const reservationSnapAfter = await getDoc(reservationRef);
    const reservationAfter = reservationSnapAfter.exists() ? reservationSnapAfter.data() : null;
    
    const reviewsOpen = reservationAfter?.reviewsOpen || {};
    const updatedReviewsOpen = { ...reviewsOpen, renterCanReviewItem: false };
    
    // Verificar se todas as avaliações foram feitas
    const allReviewsDone = 
      (updatedReviewsOpen.renterCanReviewOwner === false || updatedReviewsOpen.renterCanReviewOwner === undefined) &&
      (updatedReviewsOpen.renterCanReviewItem === false) &&
      (updatedReviewsOpen.ownerCanReviewRenter === false || updatedReviewsOpen.ownerCanReviewRenter === undefined);
    
    const updateData: Record<string, unknown> = {
      'reviewsOpen.renterCanReviewItem': false,
      updatedAt: serverTimestamp(),
    };
    
    // Se todas as avaliações foram feitas e status é returned, fechar automaticamente
    if (allReviewsDone && reservationAfter?.status === 'returned') {
      updateData.status = 'closed';
    }
    
    await updateDoc(reservationRef, updateData);
  } catch (error) {
    if (typeof logger.warn === 'function') {
      logger.warn('Não foi possível atualizar reviewsOpen da reserva após avaliação', error);
    } else {
      console.warn('Não foi possível atualizar reviewsOpen da reserva após avaliação', error);
    }
  }

  return reservationReviewRef.id;
}

/**
 * List reviews for an item
 * @param itemId - Item ID
 * @param limitCount - Maximum number of reviews to return
 * @returns Array of reviews
 */
export async function listItemReviews(itemId: string, limitCount: number = 20): Promise<Review[]> {
  const q = query(
    collection(db, 'items', itemId, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...(d.data() as Partial<Review>) } as Review)
  );
}

/**
 * Subscribe to item reviews with real-time updates
 * @param itemId - Item ID
 * @param callback - Callback function for updates
 * @param limitCount - Maximum number of reviews to return
 * @returns Unsubscribe function
 */
export function subscribeToItemReviews(
  itemId: string,
  callback: (reviews: Review[]) => void,
  limitCount: number = 20
): Unsubscribe {
  const q = query(
    collection(db, 'items', itemId, 'reviews'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snap) => {
      const reviews = snap.docs.map(
        (d) => ({ id: d.id, ...(d.data() as Partial<Review>) } as Review)
      );
      callback(reviews);
    },
    (err) => logger.error('Item reviews snapshot listener error', err, { code: err?.code, message: err?.message })
  );
}

/**
 * Create a review about a user (owner ⇄ renter)
 * Uses Cloud Function to bypass Firestore security rules
 * @param input - Review input data
 * @returns Created review ID (reservationId)
 */
export async function createUserReview(input: NewUserReviewInput): Promise<string> {
  const validation = validateUserReviewInput(input);
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Dados inválidos para avaliação.');
  }

  console.log('[ReviewService] createUserReview - START', {
    reservationId: input.reservationId,
    reviewerRole: input.reviewerRole,
    targetUid: input.targetUid,
    targetRole: input.targetRole,
    rating: input.rating,
    hasComment: !!input.comment,
    commentLength: input.comment?.length || 0,
  });

  try {
    console.log('[ReviewService] createUserReview - Calling Cloud Function...');
    // Use Cloud Function to create review (bypasses Firestore security rules)
    const result = await createUserReviewCF({
      reservationId: input.reservationId,
      reviewerRole: input.reviewerRole,
      targetUid: input.targetUid,
      targetRole: input.targetRole,
      rating: input.rating,
      comment: input.comment,
    });

    console.log('[ReviewService] User review created successfully via Cloud Function:', result);
    return result.reviewId;
  } catch (error: any) {
    console.error('[ReviewService] Error creating user review via Cloud Function:', {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      error: error,
      stack: error?.stack,
    });
    
    // Convert Cloud Function errors to user-friendly messages
    if (error?.code === 'unauthenticated') {
      throw new Error('Você precisa estar logado para criar avaliações.');
    }
    if (error?.code === 'permission-denied') {
      throw new Error(error?.message || 'Você não tem permissão para criar esta avaliação.');
    }
    if (error?.code === 'not-found') {
      throw new Error(error?.message || 'Reserva não encontrada.');
    }
    if (error?.code === 'failed-precondition') {
      throw new Error(error?.message || 'A reserva não está no status correto para avaliação.');
    }
    if (error?.code === 'already-exists') {
      throw new Error(error?.message || 'Você já avaliou esta reserva.');
    }
    if (error?.code === 'invalid-argument') {
      throw new Error(error?.message || 'Dados inválidos para avaliação.');
    }
    
    throw error;
  }
}

/**
 * Lista avaliações recebidas por um usuário
 */
export async function listUserReviews(targetUid: string, limitCount: number = 20): Promise<UserReview[]> {
  const q = query(
    collection(db, 'users', targetUid, 'reviewsReceived'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Partial<UserReview>) } as UserReview));
}

/**
 * Observa avaliações recebidas por um usuário
 */
export function subscribeToUserReviews(
  targetUid: string,
  callback: (reviews: UserReview[]) => void,
  limitCount: number = 20
): Unsubscribe {
  const q = query(
    collection(db, 'users', targetUid, 'reviewsReceived'),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snap) => {
      const reviews = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Partial<UserReview>) } as UserReview));
      callback(reviews);
    },
    (err) => logger.error('User reviews snapshot listener error', err, { code: err?.code, message: err?.message })
  );
}

/**
 * Validate review input before submission
 * @param input - Review input data
 * @returns Validation result with error message if invalid
 */
export function validateItemReviewInput(input: Partial<NewItemReviewInput>): {
  valid: boolean;
  error?: string;
} {
  if (!input.rating || !isValidRating(input.rating)) {
    return { valid: false, error: 'Rating deve ser de 1 a 5.' };
  }

  if (!input.reservationId) {
    return { valid: false, error: 'Reserva deve ser selecionada.' };
  }

  if (!input.renterUid) {
    return { valid: false, error: 'Usuário deve estar autenticado.' };
  }

  if (!input.itemOwnerUid) {
    return { valid: false, error: 'Não foi possível identificar o dono do item.' };
  }

  if (!input.itemId) {
    return { valid: false, error: 'Item inválido para avaliação.' };
  }

  const comment = input.comment?.trim();
  if (input.rating <= 2 && (!comment || comment.length === 0)) {
    return { valid: false, error: 'Para notas 1 ou 2, explique o motivo no comentário.' };
  }

  return { valid: true };
}

export function validateUserReviewInput(input: Partial<NewUserReviewInput>): {
  valid: boolean;
  error?: string;
} {
  if (!input.rating || !isValidRating(input.rating)) {
    return { valid: false, error: 'Rating deve ser de 1 a 5.' };
  }

  if (!input.reservationId) {
    return { valid: false, error: 'Reserva deve ser informada.' };
  }

  if (!input.reviewerUid) {
    return { valid: false, error: 'Usuário avaliador deve estar autenticado.' };
  }

  if (!input.reviewerRole || !isValidRole(input.reviewerRole)) {
    return { valid: false, error: 'Papel do avaliador inválido.' };
  }

  if (!input.targetUid) {
    return { valid: false, error: 'Usuário avaliado não identificado.' };
  }

  if (!input.targetRole || !isValidRole(input.targetRole)) {
    return { valid: false, error: 'Papel do avaliado inválido.' };
  }

  const comment = input.comment?.trim();
  if (input.rating <= 2 && (!comment || comment.length === 0)) {
    return { valid: false, error: 'Para notas 1 ou 2, explique o motivo no comentário.' };
  }

  return { valid: true };
}

function isValidRole(role: ReviewParticipantRole | undefined): role is ReviewParticipantRole {
  return role === 'owner' || role === 'renter';
}

