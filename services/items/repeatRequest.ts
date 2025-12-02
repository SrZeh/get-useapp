/**
 * Repeat Request
 * 
 * Service to republish a request with new expiration time
 */

import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp, getDoc, Timestamp } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { isUnavailable, restPatchItem } from './ItemRestClient';
import type { Item } from '@/types';

const ITEMS_PATH = FIRESTORE_COLLECTIONS.ITEMS;

/**
 * Repeat a request (republish with new expiration time)
 * @param itemId - The request item ID
 * @returns Success status
 */
export async function repeatRequest(itemId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Usuário não autenticado');
  }

  // Get the request item
  const requestItemRef = doc(db, ITEMS_PATH, itemId);
  const requestItemDoc = await getDoc(requestItemRef);
  
  if (!requestItemDoc.exists()) {
    throw new Error('Pedido de ajuda não encontrado');
  }
  
  const requestItemData = requestItemDoc.data();
  if (requestItemData.ownerUid !== uid) {
    throw new Error('Você só pode repetir seus próprios pedidos');
  }

  if (requestItemData.itemType !== 'request') {
    throw new Error('Este item não é um pedido de ajuda');
  }

  // Calculate new expiration time based on urgencyType
  const urgencyType = requestItemData.urgencyType || 'planned';
  const now = new Date();
  const expiration = new Date(now);
  
  if (urgencyType === 'immediate') {
    expiration.setHours(expiration.getHours() + 1);
  } else {
    expiration.setDate(expiration.getDate() + 7);
  }
  
  const expiresAt = Timestamp.fromDate(expiration);

  // Update the request item
  const updateData = {
    published: true,
    available: true,
    expiresAt: expiresAt,
    updatedAt: serverTimestamp(),
  };

  try {
    await updateDoc(requestItemRef, updateData);
  } catch (e) {
    if (!isUnavailable(e)) throw e;
    
    // Fallback to REST API
    await restPatchItem(itemId, updateData);
  }
}

