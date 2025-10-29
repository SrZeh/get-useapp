// src/components/TransactionCard.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { db } from "../../lib/firebase";
import { useAuth } from "../providers/AuthProvider";
import { useTransactionActions } from "../hooks/useTransactionActions";
import type { Transaction, FirestoreTimestamp } from "@/types";
import { logger } from "@/utils/logger";

type Tx = Transaction;

interface Props {
  tx: Tx;
  onChanged?: () => void;
}

export default function TransactionCard({ tx, onChanged }: Props) {
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const actions = useTransactionActions(db, uid);
  const [busy, setBusy] = useState<null | "approve" | "reject">(null);
  const isLender = !!uid && tx.lenderId === uid;

  const showApproveReject = useMemo(
    () => tx.status === "requested" && isLender,
    [tx.status, isLender]
  );

  async function handleApprove() {
    try {
      setBusy("approve");
      await actions.approve(tx.id);
      onChanged?.();
    } catch (e) {
      logger.warn("Failed to approve transaction", { error: e, transactionId: tx.id });
    } finally {
      setBusy(null);
    }
  }

  async function handleReject() {
    try {
      setBusy("reject");
      await actions.reject(tx.id);
      onChanged?.();
    } catch (e) {
      logger.warn("Failed to reject transaction", { error: e, transactionId: tx.id });
    } finally {
      setBusy(null);
    }
  }

  return (
    <View style={{ padding: 12, borderWidth: 1, borderRadius: 12, marginBottom: 12 }}>
      <Text style={{ fontWeight: "700", fontSize: 16 }}>
        {tx.itemTitle ?? "Item"}
      </Text>
      <Text>Status: {tx.status}</Text>
      {!!tx.lastMessage?.text && (
        <Text numberOfLines={1} style={{ opacity: 0.7, marginTop: 4 }}>
          Última msg: {tx.lastMessage.text}
        </Text>
      )}

      {showApproveReject && (
        <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
          <TouchableOpacity
            onPress={handleReject}
            disabled={busy !== null}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: "#eee",
              borderRadius: 8,
              opacity: busy ? 0.6 : 1,
              marginRight: 12,
            }}
          >
            {busy === "reject" ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ color: "#333" }}>Recusar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleApprove}
            disabled={busy !== null}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 16,
              backgroundColor: "#2e7d32",
              borderRadius: 8,
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy === "approve" ? (
              <ActivityIndicator />
            ) : (
              <Text style={{ color: "white" }}>Aceitar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
