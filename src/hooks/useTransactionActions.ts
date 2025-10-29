// src/hooks/useTransactionActions.ts
import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";
import type { TransactionStatus, TransactionDocument } from "@/types";

type AllowedStatus = TransactionStatus;

interface TxDoc extends Partial<TransactionDocument> {
  lenderId: string;
  borrowerId: string;
  participants: string[];
  status: AllowedStatus;
}

export function useTransactionActions(db: Firestore, uid?: string | null) {
  async function transition(txId: string, next: AllowedStatus) {
    if (!uid) throw new Error("Usuário não autenticado");
    const ref = doc(db, "transactions", txId);

    await runTransaction(db, async (trx) => {
      const snap = await trx.get(ref);
      if (!snap.exists()) throw new Error("Transação não encontrada");
      const tx = snap.data() as TxDoc;

      const isLender = tx.lenderId === uid;
      const isBorrower = tx.borrowerId === uid;

      switch (next) {
        case "approved":
          if (!(tx.status === "requested" && isLender)) {
            throw new Error("Somente o dono pode aprovar pedidos pendentes.");
          }
          break;
        case "rejected":
          if (!(tx.status === "requested" && isLender)) {
            throw new Error("Somente o dono pode rejeitar pedidos pendentes.");
          }
          break;
        case "in_use":
          if (!(tx.status === "approved" && (isLender || isBorrower))) {
            throw new Error("Somente participantes podem iniciar uso após aprovado.");
          }
          break;
        case "returned":
          if (!(tx.status === "in_use" && (isLender || isBorrower))) {
            throw new Error("Somente participantes podem marcar devolução.");
          }
          break;
        case "closed":
          if (!(tx.status === "returned" && isLender)) {
            throw new Error("Somente o dono encerra após devolução.");
          }
          break;
        case "cancelled":
          if (!(tx.status === "requested" && isBorrower)) {
            throw new Error("Somente o solicitante pode cancelar o pedido pendente.");
          }
          break;
        default:
          throw new Error("Transição inválida");
      }

      trx.update(ref, {
        status: next,
        updatedAt: serverTimestamp(),
      });
    });
  }

  return {
    approve: (txId: string) => transition(txId, "approved"),
    reject: (txId: string) => transition(txId, "rejected"),
    startUse: (txId: string) => transition(txId, "in_use"),
    markReturned: (txId: string) => transition(txId, "returned"),
    close: (txId: string) => transition(txId, "closed"),
    cancel: (txId: string) => transition(txId, "cancelled"),
  };
}
