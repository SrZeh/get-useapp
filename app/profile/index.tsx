// app/profile/index.tsx

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, TouchableOpacity, View, useColorScheme } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTypes } from '@/utils/gradients';
import { HapticFeedback } from '@/utils/haptics';
import type { UserProfile } from '@/types';

export default function ProfileScreen() {
  const uid = auth.currentUser?.uid;
  const [u, setU] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { themeMode, setThemeMode, colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

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
                style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#96ff9a' }} 
              />
            ) : (
              <LinearGradient
                colors={GradientTypes.brand.colors}
                style={{ width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center' }}
              >
                <ThemedText style={{ color: '#fff', fontSize: 48 }}>👤</ThemedText>
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <View style={{ alignItems: 'center' }}>
              <ThemedText type="title-2" style={{ fontWeight: '700', color: '#96ff9a' }}>
                {(u?.ratingAvg ?? 5).toFixed(1)}
              </ThemedText>
              <ThemedText type="caption" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                ⭐ Avaliação
              </ThemedText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ThemedText type="title-2" style={{ fontWeight: '700', color: '#96ff9a' }}>
                {u?.ratingCount ?? 0}
              </ThemedText>
              <ThemedText type="caption" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                Avaliações
              </ThemedText>
            </View>
            <View style={{ alignItems: 'center' }}>
              <ThemedText type="title-2" style={{ fontWeight: '700', color: '#96ff9a' }}>
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
                color={u?.emailVerified ? '#08af0e' : '#ef4444'} 
              />
              <ThemedText>
                E-mail: {u?.emailVerified ? "verificado ✅" : "não verificado ❌"}
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons 
                name={u?.cpf ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={u?.cpf ? '#08af0e' : '#ef4444'} 
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
                  ? (isDark ? 'rgba(150, 255, 154, 0.2)' : 'rgba(150, 255, 154, 0.15)')
                  : 'transparent',
                borderWidth: themeMode === 'light' ? 2 : 1,
                borderColor: themeMode === 'light' ? '#96ff9a' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="sunny" size={24} color={themeMode === 'light' ? '#96ff9a' : (isDark ? '#9ca3af' : '#6b7280')} />
                <ThemedText type="body" style={{ fontWeight: themeMode === 'light' ? '600' : '400' }}>
                  Claro
                </ThemedText>
              </View>
              {themeMode === 'light' && (
                <Ionicons name="checkmark-circle" size={24} color="#96ff9a" />
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
                  ? (isDark ? 'rgba(150, 255, 154, 0.2)' : 'rgba(150, 255, 154, 0.15)')
                  : 'transparent',
                borderWidth: themeMode === 'dark' ? 2 : 1,
                borderColor: themeMode === 'dark' ? '#96ff9a' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="moon" size={24} color={themeMode === 'dark' ? '#96ff9a' : (isDark ? '#9ca3af' : '#6b7280')} />
                <ThemedText type="body" style={{ fontWeight: themeMode === 'dark' ? '600' : '400' }}>
                  Escuro
                </ThemedText>
              </View>
              {themeMode === 'dark' && (
                <Ionicons name="checkmark-circle" size={24} color="#96ff9a" />
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
                  ? (isDark ? 'rgba(150, 255, 154, 0.2)' : 'rgba(150, 255, 154, 0.15)')
                  : 'transparent',
                borderWidth: themeMode === 'system' ? 2 : 1,
                borderColor: themeMode === 'system' ? '#96ff9a' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'),
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Ionicons name="phone-portrait" size={24} color={themeMode === 'system' ? '#96ff9a' : (isDark ? '#9ca3af' : '#6b7280')} />
                <ThemedText type="body" style={{ fontWeight: themeMode === 'system' ? '600' : '400' }}>
                  Automático
                </ThemedText>
              </View>
              {themeMode === 'system' && (
                <Ionicons name="checkmark-circle" size={24} color="#96ff9a" />
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
        </View>
      </ScrollView>
    </ThemedView>
  );
}
