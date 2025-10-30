/**
 * Profile Layout - Stack navigator with global header
 * 
 * Applies the same global header configuration as the tabs layout:
 * - HeaderMenu (left)
 * - HeaderLogo (center)
 * - AuthHeaderRight (right)
 * - HeaderBackground (transparent liquid glass)
 */

import { AuthHeaderRight } from "@/components/features/auth";
import { useThemeColors } from "@/utils";
import { Stack } from "expo-router";
import React, { useMemo } from "react";
import { LiquidGlassView } from "@/components/liquid-glass";
import { HeaderLogo } from '@/components/layouts';
import { HeaderMenu } from '@/components/HeaderMenu';
import { useAuth } from "@/providers/AuthProvider";

// Centered header title should be the logo
function HeaderTitleLogo() {
  return <HeaderLogo />;
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

export default function ProfileLayout() {
  const colors = useThemeColors();
  const { user } = useAuth();
  const isLoggedIn = !!user;

  // Memoize screen options to ensure they update when theme changes
  const screenOptions = useMemo(() => ({
    headerShown: true,
    headerTitleAlign: "center" as const,
    headerTitle: () => <HeaderTitleLogo />,
    headerLeft: () => <HeaderMenu />,
    headerRight: () => <AuthHeaderRight />,
    headerBackground: () => <HeaderBackground />,
    headerTransparent: true,
    headerTintColor: colors.text.primary,
    headerTitleStyle: { color: colors.text.primary },
  }), [colors, isLoggedIn]);

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="reviews" />
    </Stack>
  );
}

