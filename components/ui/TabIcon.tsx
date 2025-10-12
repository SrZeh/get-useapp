// components/ui/TabIcon.tsx
import React from "react";
import { View } from "react-native";
import { CrossIcon } from "@/components/ui/CrossIcon";

export function TabIcon({
  name,
  color,
  size = 28,
  showDot = false,
}: {
  name: "house.fill" | "shippingbox.fill" | "arrow.2.squarepath";
  color?: string;
  size?: number;
  showDot?: boolean;
}) {
  const safeColor = color ?? "#8e8e93"; // cinza de fallback
  return (
    <View style={{ width: size, height: size }}>
      <CrossIcon name={name} color={safeColor} size={size} />
      {showDot ? (
        <View
          style={{
            position: "absolute",
            top: -2,
            right: -2,
            width: 10,
            height: 10,
            borderRadius: 10,
            backgroundColor: "#ff3b30",
          }}
        />
      ) : null}
    </View>
  );
}
