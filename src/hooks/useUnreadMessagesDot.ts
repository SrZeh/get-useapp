// src/hooks/useUnreadMessagesDot.ts
import { auth, db } from "@/lib/firebase";
import {
    collectionGroup,
    limit,
    onSnapshot,
    query,
    where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { logger } from "@/utils/logger";

/**
 * Retorna true se existe QUALQUER thread onde o usuário tem unreadCount > 0.
 * Implementado com uma única query usando collectionGroup("participants").
 */
export function useUnreadMessagesDot() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setHasUnread(false); return; }

    // collectionGroup em 'participants' filtrando pelo dono do doc
    const q = query(
      collectionGroup(db, "participants"),
      where("userUid", "==", uid),      // 👈 chave do usuário
      where("unreadCount", ">", 0),
      limit(1)
    );

    const unsub = onSnapshot(q,
      (snap) => setHasUnread(!snap.empty),
      (err) => {
        logger.error("Unread messages dot snapshot error", err, { uid });
        setHasUnread(false);
      }
    );
    return () => unsub();
  }, []);

  return hasUnread;
}