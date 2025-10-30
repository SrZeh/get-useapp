// components/GlobalSidebar.tsx
import { TabIcon } from "@/components/ui/TabIcon";
import { useThemeColors } from "@/utils";
import { router, usePathname, useSegments } from "expo-router";
import React, { useRef, useEffect } from "react";
import { TouchableOpacity, Platform, View, ViewStyle, Animated, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { getSpringConfig } from "@/constants/animations";

import ArrowsSvg from "@/assets/icons/arrows.svg";
import HouseSvg from "@/assets/icons/house.svg";
import ShippingBoxSvg from "@/assets/icons/shippingbox.svg";
import { useTransactionsDot } from "@/hooks/features/transactions";
import { useAuth } from "@/providers/AuthProvider";
import * as Haptics from "expo-haptics";

type TabConfig = {
  name: string;
  route: string;
  title: string;
  Icon: React.ComponentType<{ width?: number; height?: number; color?: string }>;
  size?: number;
};

type GlobalSidebarProps = {
  style?: ViewStyle;
  opacity?: number;
};

const tabs: TabConfig[] = [
  { name: "items", route: "/(tabs)/items", title: "Meus Itens", Icon: ShippingBoxSvg, size: 22 },
  { name: "index", route: "/(tabs)", title: "Início", Icon: HouseSvg, size: 24 },
  { name: "transactions", route: "/(tabs)/transactions", title: "Transações", Icon: ArrowsSvg, size: 22 },
];

export function GlobalSidebar({ style, opacity }: GlobalSidebarProps = {}) {
  const colors = useThemeColors();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const showTxDot = useTransactionsDot();
  const { user } = useAuth();

  const slidePosition = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;
  const tabLayouts = useRef<Record<string, { width: number; x: number }>>({});

  const headerHeight = Platform.select({ ios: 44, android: 56, web: 64, default: 56 }) ?? 56;
  const isLoggedIn = !!user;

  const getActiveTab = () => {
    const normalizedPath = pathname || "";
    const currentSegments = segments;
    if (normalizedPath.includes("/(tabs)/items") || currentSegments.includes("items")) return "items";
    if (normalizedPath.includes("/(tabs)/transactions") || currentSegments.includes("transactions")) return "transactions";
    if (
      normalizedPath === "/(tabs)" ||
      normalizedPath === "/(tabs)/" ||
      (currentSegments.includes("(tabs)") && !currentSegments.includes("items") && !currentSegments.includes("transactions"))
    ) {
      return "index";
    }
    return null;
  };

  const activeTab = getActiveTab();
  const brandColor = colors.isDark ? colors.brand.primary : colors.brand.dark;

  useEffect(() => {
    if (isLoggedIn && segments[0] !== "(auth)") {
      const activeTabLayout = tabLayouts.current[activeTab || "index"];
      if (activeTabLayout) {
        Animated.parallel([
          Animated.spring(slidePosition, { toValue: activeTabLayout.x, useNativeDriver: false, ...getSpringConfig(20, 300) }),
          Animated.spring(slideWidth, { toValue: activeTabLayout.width, useNativeDriver: false, ...getSpringConfig(20, 300) }),
        ]).start();
      }
    }
  }, [activeTab, slidePosition, slideWidth, isLoggedIn, segments]);

  if (!isLoggedIn || segments[0] === "(auth)") {
    return null;
  }

  const handleTabLayout = (tabName: string) => (event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    tabLayouts.current[tabName] = { width, x };
    if (activeTab === tabName) {
      slidePosition.setValue(x);
      slideWidth.setValue(width);
    }
  };

  const handleTabPress = (tab: TabConfig) => {
    if (Platform.OS === "ios") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(tab.route as any);
  };

  const isWeb = Platform.OS === "web";
  const sidebarWidth = 72;

  return (
    <View
      style={{
        position: 'absolute',
        top: isWeb ? 0 : insets.top,
        left: 0,
        bottom: 0,
        width: sidebarWidth,
        zIndex: 999,
        paddingTop: isWeb ? headerHeight : Spacing['lg'],
        paddingBottom: Math.max(insets.bottom, Spacing.xs),
        backgroundColor: 'transparent',
        flexDirection: 'column',
        ...style,
      }}
    >
      <LiquidGlassView
        intensity="standard"
        tint="system"
        opacity={opacity}
        cornerRadius={BorderRadius.xl}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingVertical: Spacing.md,
          paddingHorizontal: Spacing['3xs'],
          width: '100%',
          backgroundColor: 'transparent',
        }}
      >
        {[...tabs].sort((a, b) => (a.name === 'index' ? -1 : b.name === 'index' ? 1 : 0)).map((tab) => {
          const isActive = activeTab === tab.name;
          const tabColor = isActive ? brandColor : colors.text.secondary;
          const showDot = tab.name === "transactions" && showTxDot;
          return (
            <TouchableOpacity
              key={tab.name}
              onPress={() => handleTabPress(tab)}
              onLayout={handleTabLayout(tab.name)}
              style={{
                width: sidebarWidth,
                height: sidebarWidth,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: Spacing.md,
                borderRadius: BorderRadius.lg,
                backgroundColor: isActive ? brandColor + '22' : 'transparent',
              }}
              accessibilityRole="button"
              accessibilityLabel={tab.title}
              accessibilityState={{ selected: isActive }}
            >
              <TabIcon Icon={tab.Icon} color={tabColor} size={32} showDot={showDot} />
            </TouchableOpacity>
          );
        })}
      </LiquidGlassView>
    </View>
  );
}


