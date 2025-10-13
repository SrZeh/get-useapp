// app/(tabs)/_layout.tsx
import AuthHeaderRight from "@/components/AuthHeaderRight";
import { HapticTab } from "@/components/haptic-tab";
import { TabIcon } from "@/components/ui/TabIcon";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { CoachmarksProvider } from "@/providers/CoachmarksProvider";

import HouseIcon from "@/assets/icons/house.svg";
import BoxIcon from "@/assets/icons/shippingbox.svg";
import ArrowsIcon from "@/assets/icons/arrows.svg";

import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { useOnboardingVisibility } from "@/hooks/useOnboarding";
import { useTransactionsDot } from "@/hooks/useTransactionsDot";
import { useTermsAccepted } from "@/src/hooks/useTermsAccepted";
import { useUnreadMessagesDot } from "@/src/hooks/useUnreadMessages";
import { useAuth } from "@/src/providers/AuthProvider";

import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform } from "react-native";

export default function TabLayout() {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];
  // const { user } = useAuth();
  // const showTabs = !!user;

  const { user } = useAuth();
  const termsAccepted = useTermsAccepted(user);
  const showTabs = !!user && termsAccepted === true;
  const { visible, markSeen } = useOnboardingVisibility(); // já existente, vamos ajustar o hook abaixo

  const hasUnread = useUnreadMessagesDot();
  const hasTxTodo = useTransactionsDot();

  

  const nativeScreenOptions =
    Platform.OS !== "web" ? ({ tabBarButton: HapticTab as any } as const) : {};

  return (
    <CoachmarksProvider>
      {/* Onboarding só aparece se logado e ainda pendente */}
     {!!user && visible && (
       <OnboardingModal
         visible
         onClose={(opts) => markSeen(opts)}
       />
     )}
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: true,
          headerTitleAlign: "left",
          headerRight: () => <AuthHeaderRight />,
          headerStyle: { backgroundColor: palette.background },
          headerTintColor: palette.text,
          headerTitleStyle: { color: palette.text },

          tabBarActiveTintColor: Colors[scheme].tint,
          tabBarInactiveTintColor: Colors[scheme].tabIconDefault,
          tabBarStyle: {
            backgroundColor: palette.background,
            borderTopColor: "transparent",
            display: showTabs ? "flex" : "none",
          },

          ...nativeScreenOptions,
        }}
      >
        <Tabs.Screen
  name="items"
  options={{
    title: "Meus Itens",
    tabBarIcon: ({ color }) => (
      <TabIcon Icon={BoxIcon} color={color} />
    ),
  }}
/>
<Tabs.Screen
  name="index"
  options={{
    title: "Get & Use",
    tabBarIcon: ({ color }) => (
      <TabIcon Icon={HouseIcon} color={color} showDot={hasUnread} />
    ),
  }}
/>
<Tabs.Screen
  name="transactions"
  options={{
    title: "Transações",
    tabBarIcon: ({ color }) => (
      <TabIcon Icon={ArrowsIcon} color={color} showDot={hasTxTodo} />
            ),
          }}
        />
      </Tabs>
    </CoachmarksProvider>
  );
}
