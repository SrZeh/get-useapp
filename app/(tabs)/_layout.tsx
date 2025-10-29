// app/(tabs)/_layout.tsx
import { AuthHeaderRight } from "@/components/features/auth";
import { TabIcon } from "@/components/ui/TabIcon";
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColors } from "@/utils";
import { Tabs } from "expo-router";
import React, { useMemo } from "react";
import { LiquidGlassView } from "@/components/liquid-glass";

// 👉 Se tiver transformer configurado, use os SVGs como componentes:
import ArrowsSvg from "@/assets/icons/arrows.svg";
import HouseSvg from "@/assets/icons/house.svg";
import ShippingBoxSvg from "@/assets/icons/shippingbox.svg";

// Se quiser (exemplo) usar string/require em alguma tab:
// const HomePng = require("@/assets/images/home.png");
// const ItemsUrl = "https://example.com/box.png";

import { useTransactionsDot } from "@/hooks/features/transactions";
import { useAuth } from "@/providers/AuthProvider";

import { HeaderLogo } from '@/components/layouts';

function LogoIcon() {
  return <HeaderLogo marginLeft={16} />;
}

function HeaderTitle() {
  const colors = useThemeColors();
  return (
    <ThemedText
      type="headline"
      style={{
        color: colors.brand.primary,
        fontWeight: "600",
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
      }}
    >
      Get&Use
    </ThemedText>
  );
}

function HeaderBackground() {
  return (
    <LiquidGlassView
      intensity="subtle"
      tint="system"
      style={{
        flex: 1,
        borderWidth: 0,
      }}
    />
  );
}

export default function TabLayout() {
  const scheme = useColorScheme() ?? "light";
  const colors = useThemeColors();

  const showTxDot = useTransactionsDot();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Memoize screen options to ensure they update when theme changes
  const screenOptions = useMemo(() => ({
    headerShown: true,
    headerTitleAlign: "center" as const,
    headerTitle: () => <HeaderTitle />,
    headerLeft: () => <LogoIcon />,
    headerRight: () => <AuthHeaderRight />,
    headerBackground: () => <HeaderBackground />,
    headerTransparent: true,
    headerTintColor: colors.text.primary,
    headerTitleStyle: { color: colors.text.primary },
    tabBarStyle: { display: "none" as const }, // Use GlobalTabBar instead
    tabBarActiveTintColor: colors.icon.selected,
    tabBarInactiveTintColor: colors.icon.default,
  }), [colors, isLoggedIn]);

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={screenOptions}
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
