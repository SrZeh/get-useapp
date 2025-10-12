// components/ui/CrossIcon.tsx
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform } from "react-native";

type SFName = "house.fill" | "shippingbox.fill" | "arrow.2.squarepath";
const ionMap: Record<SFName, keyof typeof Ionicons.glyphMap> = {
  "house.fill": "home",
  "shippingbox.fill": "cube",
  "arrow.2.squarepath": "swap-horizontal",
};

export function CrossIcon({
  name,
  size = 28,
  color = "#000",
}: {
  name: SFName;
  size?: number;
  color?: string;
}) {
  if (Platform.OS === "ios") {
    return <IconSymbol size={size} name={name} color={color} />;
  }
  return <Ionicons size={size} name={ionMap[name]} color={color} />;
}
