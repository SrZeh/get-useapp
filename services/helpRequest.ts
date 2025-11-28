/**
 * Help Request Service
 * 
 * Service for managing help requests (Socorro!)
 */

import { auth, db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type QuerySnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import type { 
  HelpRequest, 
  CreateHelpRequestInput, 
  HelpRequestDocument 
} from '@/types/helpRequest';
import { calculateExpirationTime } from '@/utils/helpRequest';

const HELP_REQUESTS_COLLECTION = FIRESTORE_COLLECTIONS.HELP_REQUESTS;

/**
 * Transform Firestore document to HelpRequest
 */
function transformDocument(docSnap: DocumentData): HelpRequest {
  const data = docSnap.data();
  // Compatibilidade: se neighborhood for string, converter para array
  const neighborhood = Array.isArray(data.neighborhood)
    ? data.neighborhood
    : data.neighborhood
    ? [data.neighborhood]
    : [];
  
  return {
    id: docSnap.id,
    requesterUid: data.requesterUid,
    message: data.message,
    urgencyType: data.urgencyType,
    neighborhood,
    city: data.city,
    status: data.status || 'active',
    createdAt: data.createdAt,
    expiresAt: data.expiresAt,
    offeredItems: data.offeredItems || [],
    selectedItemId: data.selectedItemId,
    resolvedViaMessage: data.resolvedViaMessage,
    resolvedAt: data.resolvedAt,
  };
}

/**
 * Create a new help request
 */
export async function createHelpRequest(
  input: CreateHelpRequestInput
): Promise<{ id: string }> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Usuário não autenticado');
  }

  const expirationTime = calculateExpirationTime(input.urgencyType);
  
  // Preparar dados exatamente como items e reservations fazem
  const helpRequestData = {
    requesterUid: uid,
    message: input.message.trim(),
    urgencyType: input.urgencyType,
    neighborhood: input.neighborhood.map((n) => n.trim()).filter((n) => n.length > 0),
    city: input.city?.trim() || null,
    status: 'active' as const,
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expirationTime),
    offeredItems: [] as string[],
    resolvedViaMessage: false,
  };

  // Usar exatamente o mesmo padrão dos outros serviços que funcionam
  try {
    console.log('[createHelpRequest] Tentando criar documento...');
    console.log('[createHelpRequest] Database app name:', db.app.name);
    // @ts-ignore - _databaseId é uma propriedade interna
    const dbId = db._databaseId?.databaseId || 'unknown';
    console.log('[createHelpRequest] Database ID:', dbId);
    console.log('[createHelpRequest] Collection:', HELP_REQUESTS_COLLECTION);
    console.log('[createHelpRequest] Data keys:', Object.keys(helpRequestData));
    
    if (dbId !== 'appdb') {
      throw new Error(`Database incorreto! Está usando "${dbId}" ao invés de "appdb". Recarregue a página.`);
    }
    
    const collectionRef = collection(db, HELP_REQUESTS_COLLECTION);
    console.log('[createHelpRequest] Collection ref criada, chamando addDoc...');
    
    // Timeout de 15 segundos
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        console.error('[createHelpRequest] ⏱️ TIMEOUT após 15 segundos!');
        reject(new Error('Timeout: addDoc demorou mais de 15 segundos. Verifique se as regras de segurança foram deployadas para o database "appdb".'));
      }, 15000);
    });
    
    const addDocPromise = addDoc(collectionRef, helpRequestData);
    
    console.log('[createHelpRequest] Aguardando Promise.race...');
    const docRef = await Promise.race([addDocPromise, timeoutPromise]);
    
    console.log('[createHelpRequest] ✅ Sucesso! ID:', docRef.id);
    return { id: docRef.id };
  } catch (error: any) {
    console.error('[createHelpRequest] ❌ Erro detalhado:', error);
    console.error('[createHelpRequest] Código:', error?.code);
    console.error('[createHelpRequest] Mensagem:', error?.message);
    console.error('[createHelpRequest] Stack:', error?.stack);
    
    if (error?.code === 'permission-denied') {
      throw new Error('Permissão negada. Verifique se as regras de segurança do Firestore foram deployadas para o database "appdb". Execute: firebase deploy --only firestore:rules');
    }
    
    if (error?.message?.includes('Timeout') || error?.message?.includes('demorou')) {
      throw new Error('A operação demorou muito. Pode ser que as regras de segurança ainda não foram aplicadas ou o database está incorreto. Recarregue a página e tente novamente.');
    }
    
    if (error?.message?.includes('Database incorreto')) {
      throw error; // Re-throw o erro de database incorreto
    }
    
    throw new Error(`Erro ao criar pedido de ajuda: ${error?.message || 'Erro desconhecido'}`);
  }
}

