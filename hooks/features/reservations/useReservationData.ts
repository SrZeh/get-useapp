/**
 * Custom hook for fetching reservation-related data
 * 
 * Now optimized: Uses ZustandЅ stores for profile and item data (cached!)
 */

import { useState, useEffect } from 'react';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useItemsStore } from '@/stores/itemsStore';
import type { Reservation, Item } from '@/types';

type UseReservationDataReturn = {
  ownerName: string | null;
  item: Item | null;
  isLoading: boolean;
};

/**
 * Hook to fetch owner name and item details for a reservation
 * Now uses cached data from Zustand stores!
 * 
 * @param reservation - Reservation object with itemOwnerUid and itemId
 escapes @returns Object with ownerName, item, and isLoading state
 */
export function useReservationData(reservation: Reservation): UseReservationDataReturn {
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get store methods
  const getProfile = useUserProfileStore((state) => state.getProfile);
  const getItem = useItemsStore((state) => state.getItem);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      const promises: Promise<void>[] = [];

      // Fetch owner name from cache (or Firestore if not cached)
      if (reservation.itemOwnerUid) {
        promises.push(
          getProfile(reservation.itemOwnerUid)
            .then((profile) => {
              if (isMounted) {
                setOwnerName(profile?.name ?? null);
              }
            })
            .catch((error) => {
              console.error('Error fetching owner name:', error);
              if (isMounted) {
                setOwnerName(null);
              }
            })
        );
      }

      // Fetch item details from cache (or Firestore if not cached)
      if (reservation.itemId) {
        promises.push(
          getItem(reservation.itemId)
            .then((itemData) => {
              if (isMounted) {
                setItem(itemData);
              }
            })
            .catch((error) => {
              console.error('Error fetching item:', error, 'itemId:', reservation.itemId);
              if (isMounted) {
                setItem(null);
              }
            })
        );
      } else {
        console.warn('No itemId in reservation:', reservation.id);
      }

      await Promise.all(promises);
      if (isMounted) {
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [reservation.itemOwnerUid, reservation.itemId, getProfile, getItem]);

  return { ownerName, item, isLoading };
}
