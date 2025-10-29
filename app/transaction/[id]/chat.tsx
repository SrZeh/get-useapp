// app/transaction/[id]/chat.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db } from "@/lib/firebase";
import { useLocalSearchParams } from "expo-router";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { logger, useThemeColors } from "@/utils";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { FirestoreTimestamp } from "@/types";

type Msg = { id: string; text: string; senderUid: string; createdAt?: FirestoreTimestamp };

export default function ReservationChatScreen() {
  const params = useLocalSearchParams();
  const rawId = params.id as string | string[] | undefined;
  const id = Array.isArray(rawId) ? rawId[0] : rawId; // garante string
  const uid = auth.currentUser?.uid ?? null;
  const colors = useThemeColors();

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // só conecta quando tiver id e usuário logado
    if (!uid || !id) return;

    const q = query(
      collection(db, "reservations", id, "messages"),
      orderBy("createdAt", "asc"),
      limit(200)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: Msg[] = [];
        snap.forEach((d) => {
          const data = d.data() as Partial<Msg>;
          list.push({ 
            id: d.id, 
            text: data.text ?? '', 
            senderUid: data.senderUid ?? '', 
            createdAt: data.createdAt 
          });
        });
        setMsgs(list);
        setTimeout(
          () => scrollRef.current?.scrollToEnd({ animated: true }),
          50
        );
      },
      (err) => {
        logger.error("Chat snapshot listener error", err, { code: err?.code, message: err?.message, reservationId: id });
      }
    );

    return () => unsub();
  }, [uid, id]);

  async function send() {
    if (!uid || !id || !text.trim()) return;
    try {
      await addDoc(collection(db, "reservations", id, "messages"), {
        text: text.trim(),
        senderUid: uid,
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      logger.error("Error sending chat message", e, { code: error?.code, message: error?.message, reservationId: id });
    }
  }

  // UX: se não logado ou id inválido
  if (!id) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <ThemedText>Reserva inválida.</ThemedText>
      </ThemedView>
    );
  }
  if (!uid) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <ThemedText>Faça login para ver e enviar mensagens.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding" })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1 }}>
        <ThemedText type="title" style={{ padding: 16 }}>
          Mensagens
        </ThemedText>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        >
          {msgs.length === 0 ? (
            <ThemedText style={{ opacity: 0.7 }}>Sem mensagens ainda.</ThemedText>
          ) : (
            msgs.map((m) => {
              const mine = m.senderUid === uid;
              return (
                <View
                  key={m.id}
                  style={{
                    alignSelf: mine ? "flex-end" : "flex-start",
                    maxWidth: "80%",
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 2,
                    backgroundColor: mine ? colors.brand.dark : colors.brand.primary,
                  }}
                >
                  <ThemedText style={{ color: colors.isDark ? colors.text.primary : "#111827" }}>
                    {m.text}
                  </ThemedText>
                </View>
              );
            })
          )}
        </ScrollView>

        <View
          style={{
            flexDirection: "row",
            gap: 8,
            padding: 12,
            borderTopWidth: 1,
            borderTopColor: colors.border.default,
          }}
        >
          <TextInput
            placeholder="Escreva uma mensagem…"
            placeholderTextColor={colors.input.placeholder}
            value={text}
            onChangeText={setText}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              backgroundColor: colors.input.bg,
              borderColor: colors.border.default,
              color: colors.text.primary,
            }}
          />
          <TouchableOpacity
            onPress={send}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: colors.brand.dark,
            }}
          >
            <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
              Enviar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
