// components/features/auth/AuthHeaderRight.tsx
import { auth, db } from "@/lib/firebase";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { useThemeColors } from "@/utils/theme";
import { GradientTypes } from "@/utils/gradients";
import type { UserProfile } from "@/types";

/**
 * Generate user initials from name
 */
function getInitials(name: string | null | undefined): string {
  if (!name || !name.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() ?? "?";
  }
  // Get first letter of first name and first letter of last name
  const first = parts[0]?.[0]?.toUpperCase() ?? "";
  const last = parts[parts.length - 1]?.[0]?.toUpperCase() ?? "";
  return `${first}${last}`;
}

export default function AuthHeaderRight() {
  const [user, setUser] = useState(auth.currentUser);
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const colors = useThemeColors();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Try to get avatar and name from Firestore
        try {
          const snap = await getDoc(doc(db, "users", u.uid));
          const data = snap.data() as Partial<UserProfile> | undefined;
          setPhotoURL(data?.photoURL ?? u.photoURL ?? null);
          setUserName(data?.name ?? u.displayName ?? null);
        } catch {
          setPhotoURL(u.photoURL ?? null);
          setUserName(u.displayName ?? null);
        }
      } else {
        setPhotoURL(null);
        setUserName(null);
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

  const avatarSize = 36;
  const borderRadius = avatarSize / 2;
  const initials = getInitials(userName);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.container}
      android_ripple={{ borderless: true }}
      accessibilityRole="button"
      accessibilityLabel={user ? "Perfil" : "Entrar"}
    >
      {user && photoURL ? (
        <View
          style={[
            styles.avatarContainer,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius,
              borderWidth: 2,
              borderColor: colors.brand.primary,
            },
          ]}
        >
          <Image
            source={{ uri: photoURL }}
            style={{
              width: avatarSize,
              height: avatarSize,
              borderRadius,
            }}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={photoURL}
          />
        </View>
      ) : user && userName ? (
        <LinearGradient
          colors={GradientTypes.brand.colors}
          start={GradientTypes.brand.start}
          end={GradientTypes.brand.end}
          style={[
            styles.initialsContainer,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.initials,
              {
                color: colors.isDark ? colors.text.primary : "#ffffff",
                fontSize: 14,
                fontWeight: "700",
              },
            ]}
          >
            {initials}
          </ThemedText>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.fallbackContainer,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius,
              backgroundColor: colors.bg.secondary,
              borderWidth: 1,
              borderColor: colors.border.default,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.initials,
              {
                color: colors.text.secondary,
                fontSize: 16,
              },
            ]}
          >
            👤
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarContainer: {
    overflow: "hidden",
  },
  initialsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  fallbackContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontWeight: "600",
  },
});
