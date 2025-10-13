import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

/** retorna true se há alguma transação que requer ação do usuário (ex.: aceitar, pagar, marcar recebido) */
export function useTransactionsDot() {
  const [hasTodo, setHasTodo] = useState(false);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) { setHasTodo(false); return; }

    // duas escutas: como dono (precisa aceitar) e como locatário (precisa pagar/receber)
    const qOwner = query(collection(db, "reservations"), where("itemOwnerUid", "==", uid), where("status", "==", "requested"));
    const qRenterToPay = query(collection(db, "reservations"), where("renterUid", "==", uid), where("status", "==", "accepted"));
    const qRenterToPickup = query(collection(db, "reservations"), where("renterUid", "==", uid), where("status", "==", "paid"));

    const unsubs = [
      onSnapshot(qOwner, (s) => setHasTodo((prev) => prev || !s.empty)),
      onSnapshot(qRenterToPay, (s) => setHasTodo((prev) => prev || !s.empty)),
      onSnapshot(qRenterToPickup, (s) => setHasTodo((prev) => prev || !s.empty)),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  return hasTodo;
}
