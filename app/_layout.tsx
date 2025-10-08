// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Platform, View } from 'react-native';
// Se não tiver alias "@/providers", mantenha seu caminho atual:
import { AuthProvider } from '../src/providers/AuthProvider';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isWeb = Platform.OS === 'web';

  // fundo da página (apenas web)
  const outerStyle = isWeb
    ? {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#f3f4f6',
      }
    : { flex: 1 };

  // “aparelho” centralizado (apenas web)
  const innerStyle = isWeb
    ? {
        flex: 1,
        width: '100%',
        maxWidth: 420, // ajuste aqui: 360 / 390 / 420 / 480
        backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#ffffff',
      }
    : { flex: 1 };

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <View style={outerStyle}>
          <View style={innerStyle}>
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
          </View>
        </View>

        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AuthProvider>
  );
}
