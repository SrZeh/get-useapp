// app/profile/reviews.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { View, ScrollView } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfileStore } from '@/stores/userProfileStore';

function Stars({ value = 0 }: { value?: number }) {
  const filled = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1,2,3,4,5].map((i) => (
        <ThemedText key={i} type="defaultSemiBold">{i <= filled ? '★' : '☆'}</ThemedText>
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const uid = auth.currentUser?.uid ?? '';
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  // Get profile from store (shared listener, no duplicate query!)
  const currentUserProfile = useUserProfileStore((state) => state.currentUserProfile);
  const currentUserLoading = useUserProfileStore((state) => state.currentUserLoading);
  const subscribeToCurrentUser = useUserProfileStore((state) => state.subscribeToCurrentUser);

  // Subscribe to current user profile (shared listener)
  useEffect(() => {
    if (uid) {
      subscribeToCurrentUser();
    }
  }, [uid, subscribeToCurrentUser]);

  // Extract rating data from profile
  const avg = typeof currentUserProfile?.ratingAvg === 'number' ? currentUserProfile.ratingAvg : null;
  const count = typeof currentUserProfile?.ratingCount === 'number' ? currentUserProfile.ratingCount : 0;

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: Spacing.sm, 
          paddingTop: Spacing.sm + insets.top + 90, // Account for header height (approx 90px) + safe area
          paddingBottom: Spacing.lg 
        }}
      >
        <ThemedText type="large-title" style={{ marginBottom: Spacing.lg }}>Minha reputação</ThemedText>

        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
          {avg == null || count === 0 ? (
            <View style={{ alignItems: 'center' }}>
              <ThemedText type="title-2" style={{ marginBottom: 8, textAlign: 'center' }}>
                Você ainda não recebeu avaliações.
              </ThemedText>
              <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center', marginTop: 8 }}>
                Continue usando o app para receber avaliações!
              </ThemedText>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Stars value={avg} />
              </View>
              <ThemedText type="title-1" style={{ fontWeight: '700', color: colors.isDark ? colors.brand.primary : colors.brand.dark, marginBottom: 8 }}>
                {avg.toFixed(1)}
              </ThemedText>
              <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
                {count} {count === 1 ? 'avaliação' : 'avaliações'}
              </ThemedText>
            </View>
          )}
        </LiquidGlassView>

        <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.sm }}>
          <ThemedText type="footnote" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center' }}>
            As mensagens dos avaliadores ficam somente nos reviews dos itens.
          </ThemedText>
        </LiquidGlassView>
      </ScrollView>
    </ThemedView>
  );
}
