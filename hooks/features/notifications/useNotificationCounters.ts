/**
 * useNotificationCounters - observa contadores de notificações do usuário
 *
 * Lê `users/{uid}/counters/__root__` e retorna os campos e total.
 */

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export type NotificationCounters = {
  total: number;
  messages: number;
  reservations: number;
  payments: number;
  interactions: number;
};

const EMPTY: NotificationCounters = {
  total: 0,
  messages: 0,
  reservations: 0,
  payments: 0,
  interactions: 0,
};

export function useNotificationCounters(): NotificationCounters {
  const [counters, setCounters] = useState<NotificationCounters>(EMPTY);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setCounters(EMPTY);
      return;
    }
    const ref = doc(db, "users", uid, "counters", "__root__");
    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setCounters(EMPTY);
      } else {
        const d = snap.data() as any;
        setCounters({
          total: Number(d?.total ?? 0),
          messages: Number(d?.messages ?? 0),
          reservations: Number(d?.reservations ?? 0),
          payments: Number(d?.payments ?? 0),
          interactions: Number(d?.interactions ?? 0),
        });
      }
    });
    return () => unsub();
  }, []);

  return counters;
}



