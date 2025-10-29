// app/chat/[id].tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { app, auth, db } from "@/lib/firebase";
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
import { getFunctions, httpsCallable } from "firebase/functions";
import React, { useEffect, useRef, useState } from "react";
import type { FirestoreTimestamp } from "@/types";
import { logger, useThemeColors } from "@/utils";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

type Msg = { id: string; text: string; fromUid: string; createdAt?: FirestoreTimestamp };

export default function ThreadChatScreen() {
  const params = useLocalSearchParams();
  const rawId = params.id as string | string[] | undefined;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const uid = auth.currentUser?.uid ?? null;
  const colors = useThemeColors();

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // marca como lida no backend
  async function markRead() {
    if (!uid || !id) return;
    try {
      const functions = getFunctions(app, "southamerica-east1");
      const call = httpsCallable(functions, "markThreadRead");
      await call({ threadId: id });
    } catch {
      /* silencioso */
    }
  }

  useEffect(() => {
    if (!uid || !id) return;

    const q = query(
      collection(db, "threads", id, "messages"),
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
            fromUid: data.fromUid ?? '', 
            createdAt: data.createdAt 
          });
        });
        setMsgs(list);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 50);
        // sempre que carregar/chegar mensagem nova, marcar como lido
        markRead();
      },
      (err) => {
        logger.error("Thread chat snapshot listener error", err, { code: err?.code, message: err?.message, threadId: id });
      }
    );

    // primeira vez que abrir
    markRead();

    return () => unsub();
  }, [uid, id]);

  async function send() {
    if (!uid || !id || !text.trim() || sending) return;
    try {
      setSending(true);
      await addDoc(collection(db, "threads", id, "messages"), {
        text: text.trim(),
        fromUid: uid,               // <- campo de autor em threads
        createdAt: serverTimestamp(),
      });
      setText("");
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
      markRead(); // reforça leitura para mim
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      logger.error("Error sending thread message", e, { code: error?.code, message: error?.message, threadId: id });
      Alert.alert("Não foi possível enviar", error?.message ?? "Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  if (!id) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
        <ThemedText>Conversa inválida.</ThemedText>
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
          Conversa
        </ThemedText>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: 16, paddingBottom: 12 }}
        >
          {msgs.length === 0 ? (
            <ThemedText style={{ opacity: 0.7 }}>Sem mensagens ainda.</ThemedText>
          ) : (
            msgs.map((m) => {
              const mine = m.fromUid === uid; // <- compara com fromUid
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
                  <ThemedText style={{ color: colors.isDark ? colors.text.primary : '#ffffff' }}>
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
            editable={!sending}
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
            disabled={sending || !text.trim()}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: sending || !text.trim() ? colors.text.tertiary : colors.brand.dark,
            }}
          >
            <ThemedText type="defaultSemiBold" style={{ color: colors.isDark ? colors.text.primary : '#ffffff' }}>
              Enviar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
