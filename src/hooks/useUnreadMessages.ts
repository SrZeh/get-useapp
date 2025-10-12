// src/hooks/useUnreadMessages.ts
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/src/providers/AuthProvider";

export function useUnreadMessagesDot() {
  const { user } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, "messages"),
      where("toUid", "==", user.uid),
      where("readAt", "==", null),
      limit(1)
    );
    const unsub = onSnapshot(
      q,
      (snap) => setHasUnread(!snap.empty),
      (err) => {
        console.error("[useUnreadMessagesDot] onSnapshot error:", err);
        setHasUnread(false);
      }
    );
    return unsub;
  }, [user?.uid]);

  return hasUnread;
}
