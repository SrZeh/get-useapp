// components/GlobalSidebar.tsx
import { TabIcon } from "@/components/ui/TabIcon";
import { useThemeColors } from "@/utils";
import { router, usePathname, useSegments } from "expo-router";
import React, { useRef, useEffect } from "react";
import { TouchableOpacity, Platform, View, ViewStyle, Animated, LayoutChangeEvent, Pressable, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { getSpringConfig } from "@/constants/animations";

import ArrowsSvg from "@/assets/icons/arrows.svg";
import HouseSvg from "@/assets/icons/house.svg";
import ShippingBoxSvg from "@/assets/icons/shippingbox.svg";
import { ProfileIcon as ProfileIconSvg } from "@/assets/icons/profile-icon";
import { useTransactionsDot } from "@/hooks/features/transactions";
import { useAuth } from "@/providers/AuthProvider";
import { useSidebar } from "@/providers/SidebarProvider";
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
  { name: "items", route: "/items", title: "Meus Itens", Icon: ShippingBoxSvg, size: 22 },
  { name: "index", route: "/", title: "Início", Icon: HouseSvg, size: 24 },
  { name: "transactions", route: "/transactions", title: "Transações", Icon: ArrowsSvg, size: 22 },
  { name: "profile", route: "/profile", title: "Perfil", Icon: ProfileIconSvg, size: 24 },
];

export function GlobalSidebar({ style, opacity }: GlobalSidebarProps = {}) {
  const colors = useThemeColors();
  const pathname = usePathname();
  const segments = useSegments();
  const insets = useSafeAreaInsets();
  const showTxDot = useTransactionsDot();
  const { user } = useAuth();
  const { isOpen, close } = useSidebar();

  const slidePosition = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(-72)).current; // Start off-screen
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sidebarWidthAnimated = useRef(new Animated.Value(72)).current; // Animated width
  const textOpacity = useRef(new Animated.Value(0)).current; // Text label opacity
  const tabLayouts = useRef<Record<string, { width: number; x: number }>>({});

  const headerHeight = Platform.select({ ios: 44, android: 56, web: 64, default: 56 }) ?? 56;
  const isLoggedIn = !!user;
  const isWeb = Platform.OS === "web";
  const sidebarWidthCollapsed = 72;
  const sidebarWidthExpanded = 240; // Width when open to show text labels

  const getActiveTab = () => {
    const normalizedPath = pathname || "";
    const currentSegments = segments;
    if (normalizedPath === "/items" || currentSegments.includes("items")) return "items";
    if (normalizedPath === "/transactions" || currentSegments.includes("transactions")) return "transactions";
    if (normalizedPath.includes("/profile") || currentSegments.includes("profile")) return "profile";
    if (normalizedPath === "/" || normalizedPath === "") {
      return "index";
    }
    return null;
  };

  const activeTab = getActiveTab();
  const brandColor = colors.isDark ? colors.brand.primary : colors.brand.dark;

  // Handle Escape key on web
  useEffect(() => {
    if (!isWeb || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isWeb, close]);

  // Animate sidebar slide in/out and expand/collapse
  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          ...getSpringConfig(20, 300),
        }),
        Animated.spring(sidebarWidthAnimated, {
          toValue: sidebarWidthExpanded,
          useNativeDriver: false, // Width animation doesn't support native driver
          ...getSpringConfig(20, 300),
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 250,
          delay: 100, // Slight delay for smoother reveal
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: -sidebarWidthCollapsed,
          useNativeDriver: true,
          ...getSpringConfig(20, 300),
        }),
        Animated.spring(sidebarWidthAnimated, {
          toValue: sidebarWidthCollapsed,
          useNativeDriver: false,
          ...getSpringConfig(20, 300),
        }),
        Animated.timing(textOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, translateX, overlayOpacity, sidebarWidthAnimated, textOpacity, sidebarWidthCollapsed, sidebarWidthExpanded]);

  // Animate active tab indicator
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
    // Close sidebar after navigation (better UX)
    close();
  };

  const handleOverlayPress = () => {
    close();
  };

  // Don't render anything if sidebar shouldn't be visible
  if (!isLoggedIn || segments[0] === "(auth)") {
    return null;
  }

  // Only render if open (on mobile) or always render (on web - can be toggled)
  // For now, we'll make it toggleable on all platforms for consistency
  if (!isOpen && !isWeb) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop (works on both web and mobile) */}
      {isOpen && (
        <Pressable
          onPress={handleOverlayPress}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
          }}
        >
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              opacity: overlayOpacity,
            }}
          />
        </Pressable>
      )}

      {/* Sidebar */}
      <Animated.View
        style={{
          position: 'absolute',
          top: isWeb ? 0 : insets.top,
          left: 0,
          bottom: 0,
          width: sidebarWidthAnimated,
          zIndex: 999,
          paddingTop: isWeb ? headerHeight : Spacing['lg'],
          paddingBottom: Math.max(insets.bottom, Spacing.xs),
          backgroundColor: 'transparent',
          flexDirection: 'column',
          transform: [{ translateX }],
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
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            paddingVertical: Spacing.md,
            paddingHorizontal: Spacing.sm,
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
                  width: '100%',
                  minHeight: sidebarWidthCollapsed,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  paddingVertical: Spacing.sm,
                  paddingHorizontal: Spacing.md,
                  marginBottom: Spacing.sm,
                  borderRadius: BorderRadius.lg,
                  backgroundColor: isActive ? brandColor + '22' : 'transparent',
                }}
                accessibilityRole="button"
                accessibilityLabel={tab.title}
                accessibilityState={{ selected: isActive }}
              >
                <View style={{ marginRight: Spacing.md }}>
                  <TabIcon Icon={tab.Icon} color={tabColor} size={32} showDot={showDot} />
                </View>
                <Animated.View
                  style={{
                    flex: 1,
                    opacity: textOpacity,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: isActive ? '600' : '500',
                      color: tabColor,
                      marginLeft: Spacing.xs,
                    }}
                    numberOfLines={1}
                  >
                    {tab.title}
                  </Text>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </LiquidGlassView>
      </Animated.View>
    </>
  );
}


