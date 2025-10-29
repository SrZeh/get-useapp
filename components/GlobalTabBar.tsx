// components/GlobalTabBar.tsx
import { TabIcon } from "@/components/ui/TabIcon";
import { useThemeColors } from "@/utils";
import { router, usePathname, useSegments } from "expo-router";
import React from "react";
import { TouchableOpacity, Text, Platform, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlassView } from "@/components/liquid-glass";

import ArrowsSvg from "@/assets/icons/arrows.svg";
import HouseSvg from "@/assets/icons/house.svg";
import ShippingBoxSvg from "@/assets/icons/shippingbox.svg";
import { useTransactionsDot } from "@/src/hooks/usePendingTransactions";
import { useAuth } from "@/src/providers/AuthProvider";
import * as Haptics from "expo-haptics";

type TabConfig = {
  name: string;
  route: string;
  title: string;
  Icon: React.ComponentType<{ width?: number; height?: number; color?: string }>;
  size?: number;
};

type GlobalTabBarProps = {
  style?: ViewStyle;
  opacity?: number;
};

const tabs: TabConfig[] = [
  {
    name: "items",
    route: "/(tabs)/items",
    title: "Meus Itens",
    Icon: ShippingBoxSvg,
    size: 22,
  },
  {
    name: "index",
    route: "/(tabs)",
    title: "Início",
    Icon: HouseSvg,
    size: 24,
  },
  {
    name: "transactions",
    route: "/(tabs)/transactions",
    title: "Transações",
    Icon: ArrowsSvg,
    size: 22,
  },
];

export function GlobalTabBar({ style, opacity }: GlobalTabBarProps = {}) {
  const colors = useThemeColors();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const showTxDot = useTransactionsDot();
  const { user } = useAuth();

  // Use a safe default header height
  // Common header heights: ~44 on iOS, ~56 on Android, ~64 on web
  // Can be overridden via style prop if needed
  const headerHeight = Platform.select({
    ios: 44,
    android: 56,
    web: 64,
    default: 56,
  }) ?? 56;

  const isLoggedIn = !!user;

  // Don't show on auth pages
  if (!isLoggedIn || segments[0] === "(auth)") {
    return null;
  }

  const getActiveTab = () => {
    const normalizedPath = pathname || "";
    const currentSegments = segments;

    // Check if we're on items tab
    if (
      normalizedPath.includes("/(tabs)/items") ||
      currentSegments.includes("items")
    ) {
      return "items";
    }
    // Check if we're on transactions tab
    if (
      normalizedPath.includes("/(tabs)/transactions") ||
      currentSegments.includes("transactions")
    ) {
      return "transactions";
    }
    // Default to index if on tabs root or home
    if (
      normalizedPath === "/(tabs)" ||
      normalizedPath === "/(tabs)/" ||
      (currentSegments.includes("(tabs)") &&
        !currentSegments.includes("items") &&
        !currentSegments.includes("transactions"))
    ) {
      return "index";
    }
    // For other routes, return null to not highlight any tab
    return null;
  };

  const activeTab = getActiveTab();

  const handleTabPress = (tab: TabConfig) => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(tab.route as any);
  };

  return (
    <LiquidGlassView
      intensity="subtle"
      tint="system"
      opacity={opacity}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        marginTop: headerHeight,
        borderTopWidth: 1,
        borderTopColor: colors.border.default,
        ...style,
      }}
    >
      <View
        style={{
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          flexDirection: "row",
          justifyContent: "space-around",
          alignItems: "center",
          ...Platform.select({
            ios: {
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 8,
            },
          }),
        }}
      >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.name;
        const tabColor = isActive ? colors.icon.selected : colors.icon.default;
        const showDot = tab.name === "transactions" && showTxDot;

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => handleTabPress(tab)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 4,
            }}
            accessibilityRole="button"
            accessibilityLabel={tab.title}
            accessibilityState={{ selected: isActive }}
          >
            <TabIcon
              Icon={tab.Icon}
              color={tabColor}
              size={tab.size}
              showDot={showDot}
            />
            <Text
              style={{
                fontSize: 11,
                marginTop: 4,
                color: tabColor,
                fontWeight: isActive ? "600" : "400",
              }}
            >
              {tab.title}
            </Text>
          </TouchableOpacity>
        );
      })}
      </View>
    </LiquidGlassView>
  );
}
