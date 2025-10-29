/**
 * useUnreadMessagesDot - Hook for message notification dot indicator
 * 
 * Returns true if user has unreadCount > 0 in any conversation thread.
 * Uses collectionGroup query for efficient checking.
 */

import { auth, db } from "@/lib/firebase";
import {
    collectionGroup,
    limit,
    onSnapshot,
    query,
    where
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { logger } from "@/utils";

/**
 * Returns true if there is ANY thread where the user has unreadCount > 0.
 * Implemented using a single query with collectionGroup("participants").
 */
export function useUnreadMessagesDot() {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { 
      setHasUnread(false); 
      return; 
    }

    // collectionGroup on 'participants' filtering by user
    const q = query(
      collectionGroup(db, "participants"),
      where("userUid", "==", uid),
      where("unreadCount", ">", 0),
      limit(1)
    );

    const unsub = onSnapshot(
      q,
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
