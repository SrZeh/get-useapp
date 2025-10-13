// src/hooks/useTransactionsDot.ts
import { auth, db } from "@/lib/firebase";
import {
    collection,
    doc,
    DocumentData,
    onSnapshot,
    query,
    QuerySnapshot,
    serverTimestamp,
    setDoc,
    where,
} from "firebase/firestore";
import { useEffect, useState } from "react";

function hasNewSince(snap: QuerySnapshot<DocumentData>, lastSeenMs?: number | null) {
  // Se nunca marcou como visto, e existe qualquer doc, mostra dot
  if (!lastSeenMs) return !snap.empty;
  let show = false;
  snap.forEach((d) => {
    const u = d.data()?.updatedAt;
    const t = typeof u?.toMillis === "function" ? u.toMillis() : undefined;
    if (!t || t > lastSeenMs) show = true;
  });
  return show;
}

export function useTransactionsDot() {
  const uid = auth.currentUser?.uid ?? null;
  const [dot, setDot] = useState(false);

  useEffect(() => {
    if (!uid) { setDot(false); return; }

    // observa o lastTransactionsSeenAt do usuário
    const userRef = doc(db, "users", uid);
    let lastSeenMs: number | null | undefined = undefined;

    const unsubUser = onSnapshot(userRef, (s) => {
      const v = s.exists() ? s.data()?.lastTransactionsSeenAt : null;
      lastSeenMs = typeof v?.toMillis === "function" ? v.toMillis() : null;
    });

    // reservas que exigem ação do DONO (requested)
    const qOwner = query(
      collection(db, "reservations"),
      where("itemOwnerUid", "==", uid),
      where("status", "in", ["requested"])
    );

    // reservas que exigem ação do LOCATÁRIO (accepted)
    const qRenter = query(
      collection(db, "reservations"),
      where("renterUid", "==", uid),
      where("status", "in", ["accepted"])
    );

    const unsubs = [
      onSnapshot(qOwner,
        (snap) => setDot((prev) => hasNewSince(snap, lastSeenMs) || prev),
        (err) => { console.log("[useTransactionsDot] owner error:", err); }
      ),
      onSnapshot(qRenter,
        (snap) => setDot((prev) => hasNewSince(snap, lastSeenMs) || prev),
        (err) => { console.log("[useTransactionsDot] renter error:", err); }
      ),
    ];

    return () => { unsubUser(); unsubs.forEach((u) => u()); };
  }, [uid]);

  return dot;
}

// Chame isso quando a aba de Transações ficar em foco
export async function markTransactionsSeen() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    await setDoc(
      doc(db, "users", uid),
      { lastTransactionsSeenAt: serverTimestamp() },
      { merge: true }
    );
  } catch (e) {
    console.log("[markTransactionsSeen] error", (e as any)?.message);
  }
}
