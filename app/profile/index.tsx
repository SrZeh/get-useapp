// app/profile/index.tsx

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, TouchableOpacity, View } from 'react-native';

type UserDoc = {
  name: string; email: string; cpf?: string; phone?: string; address?: string;
  photoURL?: string | null; ratingAvg?: number; ratingCount?: number; transactionsTotal?: number;
};

export default function ProfileScreen() {
  const uid = auth.currentUser?.uid;
  const [u, setU] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!uid) { setLoading(false); return; }
      const snap = await getDoc(doc(db, "users", uid));
      setU(snap.exists() ? (snap.data() as any) : null);
      setLoading(false);
    })();
  }, [uid]);

  if (!uid) {
    return (
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ThemedText type="title">Meu Perfil</ThemedText>
        <ThemedText className="mt-2">Você não está logado.</ThemedText>
        <TouchableOpacity style={{ marginTop: 12 }} onPress={() => router.push("/(auth)/login")}>
          <ThemedText type="defaultSemiBold">Entrar</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Meu Perfil</ThemedText>

      <View style={{ marginTop: 16, alignItems: "center", gap: 8 }}>
        {u?.photoURL ? (
          <Image source={{ uri: u.photoURL }} style={{ width: 96, height: 96, borderRadius: 48 }} />
        ) : (
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: "#6b7280",
            alignItems: "center", justifyContent: "center" }}>
            <ThemedText style={{ color: "#fff" }}>👤</ThemedText>
          </View>
        )}
        <ThemedText type="subtitle">{u?.name ?? "(Sem nome)"}</ThemedText>
        <ThemedText>{u?.email}</ThemedText>

        <ThemedText className="mt-2">
          {u?.cpf ? "CPF verificado" : "CPF não verificado"}
        </ThemedText>
        <ThemedText>
          Nota: {(u?.ratingAvg ?? 5).toFixed(1)} ⭐ ({u?.ratingCount ?? 0} avaliações)
        </ThemedText>
        <ThemedText>
          Transações concluídas: {u?.transactionsTotal ?? 0}
        </ThemedText>

      </View>

      <View style={{ marginTop: 24, gap: 12 }}>
        <TouchableOpacity onPress={() => router.push("/profile/edit")}>
          <ThemedText type="defaultSemiBold">Editar perfil</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/profile/reviews")}>
          <ThemedText>Ver avaliações</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}
