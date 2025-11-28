// app/user/[uid].tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useReviewService } from '@/providers/ServicesProvider';
import { ProfileHeader, ProfileStats } from '@/components/features/profile';
import { UserReviewList, StarRating } from '@/components/review';
import type { UserProfile, UserReview } from '@/types';

export default function PublicUserProfileScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const reviewService = useReviewService();
  
  const getProfile = useUserProfileStore((state) => state.getProfile);
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<UserReview[]>([]);

  // Load user profile
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const profile = await getProfile(uid, false);
        if (alive) {
          setUser(profile);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        if (alive) {
          setUser(null);
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [uid, getProfile]);

  // Subscribe to user reviews
  useEffect(() => {
    if (!uid) {
      setReviews([]);
      return;
    }

    const unsubscribe = reviewService.subscribeToUserReviews(uid, (reviewList) => {
      setReviews(reviewList);
    });

    return () => unsubscribe();
  }, [uid, reviewService]);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText style={{ marginTop: Spacing.sm }}>Carregando perfil…</ThemedText>
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type="title-2" style={{ marginBottom: Spacing.sm, textAlign: 'center' }}>
          Usuário não encontrado
        </ThemedText>
        <ThemedText type="body" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center' }}>
          O perfil que você está procurando não existe ou foi removido.
        </ThemedText>
      </ThemedView>
    );
  }

  const borderOpacity = { default: colors.border.default + '40' };

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView 
        contentContainerStyle={{ 
          padding: Spacing.sm, 
          paddingTop: Spacing.sm + insets.top + 90, // Account for header height (approx 90px) + safe area
          paddingBottom: Spacing.lg 
        }}
      >
        <ThemedText type="large-title" style={{ marginBottom: Spacing.lg }}>
          Perfil público
        </ThemedText>

        {/* Profile Card */}
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
          <ProfileHeader user={user} colors={colors} />
          <ProfileStats user={user} colors={colors} borderOpacity={borderOpacity} />
        </LiquidGlassView>

        {/* Rating Summary */}
        {user.ratingCount && user.ratingCount > 0 && user.ratingAvg && (
          <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md, marginBottom: Spacing.md }}>
            <View style={{ alignItems: 'center', gap: Spacing.sm }}>
              <StarRating value={user.ratingAvg} size={28} />
              <ThemedText type="title-1" style={{ fontWeight: '700', color: colors.isDark ? colors.brand.primary : colors.brand.dark }}>
                {user.ratingAvg.toFixed(1)}
              </ThemedText>
              <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
                {user.ratingCount} {user.ratingCount === 1 ? 'avaliação' : 'avaliações'}
              </ThemedText>
            </View>
          </LiquidGlassView>
        )}

        {/* Lista de avaliações */}
        {reviews.length > 0 && (
          <View style={{ marginTop: Spacing.md }}>
            <ThemedText 
              type="title-2" 
              style={{ 
                marginBottom: Spacing.sm,
                fontWeight: '700',
              }}
            >
              Avaliações recebidas
            </ThemedText>
            <UserReviewList reviews={reviews} />
          </View>
        )}

        {reviews.length === 0 && user.ratingCount === 0 && (
          <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md, alignItems: 'center' }}>
            <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center' }}>
              Este usuário ainda não recebeu avaliações.
            </ThemedText>
          </LiquidGlassView>
        )}
      </ScrollView>
    </ThemedView>
  );
}

