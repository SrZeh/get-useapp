// components/features/auth/AuthHeaderRight.tsx
import { auth } from "@/lib/firebase";
import { router } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { ThemedText } from "@/components/themed-text";
import { useThemeColors } from "@/utils/theme";
import { GradientTypes } from "@/utils/gradients";
import { useUserProfileStore } from "@/stores/userProfileStore";

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
  const colors = useThemeColors();

  // Get profile from store (shared listener, no duplicate query!)
  const currentUserProfile = useUserProfileStore((state) => state.currentUserProfile);
  const subscribeToCurrentUser = useUserProfileStore((state) => state.subscribeToCurrentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Subscribe to current user profile (shared listener)
        subscribeToCurrentUser();
      }
    });
    return () => unsub();
  }, [subscribeToCurrentUser]);

  // Extract photo and name from profile
  const photoURL = currentUserProfile?.photoURL ?? user?.photoURL ?? null;
  const userName = currentUserProfile?.name ?? user?.displayName ?? null;

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
