// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React from "react";

import AuthHeaderRight from "@/components/AuthHeaderRight";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/src/providers/AuthProvider";

// 👉 importa o provider dos coachmarks
import { CoachmarksProvider } from "@/providers/CoachmarksProvider";

export default function TabLayout() {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];
  const tint = palette.tint;
  const { user } = useAuth();
  const showTabs = !!user;

  return (
    // 👉 envolve as Tabs com o provider
    <CoachmarksProvider>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "left",
          headerRight: () => <AuthHeaderRight />,
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
          headerTitleStyle: { color: palette.text },

          tabBarActiveTintColor: tint,
          tabBarInactiveTintColor: palette.tabIconDefault,
          tabBarStyle: {
            backgroundColor: palette.background,
            borderTopColor: "transparent",
            display: showTabs ? "flex" : "none",
          },
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="items"
          options={{
            title: "Meus Itens",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="shippingbox.fill" color={color} />
            ),
            tabBarButton: (props) => (showTabs ? <HapticTab {...props} /> : null),
          }}
        />

        <Tabs.Screen
          name="index"
          options={{
            title: "Get & Use",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="house.fill" color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="transactions"
          options={{
            title: "Transações",
            tabBarIcon: ({ color }) => (
              <IconSymbol size={28} name="arrow.2.squarepath" color={color} />
            ),
            tabBarButton: (props) => (showTabs ? <HapticTab {...props} /> : null),
          }}
        />
      </Tabs>
    </CoachmarksProvider>
  );
}
