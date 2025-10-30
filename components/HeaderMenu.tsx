// components/HeaderMenu.tsx
import React from "react";
import { TouchableOpacity } from "react-native";
import { MenuIcon } from "@/assets/icons/menu-icon";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useSidebar } from "@/providers/SidebarProvider";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function HeaderMenu() {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];
  const { toggle } = useSidebar();

  const handlePress = () => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggle();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{ marginLeft: 16 }}
      android_ripple={{ borderless: true }}
      accessibilityRole="button"
      accessibilityLabel="Menu"
      accessibilityHint="Toque para abrir o menu lateral"
    >
      <MenuIcon
        width={28}
        height={28}
        color={palette.icon}
        stroke={palette.icon}
      />
    </TouchableOpacity>
  );
}

