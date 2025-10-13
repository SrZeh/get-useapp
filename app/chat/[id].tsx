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
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";

type Msg = { id: string; text: string; fromUid: string; createdAt?: any };

export default function ThreadChatScreen() {
  const params = useLocalSearchParams();
  const rawId = params.id as string | string[] | undefined;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const uid = auth.currentUser?.uid ?? null;

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
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        setMsgs(list);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 50);
        // sempre que carregar/chegar mensagem nova, marcar como lido
        markRead();
      },
      (err) => {
        console.log("THREAD CHAT onSnapshot ERROR", err?.code, err?.message);
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
    } catch (e: any) {
      console.log("send ERROR", e?.code, e?.message);
      Alert.alert("Não foi possível enviar", e?.message ?? "Tente novamente.");
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
                    backgroundColor: mine ? "#00ce08" : "#96ff9a",
                  }}
                >
                  <ThemedText style={{ color: "#111827" }}>
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
            borderColor: "#e5e7eb",
          }}
        >
          <TextInput
            placeholder="Escreva uma mensagem…"
            placeholderTextColor="#9aa0a6"
            value={text}
            onChangeText={setText}
            editable={!sending}
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              backgroundColor: "#f9fafb",
              borderColor: "#d1d5db",
              color: "#111827",
            }}
          />
          <TouchableOpacity
            onPress={send}
            disabled={sending || !text.trim()}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 10,
              backgroundColor: sending || !text.trim() ? "#9ca3af" : "#08af0e",
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
