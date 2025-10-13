// app/(tabs)/_layout.tsx
import AuthHeaderRight from "@/components/AuthHeaderRight";
import { ThemedText } from "@/components/themed-text";
import { TabIcon } from "@/components/ui/TabIcon";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Link, Tabs } from "expo-router";
import React from "react";
import { Image, Pressable } from "react-native";

// 👉 Se tiver transformer configurado, use os SVGs como componentes:
import ArrowsSvg from "@/assets/icons/arrows.svg";
import HouseSvg from "@/assets/icons/house.svg";
import ShippingBoxSvg from "@/assets/icons/shippingbox.svg";

// Se quiser (exemplo) usar string/require em alguma tab:
// const HomePng = require("@/assets/images/home.png");
// const ItemsUrl = "https://example.com/box.png";

import { useTransactionsDot } from "@/src/hooks/usePendingTransactions";

function TitleLogoLink() {
  return (
    <Link href="/" asChild>
      <Pressable
        accessibilityRole="link"
        style={{ flexDirection: "row", alignItems: "center" }}
        android_ripple={{ borderless: true }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 24, height: 24, marginRight: 8 }}
          resizeMode="contain"
        />
        <ThemedText type="defaultSemiBold">Get &amp; Use</ThemedText>
      </Pressable>
    </Link>
  );
}

export default function TabLayout() {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];

  const borderTopColor =
    scheme === "light" ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.08)";

  const showTxDot = useTransactionsDot();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleAlign: "left",
        headerTitle: () => <TitleLogoLink />,
        headerRight: () => <AuthHeaderRight />,
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerTitleStyle: { color: palette.text },
        tabBarStyle: {
          backgroundColor: palette.background,
          borderTopColor,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: palette.tint,
        tabBarInactiveTintColor: palette.icon,
      }}
    >
      {/* ESQUERDA: Meus Itens */}
      <Tabs.Screen
        name="items"
        options={{
          title: "Meus Itens",
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              Icon={ShippingBoxSvg} // ou: Icon={ItemsUrl} / Icon={require('...')}
              color={color}
              size={size ?? 22}
              showDot={false}
            />
          ),
        }}
      />

      {/* MEIO: Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              Icon={HouseSvg} // ou: Icon={HomePng} / Icon={"https://..."}
              color={color}
              size={size ?? 24}
              showDot={false}
            />
          ),
        }}
      />

      {/* DIREITA: Transações */}
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transações",
          tabBarIcon: ({ color, size }) => (
            <TabIcon Icon={ArrowsSvg} color={color} size={size ?? 22} showDot={!!showTxDot} />
          ),
        }}
      />
    </Tabs>
  );
}
