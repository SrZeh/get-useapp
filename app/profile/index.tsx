// app/profile/index.tsx

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTypes, HapticFeedback } from '@/utils';
import type { UserProfile } from '@/types';
import { useThemeColors, useBorderColorsWithOpacity, useBrandColorsWithOpacity, hexToRgba } from '@/utils/theme';

export default function ProfileScreen() {
  const uid = auth.currentUser?.uid;
  const [u, setU] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { themeMode, setThemeMode, colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();
  const borderOpacity = useBorderColorsWithOpacity();
  const brandOpacity = useBrandColorsWithOpacity();

  useEffect(() => {
    (async () => {
      if (!uid) { setLoading(false); return; }
      const snap = await getDoc(doc(db, "users", uid));
      if (snap.exists()) {
        const data = snap.data() as Partial<UserProfile>;
        setU({ uid, ...data } as UserProfile);
      } else {
        setU(null);
      }
      setLoading(false);
    })();
  }, [uid]);

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    HapticFeedback.selection();
    setThemeMode(mode);
  };

  const handleLogout = () => {
    HapticFeedback.medium();

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Tem certeza que deseja sair?');
      if (!confirmed) return;

      signOut(auth)
        .then(() => {
          HapticFeedback.success();
          router.replace('/(auth)/login');
        })
        .catch((error) => {
          HapticFeedback.error();
          const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer logout';
          window.alert(`Erro ao sair\n\n${errorMessage}`);
        });
    } else {
      Alert.alert(
        'Sair',
        'Tem certeza que deseja sair?',
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut(auth);
                HapticFeedback.success();
                router.replace('/(auth)/login');
              } catch (error) {
                HapticFeedback.error();
                const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer logout';
                Alert.alert('Erro ao sair', errorMessage);
              }
            },
          },
        ]
      );
    }
  };

  if (!uid) {
    return (
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24, width: '100%', maxWidth: 400 }}>
          <ThemedText type="title" style={{ textAlign: 'center', marginBottom: 16 }}>
            Meu Perfil
          </ThemedText>
          <ThemedText className="mt-2" style={{ textAlign: 'center', marginBottom: 24 }}>
            Você não está logado.
          </ThemedText>
          <Button variant="primary" onPress={() => router.push("/(auth)/login")} fullWidth>
            Entrar
          </Button>
        </LiquidGlassView>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: 16 }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <ThemedText type="large-title" style={{ marginBottom: 24 }}>
          Meu Perfil
        </ThemedText>

        {/* Profile Card */}
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24, marginBottom: 24 }}>
          <View style={{ alignItems: "center", gap: 12, marginBottom: 24 }}>
            {u?.photoURL ? (
              <Image 
                source={{ uri: u.photoURL }} 
                style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: colors.isDark ? colors.brand.primary : colors.brand.dark }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                recyclingKey={u.photoURL}
              />
            ) : (
              <LinearGradient
                colors={GradientTypes.brand.colors}
                style={{ width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' }}
              >
                <ThemedText style={{ color: colors.isDark ? colors.text.primary : '#ffffff', fontSize: 48 }}>👤</ThemedText>
              </LinearGradient>
            )}
            <ThemedText type="title" style={{ fontWeight: '700' }}>
              {u?.name ?? "(Sem nome)"}
            </ThemedText>
            <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
              {u?.email}
            </ThemedText>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: borderOpacity.default }}>
            <View style={{ alignItems: 'center' }}>
              <ThemedText type="title-2" style={{ fontWeight: '700', color: colors.isDark ? colors.brand.primary : colors.brand.dark }}>
                {(u?.ratingAvg ?? 5).toFixed(1)}
              </ThemedText>
              <ThemedText type="caption" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                ⭐ Avaliação
              </ThemedText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ThemedText type="title-2" style={{ fontWeight: '700', color: colors.isDark ? colors.brand.primary : colors.brand.dark }}>
                {u?.ratingCount ?? 0}
              </ThemedText>
              <ThemedText type="caption" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                Avaliações
              </ThemedText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ThemedText type="title-2" style={{ fontWeight: '700', color: colors.isDark ? colors.brand.primary : colors.brand.dark }}>
                {u?.transactionsTotal ?? 0}
              </ThemedText>
              <ThemedText type="caption" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                Transações
              </ThemedText>
            </View>
          </View>

          {/* Verification Status */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons 
                name={u?.emailVerified ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={u?.emailVerified ? colors.brand.dark : colors.semantic.error} 
              />
              <ThemedText>
                E-mail: {u?.emailVerified ? "verificado ✅" : "não verificado ❌"}
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons 
                name={u?.cpf ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={u?.cpf ? colors.brand.dark : colors.semantic.error} 
              />
              <ThemedText>
                {u?.cpf ? "CPF verificado" : "CPF não verificado"}
              </ThemedText>
            </View>
          </View>
        </LiquidGlassView>

        {/* Theme Selector */}
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 20, marginBottom: 24 }}>
          <ThemedText type="title-small" style={{ marginBottom: 16, fontWeight: '600' }}>
            Aparência
          </ThemedText>
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={() => handleThemeChange('light')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderRadius: 16,
                backgroundColor: themeMode === 'light' 
                  ? (colors.isDark ? brandOpacity.primary.medium : brandOpacity.dark.medium)
                  : 'transparent',
                borderWidth: themeMode === 'light' ? 2 : 1,
                borderColor: themeMode === 'light' 
                  ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                  : borderOpacity.default,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons 
                  name="sunny" 
                  size={24} 
                  color={themeMode === 'light' 
                    ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                    : colors.text.tertiary} 
                />
                <ThemedText type="body" style={{ fontWeight: themeMode === 'light' ? '600' : '400' }}>
                  Claro
                </ThemedText>
              </View>
              {themeMode === 'light' && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleThemeChange('dark')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderRadius: 16,
                backgroundColor: themeMode === 'dark' 
                  ? (colors.isDark ? brandOpacity.primary.medium : brandOpacity.dark.medium)
                  : 'transparent',
                borderWidth: themeMode === 'dark' ? 2 : 1,
                borderColor: themeMode === 'dark' 
                  ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                  : borderOpacity.default,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons 
                  name="moon" 
                  size={24} 
                  color={themeMode === 'dark' 
                    ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                    : colors.text.tertiary} 
                />
                <ThemedText type="body" style={{ fontWeight: themeMode === 'dark' ? '600' : '400' }}>
                  Escuro
                </ThemedText>
              </View>
              {themeMode === 'dark' && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleThemeChange('system')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderRadius: 16,
                backgroundColor: themeMode === 'system' 
                  ? (colors.isDark ? brandOpacity.primary.medium : brandOpacity.dark.medium)
                  : 'transparent',
                borderWidth: themeMode === 'system' ? 2 : 1,
                borderColor: themeMode === 'system' 
                  ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                  : borderOpacity.default,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons 
                  name="phone-portrait" 
                  size={24} 
                  color={themeMode === 'system' 
                    ? (colors.isDark ? colors.brand.primary : colors.brand.dark)
                    : colors.text.tertiary} 
                />
                <ThemedText type="body" style={{ fontWeight: themeMode === 'system' ? '600' : '400' }}>
                  Automático
                </ThemedText>
              </View>
              {themeMode === 'system' && (
                <Ionicons 
                  name="checkmark-circle" 
                  size={24} 
                  color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
                />
              )}
            </TouchableOpacity>
          </View>
        </LiquidGlassView>

        {/* Actions */}
        <View style={{ gap: 12 }}>
          <Button 
            variant="primary" 
            onPress={() => router.push("/profile/edit")}
            fullWidth
            style={{ marginBottom: 8 }}
          >
            Editar perfil
          </Button>
          <Button 
            variant="secondary" 
            onPress={() => router.push("/profile/reviews")}
            fullWidth
          >
            Ver avaliações
          </Button>
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.8}
            style={{
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              marginTop: 8,
              backgroundColor: colors.isDark ? hexToRgba(colors.semantic.error, 0.2) : hexToRgba(colors.semantic.error, 0.15),
              borderWidth: 1,
              borderColor: colors.semantic.error,
              flexDirection: 'row',
              gap: 8,
            }}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.semantic.error} />
            <ThemedText style={{ color: colors.semantic.error, fontWeight: '600' }}>
              Sair
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
