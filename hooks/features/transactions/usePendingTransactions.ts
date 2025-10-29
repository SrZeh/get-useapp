/**
 * usePendingTransactions - Legacy hook for backward compatibility
 * 
 * Deprecated: Use useTransactionsDot instead.
 * This hook returns true if there are any reservations requiring user action.
 */

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

/** 
 * Returns true if there is any transaction requiring action from the user
 * (e.g., accept, pay, mark received)
 */
export function usePendingTransactions() {
  const [hasTodo, setHasTodo] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { 
      setHasTodo(false); 
      return; 
    }

    // Two listeners: as owner (needs to accept) and as renter (needs to pay/pickup)
    const qOwner = query(
      collection(db, "reservations"), 
      where("itemOwnerUid", "==", uid), 
      where("status", "==", "requested")
    );
    
    const qRenterToPay = query(
      collection(db, "reservations"), 
      where("renterUid", "==", uid), 
      where("status", "==", "accepted")
    );
    
    const qRenterToPickup = query(
      collection(db, "reservations"), 
      where("renterUid", "==", uid), 
      where("status", "==", "paid")
    );

    const unsubs = [
      onSnapshot(qOwner, (s) => setHasTodo((prev) => prev || !s.empty)),
      onSnapshot(qRenterToPay, (s) => setHasTodo((prev) => prev || !s.empty)),
      onSnapshot(qRenterToPickup, (s) => setHasTodo((prev) => prev || !s.empty)),
    ];
    
    return () => unsubs.forEach((u) => u());
  }, []);

  return hasTodo;
}
