/**
 * OwnerInfo - Displays owner information on item detail page
 * 
 * Shows owner photo, name, rating, and link to public profile
 */

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { LinearGradient } from 'expo-linear-gradient';
import { StarRating } from '@/components/review';
import { useUserProfileStore } from '@/stores/userProfileStore';
import { useThemeColors } from '@/utils';
import { GradientTypes } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import type { UserProfile } from '@/types';

type OwnerInfoProps = {
  ownerUid: string;
};

export function OwnerInfo({ ownerUid }: OwnerInfoProps) {
  const colors = useThemeColors();
  const getProfile = useUserProfileStore((state) => state.getProfile);
  
  const [owner, setOwner] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ownerUid) {
      console.log('[OwnerInfo] No ownerUid provided');
      setLoading(false);
      return;
    }

    console.log('[OwnerInfo] Loading profile for ownerUid:', ownerUid);
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const profile = await getProfile(ownerUid, false);
        console.log('[OwnerInfo] Profile loaded:', profile ? { name: profile.name, hasRating: !!profile.ratingAvg } : 'null');
        if (alive) {
          setOwner(profile);
        }
      } catch (error) {
        console.error('[OwnerInfo] Error loading owner profile:', error);
        if (alive) {
          setOwner(null);
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
  }, [ownerUid, getProfile]);

  const handlePress = () => {
    if (ownerUid) {
      router.push(`/user/${ownerUid}`);
    }
  };

  if (loading) {
    return (
      <View style={{ marginBottom: Spacing.md }}>
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.lg} style={{ padding: Spacing.md }}>
          <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary">
            Carregando informações do dono...
          </ThemedText>
        </LiquidGlassView>
      </View>
    );
  }

  if (!owner) {
    return null;
  }

  const ratingAvg = owner.ratingAvg ?? 0;
  const ratingCount = owner.ratingCount ?? 0;

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      style={{ marginBottom: Spacing.md }}
    >
      <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.lg} style={{ padding: Spacing.md }}>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <ThemedText type="title-3" style={{ fontWeight: '600', marginBottom: Spacing.sm }}>
              Sobre o dono
            </ThemedText>
          </View>
          
          <View style={styles.content}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {owner.photoURL ? (
                <Image 
                  source={{ uri: owner.photoURL }} 
                  style={[styles.avatar, {
                    borderColor: colors.isDark ? colors.brand.primary : colors.brand.dark,
                  }]}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                  recyclingKey={owner.photoURL}
                />
              ) : (
                <LinearGradient
                  colors={GradientTypes.brand.colors}
                  style={styles.avatarGradient}
                >
                  <ThemedText style={[styles.avatarPlaceholder, {
                    color: colors.isDark ? colors.text.primary : '#ffffff',
                  }]}>
                    👤
                  </ThemedText>
                </LinearGradient>
              )}
            </View>

            {/* Info */}
            <View style={styles.infoContainer}>
              <ThemedText type="title-2" style={styles.name} numberOfLines={1}>
                {owner.name ?? "(Sem nome)"}
              </ThemedText>
              
              {/* Rating */}
              {ratingCount > 0 ? (
                <View style={styles.ratingContainer}>
                  <StarRating value={ratingAvg} size={16} />
                  <ThemedText 
                    type="caption-1" 
                    style={[styles.ratingText, {
                      color: colors.isDark ? colors.brand.primary : colors.brand.dark,
                      fontWeight: '600',
                    }]}
                  >
                    {ratingAvg.toFixed(1)}
                  </ThemedText>
                  <ThemedText 
                    type="caption-1" 
                    className="text-light-text-tertiary dark:text-dark-text-tertiary"
                  >
                    ({ratingCount} {ratingCount === 1 ? 'avaliação' : 'avaliações'})
                  </ThemedText>
                </View>
              ) : (
                <ThemedText 
                  type="caption-1" 
                  className="text-light-text-tertiary dark:text-dark-text-tertiary"
                  style={{ marginTop: Spacing['3xs'] }}
                >
                  Sem avaliações ainda
                </ThemedText>
              )}
            </View>
          </View>

          {/* Link to profile */}
          <View style={[styles.footer, {
            borderTopWidth: 1,
            borderTopColor: colors.border.default + '40',
          }]}>
            <ThemedText 
              type="footnote" 
              style={[styles.linkText, {
                color: colors.isDark ? colors.brand.primary : colors.brand.dark,
              }]}
            >
              Ver perfil completo →
            </ThemedText>
          </View>
        </View>
      </LiquidGlassView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    marginRight: Spacing.xs,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },
  avatarGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    fontSize: 28,
  },
  infoContainer: {
    flex: 1,
    gap: Spacing['3xs'],
  },
  name: {
    fontWeight: '700',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2xs'],
    marginTop: Spacing['3xs'],
  },
  ratingText: {
    marginLeft: Spacing['3xs'],
  },
  footer: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  linkText: {
    fontWeight: '600',
  },
});

