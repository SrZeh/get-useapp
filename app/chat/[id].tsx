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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Spacing } from "@/constants/spacing";

type Msg = { id: string; text: string; fromUid: string; createdAt?: FirestoreTimestamp };

export default function ThreadChatScreen() {
  const params = useLocalSearchParams();
  const rawId = params.id as string | string[] | undefined;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const uid = auth.currentUser?.uid ?? null;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // marca como lida no backend
  async function markRead() {
    if (!uid || !id) return;
    try {
      const functions = getFunctions(app, "southamerica-east1");
      const markThread = httpsCallable(functions, "markThreadRead");
      await markThread({ threadId: id });
      // zera contador de mensagens (dot global de mensagens) - usa sistema otimista
      const { useNotificationBadges } = await import("@/hooks/features/notifications");
      // Nota: não podemos usar hook aqui, então chama diretamente
      const markAsSeen = httpsCallable(functions, "markAsSeen");
      await markAsSeen({ type: "messages" });
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
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.sm }}>
        <ThemedText>Conversa inválida.</ThemedText>
      </ThemedView>
    );
  }
  if (!uid) {
    return (
      <ThemedView style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.sm }}>
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
        <ThemedText 
          type="title" 
          style={{ 
            padding: Spacing.sm,
            paddingTop: Math.max(insets.top + 80, Spacing.lg), // Account for transparent header
          }}
        >
          Conversa
        </ThemedText>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: Spacing.sm, paddingBottom: Spacing.xs }}
        >
          {msgs.length === 0 ? (
            <ThemedText style={{ opacity: 0.7 }}>Sem mensagens ainda.</ThemedText>
          ) : (
            msgs.map((m) => {
              const mine = m.fromUid === uid; // <- compara com fromUid
              // No dark mode: verde claro (#96ff9a) precisa de texto escuro, verde escuro (#08af0e) precisa de texto branco
              // No light mode: verde escuro precisa de texto branco
              const bgColor = mine ? colors.brand.dark : colors.brand.primary;
              // Simplifica: se é dark mode e usa brand.primary (verde claro), texto escuro
              // Se é dark mode e usa brand.dark (verde escuro), texto branco
              // Se é light mode, sempre texto branco (usa verde escuro)
              const textColor = colors.isDark 
                ? (!mine ? colors.text.primary : '#ffffff') // Dark: mensagem recebida (verde claro) = texto escuro, enviada (verde escuro) = branco
                : '#ffffff'; // Light: sempre branco
              
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
                    backgroundColor: bgColor,
                  }}
                >
                  <ThemedText style={{ color: textColor }}>
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
              // No dark mode usa verde claro, no light mode usa verde escuro
              backgroundColor: sending || !text.trim() 
                ? colors.text.tertiary 
                : (colors.isDark ? colors.brand.primary : colors.brand.dark),
            }}
          >
            <ThemedText 
              type="defaultSemiBold" 
              style={{ 
                // No dark mode com verde claro, usa texto escuro. No light mode com verde escuro, usa branco
                color: sending || !text.trim() 
                  ? colors.text.secondary
                  : (colors.isDark ? colors.text.primary : '#ffffff')
              }}
            >
              Enviar
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
