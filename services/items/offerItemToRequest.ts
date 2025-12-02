/**
 * Offer Item to Request
 * 
 * Service to offer a user's item to help a request (socorro)
 * Creates a special reservation so it appears in "Ajuda Recebida!" section
 */

import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { callCloudFunction } from '@/services/cloudFunctions';

const ITEMS_PATH = FIRESTORE_COLLECTIONS.ITEMS;

/**
 * Offer an item to help a request
 * @param requestItemId - The request item ID (itemType === 'request')
 * @param offeredItemId - The item ID being offered to help
 * @returns Success status
 */
export async function offerItemToRequest(
  requestItemId: string,
  offeredItemId: string
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Usuário não autenticado');
  }

  // Verify that the offered item belongs to the current user
  const offeredItemRef = doc(db, ITEMS_PATH, offeredItemId);
  const offeredItemDoc = await getDoc(offeredItemRef);
  
  if (!offeredItemDoc.exists()) {
    throw new Error('Item oferecido não encontrado');
  }
  
  const offeredItemData = offeredItemDoc.data();
  if (offeredItemData.ownerUid !== uid) {
    throw new Error('Você só pode oferecer seus próprios itens');
  }

  // Verify that the request item is actually a request
  const requestItemRef = doc(db, ITEMS_PATH, requestItemId);
  const requestItemDoc = await getDoc(requestItemRef);
  
  if (!requestItemDoc.exists()) {
    throw new Error('Pedido de ajuda não encontrado');
  }
  
  const requestItemData = requestItemDoc.data();
  if (requestItemData.itemType !== 'request') {
    throw new Error('Este item não é um pedido de ajuda');
  }

  // Check if item is already offered
  const currentOfferedItems = requestItemData.offeredItems || [];
  if (currentOfferedItems.includes(offeredItemId)) {
    throw new Error('Este item já foi oferecido para este pedido');
  }

  // Use Cloud Function to update (bypasses Firestore security rules)
  try {
    console.log('[offerItemToRequest] Chamando Cloud Function offerItemToRequest:', {
      requestItemId,
      offeredItemId,
      currentOfferedItems,
    });
    
    const result = await callCloudFunction<{ requestItemId: string; offeredItemId: string }, { ok: boolean; reservationId: string; requestItemId: string; offeredItemId: string }>(
      'offerItemToRequest',
      { requestItemId, offeredItemId }
    );
    
    console.log('[offerItemToRequest] ✅ Cloud Function concluída:', result);
    
    console.log('[offerItemToRequest] ✅ Item oferecido e reserva especial criada com sucesso!');
    console.log('[offerItemToRequest] ✅ Detalhes:', {
      reservationId: result.reservationId,
      requestItemId: result.requestItemId,
      offeredItemId: result.offeredItemId,
    });
  } catch (e) {
    console.error('[offerItemToRequest] Erro ao chamar Cloud Function:', e);
    throw e;
  }
}

