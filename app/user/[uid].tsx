// app/user/[uid].tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReviewService } from '@/providers/ServicesProvider';
import { ProfileHeader, ProfileStats } from '@/components/features/profile';
import { UserReviewList, StarRating } from '@/components/review';
import { ItemCard } from '@/components/features/items';
import { useUserPublicItems } from '@/hooks/features/items';
import { useResponsiveGrid } from '@/hooks/features/items';
import { auth } from '@/lib/firebase';
import { getPublicUserProfile } from '@/services/cloudFunctions';
import type { UserProfile, UserReview } from '@/types';

export default function PublicUserProfileScreen() {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const reviewService = useReviewService();
  const currentUserId = auth.currentUser?.uid;
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  
  // Fetch user's public items
  const { items: userItems, loading: itemsLoading } = useUserPublicItems(uid, true);
  const grid = useResponsiveGrid(12);
  
  // Check if viewing own profile
  const isOwnProfile = uid === currentUserId;

  // Load user profile via Cloud Function (bypasses Firestore security rules)
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        console.log('[PublicUserProfile] Loading profile for uid:', uid);
        
        // Buscar perfil via Cloud Function (contorna regras do Firestore)
        const profileData = await getPublicUserProfile(uid);
        
        if (!alive) return;
        
        if (!profileData) {
          console.warn('[PublicUserProfile] Profile not found for uid:', uid);
          setUser(null);
          setLoading(false);
          return;
        }

        console.log('[PublicUserProfile] Profile data loaded:', profileData);
        
        // Converter para UserProfile format
        const profile: UserProfile = {
          uid: profileData.uid,
          name: profileData.name || '(Sem nome)',
          email: profileData.email || '',
          photoURL: profileData.photoURL,
          ratingAvg: profileData.ratingAvg ?? undefined,
          ratingCount: profileData.ratingCount ?? undefined,
          transactionsTotal: profileData.transactionsTotal ?? undefined,
        };
        
        if (alive) {
          setUser(profile);
        }
      } catch (error: any) {
        console.error('[PublicUserProfile] Error loading user profile:', error);
        console.error('[PublicUserProfile] Error code:', error?.code);
        console.error('[PublicUserProfile] Error message:', error?.message);
        
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
  }, [uid]);

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
          <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md, alignItems: 'center', marginBottom: Spacing.md }}>
            <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center' }}>
              Este usuário ainda não recebeu avaliações.
            </ThemedText>
          </LiquidGlassView>
        )}

        {/* Produtos do usuário */}
        <View style={{ marginTop: Spacing.lg }}>
          <ThemedText 
            type="title-2" 
            style={{ 
              marginBottom: Spacing.md,
              fontWeight: '700',
            }}
          >
            Produtos disponíveis
          </ThemedText>
          
          {itemsLoading ? (
            <View style={{ padding: Spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator size="small" />
              <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ marginTop: Spacing.sm }}>
                Carregando produtos…
              </ThemedText>
            </View>
          ) : userItems.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: grid.cardSpacing }}>
              {userItems.map((item) => (
                <View key={item.id} style={{ width: grid.numColumns > 1 ? grid.cardWidth : '100%' }}>
                  <ItemCard
                    item={item}
                    width={grid.numColumns > 1 ? grid.cardWidth : undefined}
                    isMine={isOwnProfile}
                  />
                </View>
              ))}
            </View>
          ) : (
            <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md, alignItems: 'center' }}>
              <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center' }}>
                Este usuário ainda não possui produtos disponíveis para alugar/emprestar.
              </ThemedText>
            </LiquidGlassView>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}


