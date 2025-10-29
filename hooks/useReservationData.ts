/**
 * Custom hook for fetching reservation-related data
 * 
 * Handles fetching owner name and item details for a reservation
 */

import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Reservation, Item, UserProfile } from '@/types';

type UseReservationDataReturn = {
  ownerName: string | null;
  item: Item | null;
  isLoading: boolean;
};

/**
 * Hook to fetch owner name and item details for a reservation
 * @param reservation - Reservation object with itemOwnerUid and itemId
 * @returns Object with ownerName, item, and isLoading state
 */
export function useReservationData(reservation: Reservation): UseReservationDataReturn {
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      const promises: Promise<void>[] = [];

      // Fetch owner name
      if (reservation.itemOwnerUid) {
        promises.push(
          getDoc(doc(db, 'users', reservation.itemOwnerUid))
            .then((snap) => {
              const data = snap.data() as Partial<UserProfile> | undefined;
              if (isMounted) {
                setOwnerName(data?.name ?? null);
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

      // Fetch item details
      if (reservation.itemId) {
        promises.push(
          getDoc(doc(db, 'items', reservation.itemId))
            .then((snap) => {
              if (snap.exists() && isMounted) {
                const itemData = { id: snap.id, ...(snap.data() as Partial<Item>) } as Item;
                setItem(itemData);
              } else if (isMounted) {
                console.warn('Item not found:', reservation.itemId);
                setItem(null);
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
  }, [reservation.itemOwnerUid, reservation.itemId]);

  return { ownerName, item, isLoading };
}

