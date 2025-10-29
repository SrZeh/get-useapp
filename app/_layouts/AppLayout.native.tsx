/**
 * Native-specific App Layout
 * 
 * Platform-specific layout configuration for iOS and Android.
 * Handles native-specific styling and container setup.
 */

import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { OnboardingProvider } from '@/providers/OnboardingProvider';
import { CoachmarksProvider } from '@/providers/CoachmarksProvider';
import { GlobalTabBar } from '@/components/GlobalTabBar';
import { useColorScheme } from '@/providers/ThemeProvider';
import { useThemeColors } from '@/utils';

interface AppLayoutProps {
  screenOptions: {
    headerTitleAlign: 'center';
    headerTitle: () => React.ReactNode;
    headerStyle: { backgroundColor: string };
    headerTintColor: string;
    headerTitleStyle: { color: string };
  };
}

/**
 * Native-specific layout wrapper
 * Provides native-specific container styling
 */
export function AppLayoutNative({ screenOptions }: AppLayoutProps) {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  
  const navigationTheme = useMemo(() => 
    scheme === 'dark' ? DarkTheme : DefaultTheme,
    [scheme]
  );

  const content = (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="transaction/[id]/pay" options={{ headerShown: true, title: 'Pagamento' }} />
      <Stack.Screen name="transaction/[id]/chat" options={{ headerShown: true, title: 'Chat' }} />
      <Stack.Screen name="transaction/[id]/return" options={{ headerShown: true, title: 'Devolução' }} />
    </Stack>
  );

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
        {/* Content */}
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

