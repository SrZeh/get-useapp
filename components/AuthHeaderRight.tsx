// components/AuthHeaderRight.tsx
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Image, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function AuthHeaderRight() {
  const [user, setUser] = useState(auth.currentUser);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];

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

  const handlePress = () => {
    if (user) {
      router.push("/profile");
    } else {
      router.push("/(auth)/login");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{ marginRight: 16 }}
      android_ripple={{ borderless: true }}
      accessibilityRole="button"
      accessibilityLabel={user ? "Perfil" : "Entrar"}
    >
      {user && photoURL ? (
        <Image
          source={{ uri: photoURL }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
        />
      ) : (
        <MaterialIcons
          name="account-circle"
          size={32}
          color={palette.icon}
        />
      )}
    </TouchableOpacity>
  );
}
