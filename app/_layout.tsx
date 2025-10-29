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
import { WebStyles } from "@/components/WebStyles";
import { Colors } from "@/constants/theme";
import { OnboardingProvider } from "@/providers/OnboardingProvider";
import { CoachmarksProvider } from "@/providers/CoachmarksProvider";
import { ThemeProvider as CustomThemeProvider, useColorScheme } from "@/providers/ThemeProvider";
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Link, Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import React, { useMemo } from "react";
import { Platform, Pressable, View } from "react-native";
import { Image } from "expo-image";
import { AuthProvider } from '../src/providers/AuthProvider';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useThemeColors } from "@/utils";
import { ServicesProvider } from "@/providers/ServicesProvider";

export const unstable_settings = {
  anchor: '(tabs)',
};

function LogoIcon() {
  return (
    <Link href="/" asChild>
      <Pressable
        accessibilityRole="link"
        style={{ alignItems: "center", justifyContent: "center" }}
        android_ripple={{ borderless: true }}
        accessibilityLabel="Get & Use"
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 28, height: 28 }}
          contentFit="contain"
          transition={200}
        />
      </Pressable>
    </Link>
  );
}

function AppContent() {
  const scheme = useColorScheme();
  const colors = useThemeColors();
  const isWeb = Platform.OS === 'web';

  // Memoize screen options to ensure they update when theme changes
  const screenOptions = useMemo(() => ({
    headerTitleAlign: "center" as const,
    headerTitle: () => <LogoIcon />,
    headerStyle: { backgroundColor: colors.bg.primary },
    headerTintColor: colors.text.primary,
    headerTitleStyle: { color: colors.text.primary },
  }), [colors]);

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

  // Determine navigation theme based on current color scheme
  const navigationTheme = useMemo(() => 
    scheme === 'dark' ? DarkTheme : DefaultTheme,
    [scheme]
  );

  // Web-specific responsive container
  if (isWeb) {
    return (
      <ThemeProvider value={navigationTheme}>
        <View
          style={{
            flex: 1,
            width: '100%',
            backgroundColor: colors.bg.tertiary,
          }}
        >
          <OnboardingProvider>
            <CoachmarksProvider>
              {content}
            </CoachmarksProvider>
          </OnboardingProvider>
        </View>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    );
  }

  // Native mobile
  return (
    <ThemeProvider value={navigationTheme}>
      <OnboardingProvider>
        <CoachmarksProvider>
          {content}
        </CoachmarksProvider>
      </OnboardingProvider>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ServicesProvider>
          <CustomThemeProvider>
            <AppContent />
          </CustomThemeProvider>
        </ServicesProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
