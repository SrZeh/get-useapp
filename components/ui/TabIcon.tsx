// components/ui/TabIcon.tsx
import React from "react";
import { Image, View } from "react-native";

type IconComponent = React.ComponentType<{
  width?: number | string;
  height?: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
  style?: any;
}>;

type Props = {
  // aceita componente SVG (via transformer) OU uma string (URL/local) para fallback
  Icon: IconComponent | string;
  color: string;
  size?: number;
  showDot?: boolean;
};

export function TabIcon({ Icon, color, size = 22, showDot }: Props) {
  const isString = typeof Icon === "string";

  let iconEl: React.ReactNode;
  if (isString) {
    iconEl = (
      <Image
        source={{ uri: Icon as string }}
        style={{ width: size, height: size, resizeMode: "contain" }}
      />
    );
  } else {
    const Comp = Icon as IconComponent;
    iconEl = (
      <Comp
        width={size}
        height={size}
        color={color}
        fill={color}
        stroke={color}
      />
    );
  }

  return (
    <View
      style={{
        width: size + 6,
        height: size + 6,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {iconEl}

      {showDot ? (
        <View
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 8,
            height: 8,
            borderRadius: 8,
            backgroundColor: "#ef4444",
            borderWidth: 1,
            borderColor: "#fff",
          }}
        />
      ) : null}
    </View>
  );
}

export default TabIcon;
