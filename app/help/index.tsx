/**
 * Help Requests List Screen
 * 
 * Lists active help requests from the community
 */

import { Button } from '@/components/Button';
import { ItemCard } from '@/components/features/items';
import { EmptyState } from '@/components/states';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { FIRESTORE_COLLECTIONS } from '@/constants/api';
import { Spacing } from '@/constants/spacing';
import { useItemList, useItemOperations, useUserItems } from '@/hooks/features/items';
import { useResponsive } from '@/hooks/useResponsive';
import { auth, db } from '@/lib/firebase';
import { useReservationService } from '@/providers/ServicesProvider';
import { callCloudFunction } from '@/services/cloudFunctions';
import { repeatRequest } from '@/services/items/repeatRequest';
import { useItemsStore } from '@/stores/itemsStore';
import type { Item, Reservation } from '@/types';
import { HapticFeedback, useThemeColors } from '@/utils';
import { isRequestExpired, isRequestItem } from '@/utils/itemRequest';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { doc, getDoc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * MyRequestCard - Component for displaying user's own request with offered items
 */
function MyRequestCard({
  item,
  colors,
  onGotIt,
  onNotGotIt,
  width,
  isProcessing,
}: {
  item: Item;
  colors: ReturnType<typeof useThemeColors>;
  onGotIt: (item: Item) => void;
  onNotGotIt: (item: Item) => void;
  width: number;
  isProcessing?: boolean;
}) {

  return (
    <View style={[styles.myRequestCard, { width }]}>
      <ItemCard
        item={item}
        width={width}
        isMine={true}
        cardSpacing={0}
      />
      <View style={styles.actionButtons}>
        <TouchableOpacity
          onPress={() => {
            if (isProcessing) return;
            console.log('[Button] Já consegui pressed for item:', item.id);
            onGotIt(item);
          }}
          disabled={isProcessing}
          style={[
            styles.actionButtonTouchable,
            { 
              backgroundColor: colors.semantic.success,
              opacity: isProcessing ? 0.5 : 1,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="thumbs-up" size={16} color="#fff" style={{ marginRight: 4 }} />
          <ThemedText type="body" style={{ color: '#fff', fontWeight: '600' }}>
            Já consegui
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            if (isProcessing) return;
            console.log('[Button] Não consegui pressed for item:', item.id);
            onNotGotIt(item);
          }}
          disabled={isProcessing}
          style={[
            styles.actionButtonTouchable,
            {
              backgroundColor: colors.card.bg,
              borderWidth: 1,
              borderColor: colors.border.default,
              opacity: isProcessing ? 0.5 : 1,
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={16} color={colors.text.primary} style={{ marginRight: 4 }} />
          <ThemedText type="body" style={{ color: colors.text.primary, fontWeight: '600' }}>
            Publicar novamente
          </ThemedText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function HelpRequestsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const me = auth.currentUser?.uid || null;
  const itemList = useItemList();
  const { items: userItems, refresh: refreshUserItems } = useUserItems();
  const { deleteItem } = useItemOperations();
  const invalidateItem = useItemsStore((state) => state.invalidateItem);
  const getItem = useItemsStore((state) => state.getItem);
  const reservationService = useReservationService();
  const { width: screenWidth } = useResponsive();
  
  // Prevent double-click on buttons
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  
  // Check if item is being processed
  const isProcessing = useCallback((itemId: string) => {
    return processingItems.has(itemId);
  }, [processingItems]);
  
  // Add item to processing set
  const setProcessing = useCallback((itemId: string, isProcessing: boolean) => {
    setProcessingItems(prev => {
      const next = new Set(prev);
      if (isProcessing) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  }, []);
  
  // Calculate consistent card width for horizontal scroll sections
  // Responsive but consistent across all three sections
  const horizontalCardWidth = useMemo(() => {
    if (screenWidth >= 1536) return 320; // 2xl - larger cards
    if (screenWidth >= 1280) return 300; // xl
    if (screenWidth >= 1024) return 280; // lg
    if (screenWidth >= 768) return 280;  // md/tablet
    return 280; // Mobile - fixed width for consistency
  }, [screenWidth]);
  
  const horizontalCardSpacing = Spacing.md;
  
  // Debug: Log reservationService on mount
  React.useEffect(() => {
    console.log('[HelpRequestsScreen] 🔍 ReservationService debug:', {
      service: reservationService,
      hasMethod: typeof reservationService?.subscribeToHelpOfferReservations === 'function',
      allMethods: Object.keys(reservationService || {}),
      constructor: reservationService?.constructor?.name,
    });
  }, [reservationService]);
  
  // State for help offer reservations (items offered to user's requests)
  const [helpOfferReservations, setHelpOfferReservations] = React.useState<Reservation[]>([]);
  const [helpOfferItems, setHelpOfferItems] = React.useState<Item[]>([]);
  const [loadingHelpOffers, setLoadingHelpOffers] = React.useState(true);
  // Track locally discarded reservations (for immediate UI feedback)
  const [discardedReservationIds, setDiscardedReservationIds] = React.useState<Set<string>>(new Set());
  // Ref to store active request IDs (to avoid re-subscriptions)
  const activeRequestIdsRef = React.useRef<Set<string>>(new Set());

  // Refresh data when screen mounts
  React.useEffect(() => {
    console.log('[HelpRequestsScreen] Screen mounted, refreshing data...');
    refreshUserItems();
    itemList.refresh();
  }, []); // Empty dependency array - only run on mount
  
  // Filter only request items that are not expired (community requests)
  const requestItems = itemList.filteredItems.filter(
    (item) => isRequestItem(item) && !isRequestExpired(item) && item.ownerUid !== me
  );

  // Filter user's own requests (including expired ones for "Meus Pedidos")
  const myRequests = userItems.filter(
    (item) => isRequestItem(item)
  );

  // State to track real-time updates of user's requests (for offeredItems)
  const [updatedRequests, setUpdatedRequests] = React.useState<Map<string, Item>>(new Map());

  // Subscribe to real-time updates for user's requests to get latest offeredItems
  React.useEffect(() => {
    if (myRequests.length === 0) {
      setUpdatedRequests(new Map());
      return;
    }

    console.log('[HelpRequestsScreen] Setting up real-time listeners for user requests:', myRequests.length);
    
    const unsubscribes: (() => void)[] = [];
    
    myRequests.forEach((request) => {
      const itemRef = doc(db, FIRESTORE_COLLECTIONS.ITEMS, request.id);
      const unsubscribe = onSnapshot(itemRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<Item>;
          // Explicitly preserve offeredItems array from Firestore
          // If it's an array (even empty), use it; otherwise use undefined
          // Process offeredItems from Firestore
          let processedOfferedItems: string[] | undefined;
          if (Array.isArray(data.offeredItems)) {
            // Firestore has an array - use it (filtered)
            processedOfferedItems = data.offeredItems.filter((id): id is string => typeof id === 'string' && id.trim().length > 0);
          } else if (data.offeredItems === null) {
            // Firestore explicitly has null - use empty array
            processedOfferedItems = [];
          } else {
            // Firestore has undefined or missing - preserve from original request
            processedOfferedItems = Array.isArray(request.offeredItems) ? request.offeredItems : undefined;
          }
          
          // Build updated item - preserve offeredItems explicitly
          const updatedItem: Item = {
            ...request,
            ...data,
            id: snapshot.id,
            // CRITICAL: Always use processedOfferedItems (never undefined unless both Firestore and request have undefined)
            offeredItems: processedOfferedItems,
          } as Item;
          
          console.log('[HelpRequestsScreen] Request updated:', {
            id: snapshot.id,
            offeredItems: updatedItem.offeredItems,
            offeredItemsCount: updatedItem.offeredItems?.length || 0,
            rawOfferedItems: data.offeredItems,
            rawOfferedItemsType: typeof data.offeredItems,
            rawOfferedItemsIsArray: Array.isArray(data.offeredItems),
            rawOfferedItemsValue: JSON.stringify(data.offeredItems),
            processedOfferedItems: processedOfferedItems,
            processedOfferedItemsValue: JSON.stringify(processedOfferedItems),
            requestOriginalOfferedItems: request.offeredItems,
          });
          
          // Update state using functional update to preserve other items
          setUpdatedRequests((prev) => {
            const newMap = new Map(prev);
            newMap.set(snapshot.id, updatedItem);
            console.log('[HelpRequestsScreen] Updated requests map size:', newMap.size);
            return newMap;
          });
          
          // Also invalidate cache to ensure consistency
          invalidateItem(snapshot.id);
        }
      }, (error) => {
        console.error('[HelpRequestsScreen] Error listening to request updates:', error);
      });
      
      unsubscribes.push(unsubscribe);
    });

    return () => {
      console.log('[HelpRequestsScreen] Cleaning up real-time listeners');
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [myRequests.map(r => r.id).join(','), invalidateItem]);

  // Merge real-time updates with userItems
  const myRequestsWithUpdates = React.useMemo(() => {
    const merged = myRequests.map((request) => {
      const updated = updatedRequests.get(request.id);
      
      // If we have an updated version, use it (it already has the correct offeredItems from listener)
      if (updated) {
        // Ensure offeredItems is preserved - updated should already have it from listener
        const result = {
          ...updated,
          // Double-check: if updated doesn't have offeredItems but request does, use request
          offeredItems: updated.offeredItems !== undefined
            ? updated.offeredItems
            : (request.offeredItems !== undefined ? request.offeredItems : undefined),
        };
        
        console.log('[HelpRequestsScreen] Merged request:', {
          id: result.id,
          hasUpdated: true,
          offeredItems: result.offeredItems,
          offeredItemsCount: result.offeredItems?.length || 0,
          requestOfferedItems: request.offeredItems,
          updatedOfferedItems: updated.offeredItems,
        });
        return result;
      }
      
      // No update, use original request
      console.log('[HelpRequestsScreen] Merged request (no update):', {
        id: request.id,
        hasUpdated: false,
        offeredItems: request.offeredItems,
        offeredItemsCount: request.offeredItems?.length || 0,
      });
      return request;
    });
    
    // Update ref with current active request IDs - only update if we have requests
    // This prevents clearing the ref when myRequests is temporarily empty during re-renders
    if (merged.length > 0) {
      activeRequestIdsRef.current = new Set(merged.map(r => r.id));
      console.log('[HelpRequestsScreen] Updated activeRequestIdsRef:', Array.from(activeRequestIdsRef.current));
    } else {
      // Only clear if we're sure there are no requests (not just during a re-render)
      // Keep the previous value to avoid race conditions
      console.log('[HelpRequestsScreen] myRequestsWithUpdates is empty, keeping previous activeRequestIdsRef:', Array.from(activeRequestIdsRef.current));
    }
    
    console.log('[HelpRequestsScreen] All merged requests:', merged.map(r => ({
      id: r.id,
      offeredItems: r.offeredItems,
      offeredItemsCount: r.offeredItems?.length || 0,
    })));
    return merged;
  }, [myRequests, updatedRequests]);

  // Collect all offered item IDs from user's requests (using updated requests)
  const allOfferedItemIds = useMemo(() => {
    const ids = new Set<string>();
    console.log('[HelpRequestsScreen] Collecting offered item IDs from myRequestsWithUpdates:', myRequestsWithUpdates.length);
    myRequestsWithUpdates.forEach((request) => {
      const offeredItems = request.offeredItems || [];
      console.log('[HelpRequestsScreen] Request:', {
        id: request.id,
        title: request.title,
        offeredItems: offeredItems,
        offeredItemsType: typeof offeredItems,
        offeredItemsIsArray: Array.isArray(offeredItems),
        offeredItemsLength: offeredItems.length,
      });
      if (Array.isArray(offeredItems) && offeredItems.length > 0) {
        offeredItems.forEach((id) => {
          if (typeof id === 'string' && id.trim().length > 0) {
            console.log('[HelpRequestsScreen] Adding offered item ID:', id);
            ids.add(id);
          } else {
            console.warn('[HelpRequestsScreen] Invalid offered item ID:', id, typeof id);
          }
        });
      }
    });
    const result = Array.from(ids);
    console.log('[HelpRequestsScreen] All offered item IDs collected:', {
      count: result.length,
      ids: result,
    });
    return result;
  }, [myRequestsWithUpdates]);

  // Update ref when myRequestsWithUpdates changes (separate effect to ensure timing)
  // Only update if we have requests to avoid clearing during re-renders
  React.useEffect(() => {
    if (myRequestsWithUpdates.length > 0) {
      activeRequestIdsRef.current = new Set(myRequestsWithUpdates.map(r => r.id));
      console.log('[HelpRequestsScreen] Updated activeRequestIdsRef via useEffect:', Array.from(activeRequestIdsRef.current));
    } else {
      console.log('[HelpRequestsScreen] myRequestsWithUpdates is empty in useEffect, keeping previous ref:', Array.from(activeRequestIdsRef.current));
    }
  }, [myRequestsWithUpdates]);

  // Subscribe to help offer reservations (where user is the owner - needs help)
  React.useEffect(() => {
    console.log('[HelpRequestsScreen] 🔵 useEffect for help offers triggered', { 
      me, 
      hasReservationService: !!reservationService,
      reservationServiceType: typeof reservationService,
      activeRequestIds: Array.from(activeRequestIdsRef.current),
    });
    
    if (!me) {
      console.log('[HelpRequestsScreen] No user ID, clearing help offers');
      setHelpOfferReservations([]);
      setHelpOfferItems([]);
      setLoadingHelpOffers(false);
      return;
    }

    if (!reservationService) {
      console.log('[HelpRequestsScreen] No reservationService yet, waiting...');
      return;
    }

    console.log('[HelpRequestsScreen] Subscribing to help offer reservations for user:', me);
    console.log('[HelpRequestsScreen] ReservationService check:', {
      hasSubscribeToHelpOfferReservations: typeof reservationService?.subscribeToHelpOfferReservations === 'function',
      reservationServiceType: typeof reservationService,
      reservationServiceKeys: Object.keys(reservationService || {}),
      reservationServiceConstructor: reservationService?.constructor?.name,
    });
    setLoadingHelpOffers(true);

    // Check if method exists
    if (typeof reservationService.subscribeToHelpOfferReservations !== 'function') {
      console.error('[HelpRequestsScreen] ❌ subscribeToHelpOfferReservations não existe no reservationService!');
      console.error('[HelpRequestsScreen] Available methods:', Object.keys(reservationService || {}));
      console.error('[HelpRequestsScreen] ReservationService:', reservationService);
      setLoadingHelpOffers(false);
      return;
    }

    console.log('[HelpRequestsScreen] ✅ Method exists, calling subscribeToHelpOfferReservations...');
    console.log('[HelpRequestsScreen] Current activeRequestIds before subscription:', Array.from(activeRequestIdsRef.current));
    
    // Use the new dedicated function for help offers
    const unsubscribe = reservationService.subscribeToHelpOfferReservations(
      me,
      (helpOffers: Reservation[]) => {
        console.log('[HelpRequestsScreen] Help offer reservations received:', {
          helpOffers: helpOffers.length,
          helpOffersData: helpOffers.map(r => ({
            id: r.id,
            itemId: r.itemId,
            itemTitle: r.itemTitle,
            renterUid: r.renterUid,
            helpRequestId: (r as Reservation & { helpRequestId?: string }).helpRequestId,
            isHelpOffer: (r as Reservation & { isHelpOffer?: boolean }).isHelpOffer,
          })),
        });
        
        // Get current active request IDs (use ref for latest value)
        const currentActiveRequestIds = activeRequestIdsRef.current;
        const currentDiscardedIds = discardedReservationIds;
        
        console.log('[HelpRequestsScreen] 📥 Help offer reservations callback received:', {
          totalHelpOffers: helpOffers.length,
          activeRequestIds: Array.from(currentActiveRequestIds),
          activeRequestIdsSize: currentActiveRequestIds.size,
          discardedIds: Array.from(currentDiscardedIds),
          helpOffersDetails: helpOffers.map(r => ({
            id: r.id,
            itemId: r.itemId,
            helpRequestId: (r as Reservation & { helpRequestId?: string }).helpRequestId,
            status: r.status,
            isHelpOffer: (r as Reservation & { isHelpOffer?: boolean }).isHelpOffer,
          })),
        });
        
        // Filter help offers:
        // 1. Only show those linked to active requests (helpRequestId must be in activeRequestIds)
        // 2. Exclude locally discarded reservations
        // 3. Only show requested status (not rejected, accepted, etc.)
        const filteredHelpOffers = helpOffers.filter((r) => {
          const helpRequestId = (r as Reservation & { helpRequestId?: string }).helpRequestId;
          const isLinkedToActiveRequest = helpRequestId && currentActiveRequestIds.has(helpRequestId);
          const isNotDiscarded = !currentDiscardedIds.has(r.id);
          const isRequested = r.status === 'requested';
          
          const shouldInclude = isLinkedToActiveRequest && isNotDiscarded && isRequested;
          
          if (!shouldInclude) {
            console.log('[HelpRequestsScreen] ❌ Filtering out help offer:', {
              reservationId: r.id,
              helpRequestId,
              isLinkedToActiveRequest,
              isNotDiscarded,
              isRequested,
              activeRequestIds: Array.from(currentActiveRequestIds),
              helpRequestIdInActive: helpRequestId ? currentActiveRequestIds.has(helpRequestId) : false,
            });
          }
          
          return shouldInclude;
        });
        
        console.log('[HelpRequestsScreen] Filtered help offers:', {
          total: helpOffers.length,
          filtered: filteredHelpOffers.length,
          activeRequests: currentActiveRequestIds.size,
        });
        
        setHelpOfferReservations(filteredHelpOffers);
        
        // Fetch items for help offers
        if (filteredHelpOffers.length > 0) {
          (async () => {
            try {
              const items = await Promise.all(
                filteredHelpOffers.map(async (reservation) => {
                  try {
                    const item = await getItem(reservation.itemId, false);
                    return item;
                  } catch (error) {
                    console.error('[HelpRequestsScreen] Error fetching item:', reservation.itemId, error);
                    return null;
                  }
                })
              );
              const validItems = items.filter((item): item is Item => item !== null);
              console.log('[HelpRequestsScreen] Help offer items fetched:', {
                requested: filteredHelpOffers.length,
                fetched: validItems.length,
                items: validItems.map(i => ({ id: i.id, title: i.title })),
              });
              setHelpOfferItems(validItems);
              setLoadingHelpOffers(false);
            } catch (error) {
              console.error('[HelpRequestsScreen] Error fetching help offer items:', error);
              setHelpOfferItems([]);
              setLoadingHelpOffers(false);
            }
          })();
        } else {
          setHelpOfferItems([]);
          setLoadingHelpOffers(false);
        }
      }
    );

    return () => {
      console.log('[HelpRequestsScreen] Cleaning up help offers subscription');
      unsubscribe();
    };
  }, [me, reservationService, getItem]);

  const handleCreatePress = () => {
    router.push('/help/new');
  };

  const handleGotIt = async (item: Item) => {
    // Prevent double-click
    if (processingItems.has(item.id)) {
      console.log('[handleGotIt] Already processing item:', item.id);
      return;
    }
    
    console.log('[handleGotIt] Called with item:', item.id);
    setProcessing(item.id, true);
    HapticFeedback.selection();
    
    try {
      HapticFeedback.medium();
      await deleteItem(item);
      HapticFeedback.success();
      refreshUserItems();
    } catch (error: any) {
      console.error('[handleGotIt] Error:', error);
      HapticFeedback.error();
    } finally {
      setProcessing(item.id, false);
    }
  };


  const handleNotGotIt = async (item: Item) => {
    // Prevent double-click
    if (processingItems.has(item.id)) {
      console.log('[handleNotGotIt] Already processing item:', item.id);
      return;
    }
    
    console.log('[handleNotGotIt] Called with item:', item.id);
    setProcessing(item.id, true);
    HapticFeedback.selection();
    
    try {
      HapticFeedback.medium();
      await repeatRequest(item.id);
      HapticFeedback.success();
      invalidateItem(item.id);
      refreshUserItems();
    } catch (error: any) {
      console.error('[handleNotGotIt] Error:', error);
      HapticFeedback.error();
    } finally {
      setProcessing(item.id, false);
    }
  };

  const handleDiscardHelpOffer = async (reservation: Reservation) => {
    const reservationId = reservation.id;
    const helpRequestId = (reservation as Reservation & { helpRequestId?: string }).helpRequestId;
    const offeredItemId = reservation.itemId;
    
    // Prevent double-click
    if (processingItems.has(reservationId)) {
      console.log('[handleDiscardHelpOffer] Already processing reservation:', reservationId);
      return;
    }
    
    if (!me) {
      console.error('[handleDiscardHelpOffer] No user ID available');
      return;
    }
    
    console.log('[handleDiscardHelpOffer] Called with reservation:', reservationId, { 
      helpRequestId, 
      offeredItemId,
      me,
      reservation: {
        id: reservation.id,
        itemId: reservation.itemId,
        status: reservation.status,
      },
    });
    setProcessing(reservationId, true);
    HapticFeedback.selection();
    
    // Remove immediately from UI for instant feedback
    setDiscardedReservationIds((prev) => {
      const next = new Set(prev);
      next.add(reservationId);
      return next;
    });
    
    try {
      HapticFeedback.medium();
      
      // 1. Reject the help offer reservation
      console.log('[handleDiscardHelpOffer] Calling rejectReservation...');
      let rejected = false;
      try {
        await reservationService.rejectReservation(reservationId, me, 'Descartado pelo usuário');
        console.log('[handleDiscardHelpOffer] ✅ Reservation rejected via Cloud Function');
        rejected = true;
      } catch (rejectError: any) {
        // Se o erro for CORS ou internal, verifica se a reserva já foi rejeitada
        // (a Cloud Function pode ter funcionado mesmo com erro CORS no preflight)
        if (rejectError?.code === 'functions/internal' || rejectError?.message?.includes('CORS')) {
          console.warn('[handleDiscardHelpOffer] CORS/Internal error, checking if reservation was already rejected...');
          try {
            // Verifica o status atual da reserva
            const resRef = doc(db, FIRESTORE_COLLECTIONS.RESERVATIONS, reservationId);
            const resSnap = await getDoc(resRef);
            
            if (!resSnap.exists()) {
              throw new Error('Reserva não encontrada');
            }
            
            const resData = resSnap.data();
            // Validação básica: verificar se o usuário tem permissão
            // Para ofertas de ajuda (isHelpOffer), o itemOwnerUid é quem precisa de ajuda (pode rejeitar)
            // Para reservas normais, o itemOwnerUid é o dono do item (pode rejeitar)
            if (resData.itemOwnerUid !== me) {
              throw new Error('Sem permissão para rejeitar esta reserva');
            }
            
            // Se já está rejected, considerar como sucesso (Cloud Function funcionou apesar do erro CORS)
            if (resData.status === 'rejected') {
              console.log('[handleDiscardHelpOffer] ✅ Reservation already rejected (Cloud Function succeeded despite CORS error)');
              rejected = true;
            } else if (resData.status === 'requested') {
              // Tenta atualizar diretamente no Firestore como fallback
              console.log('[handleDiscardHelpOffer] Attempting direct Firestore update as fallback...');
              try {
                await updateDoc(resRef, {
                  status: 'rejected',
                  rejectReason: 'Descartado pelo usuário',
                  rejectedAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                  rejectedBy: me,
                });
                console.log('[handleDiscardHelpOffer] ✅ Reservation rejected via Firestore (fallback)');
                rejected = true;
              } catch (updateError: any) {
                // Se falhar por permissão, verifica novamente o status (pode ter sido atualizado)
                const resSnap2 = await getDoc(resRef);
                if (resSnap2.exists() && resSnap2.data().status === 'rejected') {
                  console.log('[handleDiscardHelpOffer] ✅ Reservation was rejected (status checked after update error)');
                  rejected = true;
                } else {
                  throw updateError;
                }
              }
            } else {
              throw new Error(`Reserva não está em status 'requested' (atual: ${resData.status})`);
            }
          } catch (fallbackError: any) {
            console.error('[handleDiscardHelpOffer] Fallback também falhou:', fallbackError);
            throw new Error(`Não foi possível descartar: ${fallbackError?.message || 'Erro desconhecido'}`);
          }
        } else {
          throw rejectError;
        }
      }
      
      if (!rejected) {
        throw new Error('Não foi possível rejeitar a reserva');
      }
      
      // 2. Remove the item from the help request's offeredItems array using Cloud Function
      if (helpRequestId && offeredItemId) {
        console.log('[handleDiscardHelpOffer] Removing item from offeredItems via Cloud Function:', { helpRequestId, offeredItemId });
        try {
          await callCloudFunction<{ requestItemId: string; offeredItemId: string }, { ok: boolean }>(
            'removeOfferedItemFromRequest',
            { requestItemId: helpRequestId, offeredItemId }
          );
          console.log('[handleDiscardHelpOffer] ✅ Item removed from offeredItems');
        } catch (cfError: any) {
          // Se o erro for "não encontrado", pode ser que o item já foi removido ou o pedido não existe mais
          // Isso é aceitável - a reserva já foi rejeitada, que é o objetivo principal
          if (cfError?.code === 'functions/not-found' || cfError?.message?.includes('não encontrado')) {
            console.log('[handleDiscardHelpOffer] Item already removed or request not found (acceptable)');
          } else {
            console.error('[handleDiscardHelpOffer] Error removing item from offeredItems:', cfError);
          }
          // Continue even if this fails - the reservation is already rejected
        }
      } else {
        console.warn('[handleDiscardHelpOffer] Missing helpRequestId or offeredItemId:', { helpRequestId, offeredItemId });
      }
      
      HapticFeedback.success();
      // The reservation will be removed from the list automatically via the real-time listener
    } catch (error: any) {
      console.error('[handleDiscardHelpOffer] Error:', error);
      console.error('[handleDiscardHelpOffer] Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      HapticFeedback.error();
      // Show user-friendly error message
      let errorMessage = 'Não foi possível descartar a oferta.';
      if (error?.code === 'functions/internal' || error?.message?.includes('CORS')) {
        errorMessage = 'Erro de conexão. A função pode estar sendo atualizada. Aguarde alguns minutos e tente novamente.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      // Show alert to user
      const { Alert } = require('react-native');
      Alert.alert('Erro', errorMessage);
      console.error('[handleDiscardHelpOffer] User error:', errorMessage);
    } finally {
      setProcessing(reservationId, false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Spacing.md + insets.top + 90 } // Account for header height (approx 90px) + safe area
        ]}
        showsVerticalScrollIndicator={true}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="large-title" style={styles.title}>
              Socorro!
            </ThemedText>
            <ThemedText type="body" style={[styles.subtitle, { color: colors.text.secondary }]}>
              Pedidos de ajuda da comunidade
            </ThemedText>
          </View>
          <Button
            variant="primary"
            onPress={handleCreatePress}
            style={styles.createButton}
          >
            <Ionicons name="add" size={20} color="#fff" style={{ marginRight: 4 }} />
            Novo
          </Button>
        </View>
        {/* My Requests Section */}
        {myRequestsWithUpdates.length > 0 && (
          <View style={styles.sectionContainer}>
            <ThemedText type="title-2" style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Meus Pedidos
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.horizontalListContent}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              pagingEnabled={false}
              decelerationRate="fast"
              snapToInterval={horizontalCardWidth + horizontalCardSpacing}
              snapToAlignment="start"
            >
              {myRequestsWithUpdates.map((item) => (
                <MyRequestCard
                  key={item.id}
                  item={item}
                  colors={colors}
                  onGotIt={handleGotIt}
                  onNotGotIt={handleNotGotIt}
                  width={horizontalCardWidth}
                  isProcessing={isProcessing(item.id)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Received Help Section - Show help offer reservations */}
        {myRequestsWithUpdates.length > 0 && (
          <View style={styles.sectionContainer}>
            <ThemedText type="title-2" style={[styles.sectionTitle, { color: colors.text.primary }]}>
              Ajuda Recebida!
            </ThemedText>
            {loadingHelpOffers ? (
              <View style={styles.emptyContainer}>
                <ThemedText type="body" style={{ color: colors.text.secondary }}>
                  Carregando itens oferecidos...
                </ThemedText>
              </View>
            ) : helpOfferItems.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ThemedText type="body" style={{ color: colors.text.secondary }}>
                  Nenhum item foi oferecido aos seus pedidos ainda.
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={true}
                contentContainerStyle={styles.horizontalListContent}
                nestedScrollEnabled={true}
                scrollEnabled={true}
                pagingEnabled={false}
                decelerationRate="fast"
                snapToInterval={horizontalCardWidth + horizontalCardSpacing}
                snapToAlignment="start"
              >
                {helpOfferItems.map((item, index) => {
                  // Find the corresponding reservation for this item
                  const reservation = helpOfferReservations.find(r => r.itemId === item.id);
                  const reservationId = reservation?.id || item.id;
                  const isProcessingOffer = isProcessing(reservationId);
                  
                  // Debug: Log reservation matching
                  if (index === 0) {
                    console.log('[HelpRequestsScreen] First help offer item:', {
                      itemId: item.id,
                      itemTitle: item.title,
                      helpOfferReservationsCount: helpOfferReservations.length,
                      reservations: helpOfferReservations.map(r => ({ id: r.id, itemId: r.itemId })),
                      foundReservation: reservation ? { id: reservation.id, itemId: reservation.itemId } : null,
                    });
                  }
                  
                  return (
                    <View 
                      key={item.id} 
                      style={{ 
                        width: horizontalCardWidth, 
                        marginRight: index === helpOfferItems.length - 1 ? 0 : horizontalCardSpacing, 
                        flexShrink: 0,
                        flexDirection: 'column',
                        justifyContent: 'space-between', // Distribui espaço entre card e botão
                        minHeight: horizontalCardWidth * 1.5, // Altura mínima baseada na largura do card
                      }}
                    >
                      <View style={{ flexShrink: 1, flexGrow: 1 }}>
                        <ItemCard
                          item={item}
                          width={horizontalCardWidth}
                          isMine={false}
                          cardSpacing={0}
                          minimal={true}
                        />
                      </View>
                      <View style={{ 
                        marginTop: Spacing.xs, 
                        zIndex: 10, 
                        minHeight: 40,
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {reservation ? (
                          <TouchableOpacity
                            onPress={() => {
                              if (isProcessingOffer) {
                                console.log('[Button] Descartar - Already processing:', reservationId);
                                return;
                              }
                              console.log('[Button] Descartar pressed for reservation:', reservationId);
                              handleDiscardHelpOffer(reservation);
                            }}
                            disabled={isProcessingOffer}
                            style={[
                              {
                                paddingVertical: Spacing.sm,
                                paddingHorizontal: Spacing.md,
                                borderRadius: 8,
                                backgroundColor: colors.semantic.error,
                                opacity: isProcessingOffer ? 0.5 : 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row',
                                gap: Spacing.xs,
                                minHeight: 40,
                              },
                            ]}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash-outline" size={16} color="#fff" />
                            <ThemedText type="body" style={{ color: '#fff', fontWeight: '600' }}>
                              Descartar
                            </ThemedText>
                          </TouchableOpacity>
                        ) : (
                          <View style={{ 
                            minHeight: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <ThemedText type="caption" style={{ color: colors.text.secondary, textAlign: 'center' }}>
                              Sem reserva associada
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        )}

        {/* Community Requests Section */}
        <View style={styles.sectionContainer}>
          <ThemedText type="title-2" style={[styles.sectionTitle, { color: colors.text.primary }]}>
            Pedidos da Comunidade
          </ThemedText>
          {requestItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <EmptyState 
                message="Nenhum pedido de ajuda ativo no momento."
                subtitle="Seja o primeiro a pedir ajuda à comunidade!"
              />
              <Button
                variant="primary"
                onPress={handleCreatePress}
                style={styles.emptyButton}
              >
                Criar pedido de ajuda
              </Button>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.horizontalListContent}
              nestedScrollEnabled={true}
              scrollEnabled={true}
              pagingEnabled={false}
              decelerationRate="fast"
              snapToInterval={horizontalCardWidth + horizontalCardSpacing}
              snapToAlignment="start"
            >
              {requestItems.map((item) => {
                const isMine = Boolean(me && item.ownerUid === me);
                return (
                  <View key={item.id} style={{ width: horizontalCardWidth, marginRight: horizontalCardSpacing, flexShrink: 0 }}>
                    <ItemCard
                      item={item}
                      width={horizontalCardWidth}
                      isMine={isMine}
                      cardSpacing={0}
                    />
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  title: {
    fontWeight: '700',
    marginBottom: Spacing['2xs'],
  },
  subtitle: {
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    minHeight: 200,
  },
  emptyButton: {
    marginTop: Spacing.lg,
  },
  sectionContainer: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontWeight: '700',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  horizontalListContent: {
    paddingHorizontal: Spacing.md,
    paddingRight: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.md,
    alignItems: 'stretch', // Estica todos os cards para ter a mesma altura
  },
  myRequestCard: {
    marginRight: Spacing.md,
    flexShrink: 0,
  },
  actionButtons: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  actionButtonTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    width: '100%',
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

