// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
// Se não tiver alias "@/providers", mantenha seu caminho atual:
import { AuthProvider } from '../src/providers/AuthProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

          {/* Registre as telas dinâmicas que você já usa */}
          <Stack.Screen
            name="transaction/[id]/pay"
            options={{ headerShown: true, title: 'Pagamento' }}
          />
          <Stack.Screen
            name="transaction/[id]/chat"
            options={{ headerShown: true, title: 'Chat' }}
          />
          <Stack.Screen
            name="transaction/[id]/return"
            options={{ headerShown: true, title: 'Devolução' }}
          />

          {/* Remova se não existir app/modal.tsx */}
          {/* <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} /> */}
        </Stack>

        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthProvider>
  );
}
