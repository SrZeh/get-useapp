/**
 * useAllConversations - Hook to fetch all conversations (threads + reservations with messages)
 * 
 * Returns:
 * - Threads: conversations between users (not related to reservations)
 * - Reservations: conversations within reservations
 */

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { 
  collection,
  query, 
  where, 
  orderBy, 
  getDocs,
  limit,
} from 'firebase/firestore';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { logger } from '@/utils';
import { getUserThreads } from '@/services/cloudFunctions';
import { useUserProfileStore } from '@/stores/userProfileStore';
import type { FirestoreTimestamp } from '@/types';

export type ConversationType = 'thread' | 'reservation';

export interface Conversation {
  id: string;
  type: ConversationType;
  title: string;
  lastMessage?: string;
  lastMessageAt?: FirestoreTimestamp;
  unreadCount: number;
  // Para threads
  otherUserUid?: string;
  itemId?: string;
  // Para reservations
  reservationId?: string;
  itemTitle?: string;
}

export function useAllConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const getProfile = useUserProfileStore((state) => state.getProfile);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setConversations([]);
      setLoading(false);
      return;
    }

    let alive = true;
    const unsubscribers: (() => void)[] = [];

    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar threads do usuário via Cloud Function
        let threads: Conversation[] = [];
        try {
          const threadsData = await getUserThreads();
          
          // Buscar nomes dos outros usuários
          const threadPromises = threadsData.map(async (threadData) => {
            let title = 'Usuário';
            try {
              const profile = await getProfile(threadData.otherUserUid);
              if (profile?.displayName) {
                title = profile.displayName;
              } else if (profile?.name) {
                title = profile.name.trim().split(/\s+/)[0];
              } else if (profile?.email) {
                title = profile.email.split('@')[0];
              }
            } catch (err) {
              logger.error('Error fetching profile for thread', err);
            }

            return {
              id: threadData.threadId,
              type: 'thread' as ConversationType,
              title,
              lastMessage: threadData.lastMessage?.text,
              lastMessageAt: threadData.lastMessage?.createdAt,
              unreadCount: threadData.unreadCount || 0,
              otherUserUid: threadData.otherUserUid,
              itemId: threadData.itemId,
            } as Conversation;
          });

          threads = (await Promise.all(threadPromises)).filter(
            (t): t is Conversation => t !== null
          );
        } catch (err: any) {
          logger.error('Error fetching threads', err);
          // Se for erro de função não encontrada, apenas loga e continua (threads são opcionais)
          // Se for outro erro, também continua (não quebra a página)
          if (err?.code === 'functions/not-found' || err?.message?.includes('CORS') || err?.code === 'functions/internal') {
            logger.warn('getUserThreads function not deployed yet, skipping threads');
          }
          // Continua mesmo se threads falharem - mostra apenas reservas
        }

        // 2. Buscar reservas com mensagens (usando o mesmo padrão que já funciona)
        const reservationsOwnerQuery = query(
          collection(db, FIRESTORE_COLLECTIONS.RESERVATIONS),
          where('itemOwnerUid', '==', uid)
        );

        const reservationsRenterQuery = query(
          collection(db, FIRESTORE_COLLECTIONS.RESERVATIONS),
          where('renterUid', '==', uid)
        );

        const [ownerSnap, renterSnap] = await Promise.all([
          getDocs(reservationsOwnerQuery),
          getDocs(reservationsRenterQuery),
        ]);

        const allReservationIds = new Set<string>();
        ownerSnap.docs.forEach(d => allReservationIds.add(d.id));
        renterSnap.docs.forEach(d => allReservationIds.add(d.id));

        // Verificar quais reservas têm mensagens
        const reservationPromises = Array.from(allReservationIds).map(async (reservationId) => {
          try {
            const messagesRef = collection(
              db,
              FIRESTORE_COLLECTIONS.RESERVATIONS,
              reservationId,
              'messages'
            );
            const messagesQuery = query(messagesRef, orderBy('createdAt', 'desc'), limit(1));
            const messagesSnap = await getDocs(messagesQuery);

            if (messagesSnap.empty) return null; // Sem mensagens

            const lastMsg = messagesSnap.docs[0]?.data();
            const reservationDoc = ownerSnap.docs.find(d => d.id === reservationId) || 
                                 renterSnap.docs.find(d => d.id === reservationId);
            
            if (!reservationDoc) return null;

            const reservationData = reservationDoc.data();
            
            // Determinar título: itemTitle > nome público do outro usuário > 'Item'
            let title = 'Item'; // Fallback padrão
            const itemTitle = reservationData.itemTitle?.trim();
            
            if (itemTitle) {
              // Se tem título do anúncio, usa ele
              title = itemTitle;
            } else {
              // Se não tem título, usa o nome público do outro usuário
              // Determinar qual é o outro usuário (owner ou renter)
              const isOwner = reservationData.itemOwnerUid === uid;
              const otherUserUid = isOwner 
                ? reservationData.renterUid 
                : reservationData.itemOwnerUid;
              
              if (otherUserUid) {
                try {
                  const profile = await getProfile(otherUserUid);
                  if (profile?.displayName) {
                    title = profile.displayName;
                  } else if (profile?.name) {
                    title = profile.name.trim().split(/\s+/)[0];
                  } else if (profile?.email) {
                    title = profile.email.split('@')[0];
                  }
                } catch (err) {
                  logger.error('Error fetching profile for reservation title', err, { reservationId, otherUserUid });
                  // Mantém 'Item' como fallback
                }
              }
            }

            return {
              id: reservationId,
              type: 'reservation' as ConversationType,
              title,
              lastMessage: lastMsg?.text,
              lastMessageAt: lastMsg?.createdAt,
              unreadCount: 0, // Reservas não têm unreadCount separado
              reservationId,
              itemTitle: itemTitle || undefined,
            } as Conversation;
          } catch (err) {
            logger.error('Error checking reservation messages', err, { reservationId });
            return null;
          }
        });

        const reservations = (await Promise.all(reservationPromises)).filter(
          (r): r is Conversation => r !== null
        );

        // Combinar threads e reservas, ordenar por última mensagem
        const all = [...threads, ...reservations].sort((a, b) => {
          const aTime = a.lastMessageAt?.toMillis?.() || 0;
          const bTime = b.lastMessageAt?.toMillis?.() || 0;
          return bTime - aTime;
        });

        if (alive) {
          setConversations(all);
          setLoading(false);
        }
      } catch (err) {
        logger.error('Error in fetchConversations', err);
        if (alive) {
          setError(err instanceof Error ? err : new Error('Erro ao carregar conversas'));
          setLoading(false);
        }
      }
    };

    fetchConversations();

    return () => {
      alive = false;
      unsubscribers.forEach(unsub => unsub());
    };
  }, [getProfile, refreshKey]);

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { conversations, loading, error, refresh };
}

