// src/hooks/usePendingTransactions.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/src/providers/AuthProvider";

export function useTransactionsDot() {
  const { user } = useAuth();
  const [showDot, setShowDot] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "reservations"),
      where("participants", "array-contains", user.uid),
      where("status", "in", ["accepted", "paid"]),
      limit(1)
    );
    const unsub = onSnapshot(
      q,
      (snap) => setShowDot(!snap.empty),
      (err) => {
        console.error("[useTransactionsDot] onSnapshot error:", err);
        setShowDot(false);
      }
    );
    return unsub;
  }, [user?.uid]);

  return showDot;
}