/**
 * Get a help request by ID
 */
export async function getHelpRequest(id: string): Promise<HelpRequest | null> {
  const docRef = doc(db, HELP_REQUESTS_COLLECTION, id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  
  return transformDocument(docSnap);
}

/**
 * Get active help requests (not expired, not fulfilled, not cancelled)
 */
export async function getActiveHelpRequests(
  neighborhood?: string,
  city?: string
): Promise<HelpRequest[]> {
  const now = Timestamp.now();
  
  let q = query(
    collection(db, HELP_REQUESTS_COLLECTION),
    where('status', '==', 'active'),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'asc'),
    limit(50)
  );

  // If neighborhood filter, add it
  if (neighborhood) {
    q = query(
      collection(db, HELP_REQUESTS_COLLECTION),
      where('status', '==', 'active'),
      where('expiresAt', '>', now),
      where('neighborhood', '==', neighborhood),
      orderBy('expiresAt', 'asc'),
      limit(50)
    );
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(transformDocument);
}

/**
 * Subscribe to active help requests
 * Filters by neighborhoods if provided (shows requests that include any of the selected neighborhoods)
 */
export function subscribeToActiveHelpRequests(
  callback: (requests: HelpRequest[]) => void,
  neighborhoods?: string[]
): () => void {
  const now = Timestamp.now();
  
  let q = query(
    collection(db, HELP_REQUESTS_COLLECTION),
    where('status', '==', 'active'),
    where('expiresAt', '>', now),
    orderBy('expiresAt', 'asc'),
    limit(50)
  );

  // If neighborhoods filter, filter in client (Firestore doesn't support array-contains-any with orderBy easily)
  // We'll fetch all active requests and filter by neighborhoods in the callback
  const filterNeighborhoods = neighborhoods && neighborhoods.length > 0;

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    let requests = snapshot.docs.map(transformDocument);
    
    // Filter by neighborhoods if provided
    if (filterNeighborhoods) {
      requests = requests.filter((req) => {
        // Check if any of the request's neighborhoods match any of the selected neighborhoods
        return req.neighborhood.some((n) => neighborhoods!.includes(n));
      });
    }
    
    callback(requests);
  });
}

/**
 * Offer an item to a help request
 */
export async function offerItemToHelpRequest(
  helpRequestId: string,
  itemId: string
): Promise<void> {
  const helpRequestRef = doc(db, HELP_REQUESTS_COLLECTION, helpRequestId);
  const helpRequestSnap = await getDoc(helpRequestRef);
  
  if (!helpRequestSnap.exists()) {
    throw new Error('Pedido de ajuda não encontrado');
  }
  
  const data = helpRequestSnap.data();
  const offeredItems = data.offeredItems || [];
  
  // Don't add if already offered
  if (offeredItems.includes(itemId)) {
    return;
  }
  
  await updateDoc(helpRequestRef, {
    offeredItems: [...offeredItems, itemId],
    updatedAt: serverTimestamp(),
  });
}

/**
 * Mark help request as fulfilled
 */
export async function fulfillHelpRequest(
  helpRequestId: string,
  itemId?: string,
  resolvedViaMessage?: boolean
): Promise<void> {
  const helpRequestRef = doc(db, HELP_REQUESTS_COLLECTION, helpRequestId);
  
  await updateDoc(helpRequestRef, {
    status: 'fulfilled',
    selectedItemId: itemId,
    resolvedViaMessage: resolvedViaMessage || false,
    resolvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Cancel a help request
 */
export async function cancelHelpRequest(helpRequestId: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('Usuário não autenticado');
  }

  const helpRequestRef = doc(db, HELP_REQUESTS_COLLECTION, helpRequestId);
  const helpRequestSnap = await getDoc(helpRequestRef);
  
  if (!helpRequestSnap.exists()) {
    throw new Error('Pedido de ajuda não encontrado');
  }
  
  const data = helpRequestSnap.data();
  if (data.requesterUid !== uid) {
    throw new Error('Você não tem permissão para cancelar este pedido');
  }
  
  await updateDoc(helpRequestRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}

