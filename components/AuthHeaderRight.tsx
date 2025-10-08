// components/AuthHeaderRight.tsx
import { ThemedText } from "@/components/themed-text";
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity, View } from "react-native";

export default function AuthHeaderRight() {
  const [user, setUser] = useState(auth.currentUser);
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // tenta pegar avatar salvo no Firestore
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          setPhotoURL((snap.data() as any)?.photoURL ?? u.photoURL ?? null);
        } catch {
          setPhotoURL(u.photoURL ?? null);
        }
      } else {
        setPhotoURL(null);
      }
    });
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <View style={{ flexDirection: "row", gap: 12, marginRight: 8 }}>
        <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
          <ThemedText type="defaultSemiBold">Entrar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <ThemedText>Cadastre-se</ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flexDirection: "row", gap: 12, marginRight: 8, alignItems: "center" }}>
      <TouchableOpacity onPress={() => router.push("/profile")}>
        {photoURL ? (
          <Image
            source={{ uri: photoURL }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
          />
        ) : (
          <View style={{
            width: 32, height: 32, borderRadius: 16, backgroundColor: "#6b7280",
            alignItems: "center", justifyContent: "center"
          }}>
            <ThemedText style={{ color: "#fff" }}>👤</ThemedText>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={async () => { await signOut(auth); }}>
        <ThemedText>Sair</ThemedText>
      </TouchableOpacity>
    </View>
  );
}
