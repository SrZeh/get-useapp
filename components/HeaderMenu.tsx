// components/HeaderMenu.tsx
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export function HeaderMenu() {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];

  const handlePress = () => {
    router.push("/modal");
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{ marginLeft: 16 }}
      android_ripple={{ borderless: true }}
      accessibilityRole="button"
      accessibilityLabel="Menu"
    >
      <MaterialIcons
        name="menu"
        size={28}
        color={palette.icon}
      />
    </TouchableOpacity>
  );
}

