/**
 * AppContent - Main app content wrapper component
 * 
 * Handles screen options and platform-specific rendering.
 * Extracted from app/_layout.tsx to follow component composition pattern.
 */

import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/providers/ThemeProvider';
import { useThemeColors } from '@/utils';
import { HeaderLogo } from '@/components/layouts';
import { OnboardingProvider } from '@/providers/OnboardingProvider';
import { CoachmarksProvider } from '@/providers/CoachmarksProvider';
import { GlobalTabBar } from '@/components/GlobalTabBar';
import { WebStyles } from '@/components/WebStyles';

/**
 * AppContent component
 * Handles screen options, navigation theme, and platform-specific layout
 */
export function AppContent() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const isWeb = Platform.OS === 'web';

  // Memoize screen options to ensure they update when theme changes
  const screenOptions = useMemo(() => ({
    headerTitleAlign: "center" as const,
    headerTitle: () => <HeaderLogo />,
    headerStyle: { backgroundColor: colors.bg.primary },
    headerTintColor: colors.text.primary,
    headerTitleStyle: { color: colors.text.primary },
  }), [colors]);

  // Determine navigation theme based on current color scheme
  const navigationTheme = useMemo(() => 
    scheme === 'dark' ? DarkTheme : DefaultTheme,
    [scheme]
  );

  const content = (
    <>
      {isWeb && <WebStyles />}
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="transaction/[id]/pay" options={{ headerShown: true, title: 'Pagamento' }} />
        <Stack.Screen name="transaction/[id]/chat" options={{ headerShown: true, title: 'Chat' }} />
        <Stack.Screen name="transaction/[id]/return" options={{ headerShown: true, title: 'Devolução' }} />
      </Stack>
    </>
  );

  // Platform-specific container styling
  if (isWeb) {
    return (
      <ThemeProvider value={navigationTheme}>
        <View
          style={{
            flex: 1,
            width: '100%',
            flexDirection: 'column',
            backgroundColor: colors.bg.tertiary,
            position: 'relative',
          }}
        >
          <View style={{ flex: 1, position: 'relative' }}>
            <OnboardingProvider>
              <CoachmarksProvider>
                <View style={{ flex: 1 }}>
                  {content}
                </View>
                <GlobalTabBar />
              </CoachmarksProvider>
            </OnboardingProvider>
          </View>
        </View>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    );
  }

  // Native mobile
  return (
    <ThemeProvider value={navigationTheme}>
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          backgroundColor: colors.bg.primary,
          position: 'relative',
        }}
      >
        <View style={{ flex: 1, position: 'relative' }}>
          <OnboardingProvider>
            <CoachmarksProvider>
              <View style={{ flex: 1 }}>
                {content}
              </View>
              <GlobalTabBar />
            </CoachmarksProvider>
          </OnboardingProvider>
        </View>
      </View>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

