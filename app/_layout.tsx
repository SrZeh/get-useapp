// app/_layout.tsx
// import { OnboardingProvider } from "@/providers/OnboardingProvider";
// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';
// import { CoachmarksProvider } from '@/providers/CoachmarksProvider';
// import { Platform, View } from 'react-native';
// import { AuthProvider } from '../src/providers/AuthProvider';

// export const unstable_settings = {
//   anchor: '(tabs)',
// };

// export default function RootLayout() {
//   const colorScheme = useColorScheme();
//   const isWeb = Platform.OS === 'web';

//   return (
//     <AuthProvider>
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         {/* OUTER */}
//         <View
//           style={[
//             { flex: 1 },
//             isWeb
//               ? {
//                   alignItems: 'center' as const,
//                   backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#f3f4f6',
//                 }
//               : null,
//           ]}
//         >
//           {/* INNER */}
//           <View
//             style={[
//               { flex: 1 },
//               isWeb
//                 ? {
//                     width: '100%',
//                     maxWidth: 420, // 360/390/420/480
//                     backgroundColor: colorScheme === 'dark' ? '#0b1220' : '#ffffff',
//                   }
//                 : null,
//             ]}
//           >
//             <OnboardingProvider>
//               <CoachmarksProvider>
//             <Stack>
//               <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Teste' }} />
//               <Stack.Screen name="transaction/[id]/pay" options={{ headerShown: true, title: 'Pagamento' }} />
//               <Stack.Screen name="transaction/[id]/chat" options={{ headerShown: true, title: 'Chat' }} />
//               <Stack.Screen name="transaction/[id]/return" options={{ headerShown: true, title: 'Devolução' }} />
//               {/* <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} /> */}
//             </Stack>
//             </CoachmarksProvider>
//             </OnboardingProvider>
//           </View>
//         </View>

//         <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }



// app/_layout.tsx
import { ThemedText } from "@/components/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Link, Stack } from "expo-router";
import React from "react";
import { Image, Pressable } from "react-native";

function TitleLogoLink() {
  return (
    <Link href="/" asChild>
      <Pressable
        accessibilityRole="link"
        style={{ flexDirection: "row", alignItems: "center" }}
        android_ripple={{ borderless: true }}
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 24, height: 24, marginRight: 8 }}
          resizeMode="contain"
        />
        <ThemedText type="defaultSemiBold">Get &amp; Use</ThemedText>
      </Pressable>
    </Link>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme() ?? "light";
  const palette = Colors[scheme];

  return (
    <Stack
      screenOptions={{
        headerBackTitleVisible: false,
        headerTitleAlign: "left",
        headerTitle: () => <TitleLogoLink />,          // 👈 evita mostrar o path
        headerStyle: { backgroundColor: palette.background },
        headerTintColor: palette.text,
        headerTitleStyle: { color: palette.text },
      }}
    >
      {/* Nas tabs usamos o header das próprias Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Qualquer outra tela (detalhes, pagamento, etc.) herda o header acima */}
    </Stack>
  );
}
