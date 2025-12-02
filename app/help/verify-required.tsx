/**
 * Verification Required Screen
 * 
 * Shows when user tries to create help request but isn't verified
 */

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { router } from 'expo-router';
import { Spacing } from '@/constants/spacing';
import { useThemeColors } from '@/utils';
import { useAuth } from '@/providers/AuthProvider';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { getMissingVerifications } from '@/utils/itemRequest';

export default function VerifyRequiredScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { user } = useAuth();
  const getProfile = useUserProfileStore((state) => state.getProfile);
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [missing, setMissing] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (user?.uid) {
      getProfile(user.uid, false).then((profile) => {
        setUserProfile(profile);
        if (profile) {
          setMissing(getMissingVerifications(profile));
        }
      });
    }
  }, [user?.uid, getProfile]);

  const handleVerifyEmail = () => {
    router.push('/(auth)/verify-email');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.md + insets.top + 90 } // Account for header height (approx 90px) + safe area
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="large-title" style={styles.title}>
            Verificação Necessária
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: colors.text.secondary }]}>
            Para usar o Socorro!, você precisa completar sua verificação de conta.
          </ThemedText>
        </View>
        <View style={styles.requirements}>
          <ThemedText type="title-3" style={styles.sectionTitle}>
            Requisito:
          </ThemedText>

          {missing.map((req, index) => (
            <View key={index} style={styles.requirementItem}>
              <ThemedText type="body" style={{ color: colors.semantic.error }}>
                ❌ {req}
              </ThemedText>
            </View>
          ))}

          {missing.length === 0 && (
            <ThemedText type="body" style={{ color: colors.semantic.success }}>
              ✅ Verificação completa!
            </ThemedText>
          )}
        </View>

        <View style={styles.actions}>
          {missing.includes('E-mail verificado') && (
            <Button variant="primary" size="lg" onPress={handleVerifyEmail} style={styles.button}>
              Verificar E-mail
            </Button>
          )}
        </View>

        <View style={styles.info}>
          <ThemedText type="caption-1" style={[styles.infoText, { color: colors.text.tertiary }]}>
            Por enquanto, apenas a verificação de e-mail é necessária. Mais verificações serão adicionadas em breve para maior segurança.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  requirements: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  requirementItem: {
    marginBottom: Spacing.xs,
  },
  actions: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  button: {
    width: '100%',
  },
  info: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});

