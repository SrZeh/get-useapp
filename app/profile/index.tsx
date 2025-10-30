/**
 * Profile Screen - User profile display and settings
 * 
 * Refactored to use extracted components:
 * - ProfileHeader: Photo, name, email
 * - ProfileStats: Rating, reviews count, transactions
 * - ProfileVerification: Email/CPF verification status
 * - ThemeSelector: Theme mode picker
 * - SupportModal: Support contact modal
 */

import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, View, Platform, Alert , ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/lib/firebase';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';

import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { HapticFeedback } from '@/utils';
import { useThemeColors, useBorderColorsWithOpacity, useBrandColorsWithOpacity, hexToRgba } from '@/utils/theme';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfileData } from '@/hooks/features/profile';
import {
  ProfileHeader,
  ProfileStats,
  ProfileVerification,
  ThemeSelector,
  SupportModal,
} from '@/components/features/profile';

export default function ProfileScreen() {
  const uid = auth.currentUser?.uid;
  const { user, loading } = useProfileData();
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const { themeMode, setThemeMode } = useTheme();
  const colors = useThemeColors();
  const borderOpacity = useBorderColorsWithOpacity();
  const brandOpacity = useBrandColorsWithOpacity();
  const insets = useSafeAreaInsets();
  
  // Calculate bottom padding for GlobalTabBar (approx 70px + safe area insets)
  const tabBarHeight = Platform.select({
    ios: 70 + insets.bottom,
    android: 70 + insets.bottom,
    default: 70,
  });

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

  const handleSupportPress = () => {
    HapticFeedback.light();
    setSupportModalVisible(true);
  };

  if (!uid) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: "center", alignItems: "center" }}>
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md, width: '100%', maxWidth: 400 }}>
          <ThemedText type="title" style={{ textAlign: 'center', marginBottom: Spacing.sm }}>
            Meu Perfil
          </ThemedText>
          <ThemedText className="mt-2" style={{ textAlign: 'center', marginBottom: Spacing.md }}>
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
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: Spacing.sm }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: 16, 
          paddingTop: 16 + insets.top + 90, // Account for header height (approx 90px) + safe area
          paddingBottom: 32 + tabBarHeight 
        }}
      >
        <ThemedText type="large-title" style={{ marginBottom: 24 }}>
          Meu Perfil
        </ThemedText>

        {/* Profile Card */}
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24, marginBottom: 24 }}>
          <ProfileHeader user={user} colors={colors} />
          <ProfileStats user={user} colors={colors} borderOpacity={borderOpacity} />
          <ProfileVerification user={user} colors={colors} />
        </LiquidGlassView>

        {/* Theme Selector */}
        <ThemeSelector
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
          colors={colors}
          borderOpacity={borderOpacity}
          brandOpacity={brandOpacity}
        />

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
            onPress={handleSupportPress}
            activeOpacity={0.8}
            style={{ width: '100%' }}
          >
            <LiquidGlassView
              intensity="standard"
              tint="light"
              cornerRadius={20}
              opacity={0.7}
              style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 48,
                flexDirection: 'row',
                gap: 8,
                backgroundColor: 'rgba(0, 122, 255, 0.25)', // iOS blue with transparency for glass effect
                borderWidth: 1,
                borderColor: '#007AFF',
              }}
            >
              <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
              <ThemedText style={{ color: '#007AFF', fontWeight: '600', fontSize: 17 }}>
                Suporte
              </ThemedText>
            </LiquidGlassView>
          </TouchableOpacity>
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

      {/* Support Modal */}
      <SupportModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
        colors={colors}
        brandOpacity={brandOpacity}
      />
    </ThemedView>
  );
}
