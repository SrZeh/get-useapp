// components/ui/TabIcon.tsx
import React from "react";
import { Image, ImageSourcePropType, View, ViewStyle, StyleProp } from "react-native";

type IconComponent = React.ComponentType<{
  width?: number | string;
  height?: number | string;
  color?: string;
  fill?: string;
  stroke?: string;
  style?: StyleProp<ViewStyle>;
}>;

type Props = {
  // Agora aceita: componente, string (URL) ou require() (number/object)
  Icon: IconComponent | string | ImageSourcePropType;
  color: string;
  size?: number;
  showDot?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function TabIcon({ Icon, color, size = 22, showDot, style }: Props) {
  const isComponent = typeof Icon === "function";
  const isString = typeof Icon === "string";
  const isNumber = typeof Icon === "number"; // require('...') em RN vira number
  const isObj = typeof Icon === "object" && Icon !== null; // também cobre require que retorna objeto em web

  return (
    <View
      style={[
        { width: size + 6, height: size + 6, alignItems: "center", justifyContent: "center" },
        style,
      ]}
    >
      {isComponent ? (
        // Caso 1: componente (ex.: SVG)
        (() => {
          const Comp = Icon as IconComponent;
          return (
            <Comp
              width={size}
              height={size}
              color={color}
              fill={color}
              stroke={color}
              style={{ width: size, height: size }}
            />
          );
        })()
      ) : (
        // Caso 2: imagem (string URL | require() number | objeto ImageSource)
        <Image
          source={
            isString
              ? { uri: Icon as string }
              : ((Icon as unknown) as ImageSourcePropType)
          }
          style={{ width: size, height: size, resizeMode: "contain" }}
        />
      )}

      {showDot ? (
        <View
          style={{
            position: "absolute",
            top: 4,
            right: 8,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#ff3b30",
          }}
        />
      ) : null}
    </View>
  );
}
