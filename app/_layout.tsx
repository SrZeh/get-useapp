// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Platform, View } from 'react-native';
import { AuthProvider } from '../src/providers/AuthProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* OUTER */}
        <View
          style={[
            { flex: 1 },
            isWeb
              ? {
                  alignItems: 'center' as const,
                  backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#f3f4f6',
                }
              : null,
          ]}
        >
          {/* INNER */}
          <View
            style={[
              { flex: 1 },
              isWeb
                ? {
                    width: '100%',
                    maxWidth: 420, // 360/390/420/480
                    backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#ffffff',
                  }
                : null,
            ]}
          >
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="transaction/[id]/pay" options={{ headerShown: true, title: 'Pagamento' }} />
              <Stack.Screen name="transaction/[id]/chat" options={{ headerShown: true, title: 'Chat' }} />
              <Stack.Screen name="transaction/[id]/return" options={{ headerShown: true, title: 'Devolução' }} />
              {/* <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} /> */}
            </Stack>
          </View>
        </View>

        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthProvider>
  );
}
