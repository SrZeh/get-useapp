// components/GlobalTabBar.tsx
import { TabIcon } from "@/components/ui/TabIcon";
import { useThemeColors } from "@/utils";
import { router, usePathname, useSegments } from "expo-router";
import React, { useRef, useEffect } from "react";
import { TouchableOpacity, Text, Platform, View, ViewStyle, Animated, LayoutChangeEvent } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { getSpringConfig } from "@/constants/animations";

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
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const colors = useThemeColors();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const showTxDot = useTransactionsDot();
  const { user } = useAuth();
  
  // Animation for sliding pill - track position and width separately
  const slidePosition = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;
  const tabLayouts = useRef<Record<string, { width: number; x: number }>>({});

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
  
  // Theme-aware brand color: use dark green in light mode for contrast, light green in dark mode
  const brandColor = colors.isDark ? colors.brand.primary : colors.brand.dark;

  // Update animation when active tab changes
  // This effect must run even if we're going to return null, to satisfy Rules of Hooks
  useEffect(() => {
    // Only animate if we're actually rendering the tab bar
    if (isLoggedIn && segments[0] !== "(auth)") {
      const activeTabLayout = tabLayouts.current[activeTab || 'index'];
      if (activeTabLayout) {
        Animated.parallel([
          Animated.spring(slidePosition, {
            toValue: activeTabLayout.x,
            useNativeDriver: false,
            ...getSpringConfig(20, 300),
          }),
          Animated.spring(slideWidth, {
            toValue: activeTabLayout.width,
            useNativeDriver: false,
            ...getSpringConfig(20, 300),
          }),
        ]).start();
      }
    }
  }, [activeTab, slidePosition, slideWidth, isLoggedIn, segments]);

  // Don't show on auth pages
  if (!isLoggedIn || segments[0] === "(auth)") {
    return null;
  }

  const handleTabLayout = (tabName: string) => (event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    tabLayouts.current[tabName] = { width, x };
    
    // Initialize position if this is the active tab
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

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        marginTop: headerHeight,
        paddingHorizontal: Spacing.sm,
        paddingTop: Spacing.xs,
        paddingBottom: Math.max(insets.bottom, Spacing.xs),
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
        ...style,
      }}
    >
      <LiquidGlassView
        intensity="standard"
        tint="system"
        opacity={opacity}
        cornerRadius={BorderRadius.xl}
        style={{
          padding: Spacing['3xs'],
          position: 'relative',
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            position: 'relative',
          }}
        >
          {/* Sliding Pill Indicator */}
          {activeTab && (
            <Animated.View
              style={{
                position: 'absolute',
                left: slidePosition,
                top: 0,
                bottom: 0,
                height: '100%',
                width: slideWidth,
                backgroundColor: brandColor,
                borderRadius: BorderRadius.lg,
                opacity: 0.2,
              }}
            />
          )}
          
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;
            const tabColor = isActive ? brandColor : colors.text.secondary;
            const showDot = tab.name === "transactions" && showTxDot;

            return (
              <TouchableOpacity
                key={tab.name}
                onPress={() => handleTabPress(tab)}
                onLayout={handleTabLayout(tab.name)}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: Spacing['3xs'],
                  zIndex: 1,
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
                    marginTop: Spacing['3xs'],
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
    </View>
  );
}
