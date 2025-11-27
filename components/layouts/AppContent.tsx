/**
 * AppContent - Main app content wrapper component
 * 
 * Handles screen options and platform-specific rendering.
 * Extracted from app/_layout.tsx to follow component composition pattern.
 */

import React, { useMemo } from 'react';
import { Platform, View } from 'react-native';
import { Stack, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useColorScheme } from '@/providers/ThemeProvider';
import { useThemeColors } from '@/utils';
import { AnimatedItemsBackground, ScreenTransitionLayer, useAppHeaderOptions } from '@/components/layouts';
import { OnboardingProvider } from '@/providers/OnboardingProvider';
import { CoachmarksProvider } from '@/providers/CoachmarksProvider';
import { GlobalSidebar } from '@/components/GlobalSidebar';
import { WebStyles } from '@/components/WebStyles';

/**
 * AppContent component
 * Handles screen options, navigation theme, and platform-specific layout
 */
export function AppContent() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const isWeb = Platform.OS === 'web';
  const pathname = usePathname();

  const transitionAccent = useMemo(
    () => (colors.isDark ? 'rgba(14, 18, 28, 0.7)' : 'rgba(150, 255, 154, 0.22)'),
    [colors.isDark]
  );

  // Get memoized header options from reusable component
  const screenOptions = useAppHeaderOptions();

  // Determine navigation theme based on current color scheme
  const navigationTheme = useMemo(() => 
    scheme === 'dark' ? DarkTheme : DefaultTheme,
    [scheme]
  );

  const stackContent = (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="index" />
      <Stack.Screen name="items" />
      <Stack.Screen name="transactions" />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="transaction/[id]/pay" options={{ headerShown: true, title: 'Pagamento' }} />
      <Stack.Screen name="transaction/[id]/chat" options={{ headerShown: true, title: 'Chat' }} />
      <Stack.Screen name="transaction/[id]/return" options={{ headerShown: true, title: 'Devolução' }} />
    </Stack>
  );

  // Verificar se está na home para mostrar animação de ícones
  const isHome = pathname === '/' || pathname === '' || pathname === '/index';

  const layeredContent = (
    <>
      {isWeb && <WebStyles />}
      {isWeb && (
        <Head>
          <title>Precisou? Get&Use | Aluguel de items em geral</title>
        </Head>
      )}
      {/* Animação de ícones apenas na home - único diferencial */}
      {isHome && (
        <AnimatedItemsBackground seed={pathname} accentColor={transitionAccent} duration={8200} />
      )}
      {/* Todas as telas entram normalmente, sem transição especial */}
      <ScreenTransitionLayer 
        transitionKey={pathname} 
        backgroundColor={colors.bg.primary} 
        delay={0}
        enabled={false}
      >
        {stackContent}
      </ScreenTransitionLayer>
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
                <View style={{ flex: 1, position: 'relative' }}>
                  {layeredContent}
                  <GlobalSidebar />
                </View>
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
                {layeredContent}
                <GlobalSidebar />
              </View>
            </CoachmarksProvider>
          </OnboardingProvider>
        </View>
      </View>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
