import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { StarRating } from '@/components/review';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/utils';
import { useUserProfileStore } from '@/stores/userProfileStore';
import type { Item } from '@/types';
import { Spacing, BorderRadius } from '@/constants/spacing';

type ItemHeaderProps = {
  item: Item;
};

/**
 * ItemHeader component - displays item details header section
 * 
 * Features:
 * - Item image display with improved size and visual appeal
 * - Enhanced typography hierarchy with better spacing
 * - Refined color usage following design system
 * - Location information
 * - Description
 */
export function ItemHeader({ item }: ItemHeaderProps) {
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();
  
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [ownerRating, setOwnerRating] = useState<number | null>(null);
  const [ownerLoading, setOwnerLoading] = useState(false);

  // Debug: Log state changes
  useEffect(() => {
    console.log('[ItemHeader] State changed:', { ownerName, ownerRating, ownerLoading, hasOwnerUid: !!item.ownerUid });
  }, [ownerName, ownerRating, ownerLoading, item.ownerUid]);

  // Improved image height: 360px for better visual impact (was 280px)
  const IMAGE_HEIGHT = 360;

  // Load owner name and rating using the same method as user profile page
  const getProfile = useUserProfileStore((state) => state.getProfile);
  
  useEffect(() => {
    if (!item.ownerUid) {
      console.log('[ItemHeader] No ownerUid, clearing state');
      setOwnerName(null);
      setOwnerRating(null);
      setOwnerLoading(false);
      return;
    }

    console.log('[ItemHeader] Loading owner profile for:', item.ownerUid);
    setOwnerLoading(true);
    setOwnerName(null);
    setOwnerRating(null);
    
    let alive = true;
    (async () => {
      try {
        console.log('[ItemHeader] Calling getProfile...');
        const profile = await getProfile(item.ownerUid, false);
        console.log('[ItemHeader] getProfile returned:', profile ? 'profile' : 'null');
        
        if (!alive) return;
        
        if (profile) {
          console.log('[ItemHeader] Profile loaded - ALL FIELDS:', profile);
          console.log('[ItemHeader] Profile keys:', Object.keys(profile));
          console.log('[ItemHeader] Profile values:', {
            name: profile.name,
            displayName: (profile as any).displayName,
            userName: (profile as any).userName,
            email: profile.email,
            ratingAvg: profile.ratingAvg,
            ratingCount: profile.ratingCount,
          });
          
          // Try multiple possible field names
          const name = 
            (profile.name && profile.name.trim()) ||
            ((profile as any).displayName && String((profile as any).displayName).trim()) ||
            ((profile as any).userName && String((profile as any).userName).trim()) ||
            (profile.email && profile.email.split('@')[0]) ||
            'Usuário';
          const rating = profile.ratingAvg ?? 0;
          
          console.log('[ItemHeader] Setting owner info:', { name, rating, usedField: profile.name ? 'name' : (profile as any).displayName ? 'displayName' : (profile as any).userName ? 'userName' : 'email' });
          setOwnerName(name);
          setOwnerRating(rating);
          setOwnerLoading(false);
        } else {
          console.warn('[ItemHeader] Profile not found');
          setOwnerName('Usuário');
          setOwnerRating(0);
          setOwnerLoading(false);
        }
      } catch (error) {
        console.error('[ItemHeader] Error loading profile:', error);
        if (alive) {
          setOwnerName('Usuário');
          setOwnerRating(0);
          setOwnerLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [item.ownerUid, getProfile]);

  return (
    <LiquidGlassView 
      intensity="standard" 
      cornerRadius={24} 
      style={styles.container}
    >
      {item.photos?.[0] && (
        <ExpoImage
          source={{ uri: item.photos[0] }}
          style={[styles.image, { height: IMAGE_HEIGHT }]}
          contentFit="contain"
          transition={300}
          cachePolicy="memory-disk"
          recyclingKey={item.photos[0]}
          placeholderContentFit="contain"
        />
      )}
      <View style={styles.content}>
        {/* Title with enhanced typography */}
        <ThemedText 
          type="title-1" 
          style={[styles.title, { color: palette.text }]}
          lightColor={Colors.light.text}
          darkColor={Colors.dark.text}
        >
          {item.title}
        </ThemedText>

        {/* Owner info */}
        {item.ownerUid && (
          <View style={styles.ownerContainer}>
            {ownerLoading ? (
              <ThemedText 
                type="callout" 
                style={styles.ownerName}
                className="text-light-text-tertiary dark:text-dark-text-tertiary"
              >
                Carregando...
              </ThemedText>
            ) : (
              <>
                <ThemedText 
                  type="callout" 
                  style={styles.ownerName}
                  className="text-light-text-secondary dark:text-dark-text-secondary"
                >
                  {ownerName || 'Usuário'}
                </ThemedText>
                <View style={styles.ownerRating}>
                  <ThemedText 
                    type="caption-1" 
                    style={[styles.ownerRatingText, {
                      color: colors.isDark ? colors.brand.primary : colors.brand.dark,
                      fontWeight: '600',
                    }]}
                  >
                    {ownerRating !== null ? ownerRating.toFixed(1) : '0.0'}
                  </ThemedText>
                  <ThemedText
                    style={{
                      fontSize: 14,
                      color: colors.isDark ? colors.brand.primary : colors.brand.dark,
                    }}
                  >
                    ★
                  </ThemedText>
                </View>
              </>
            )}
          </View>
        )}

        {/* Rating section with improved spacing */}
        <View style={styles.ratingContainer}>
          <StarRating value={item.ratingAvg ?? 0} />
          {!!item.ratingCount && (
            <ThemedText 
              type="callout" 
              style={styles.ratingText}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              ({item.ratingCount} {item.ratingCount === 1 ? 'avaliação' : 'avaliações'})
            </ThemedText>
          )}
        </View>

        {/* Category badge with better visual treatment */}
        {!!item.category && (
          <View style={styles.categoryContainer}>
            <ThemedText 
              type="footnote" 
              style={[styles.categoryText, { 
                color: isDark ? palette.tint : Colors.light.tint,
                backgroundColor: isDark 
                  ? `${palette.tint}20` 
                  : `${Colors.light.tint}15`
              }]}
            >
              {item.category}
            </ThemedText>
          </View>
        )}

        {/* Location with improved icon and spacing */}
        {!!item.city && (
          <View style={styles.locationContainer}>
            <ThemedText 
              type="callout" 
              style={styles.locationText}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              📍 {item.city}{item.neighborhood ? ` • ${item.neighborhood}` : ''}
            </ThemedText>
          </View>
        )}

        {/* Description with better line height and spacing */}
        {!!item.description && (
          <ThemedText 
            type="body" 
            style={styles.description}
            className="text-light-text-secondary dark:text-dark-text-secondary"
          >
            {item.description}
          </ThemedText>
        )}
      </View>
    </LiquidGlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginBottom: 24,
  },
  image: {
    width: '100%',
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 24,
    gap: 4,
  },
  title: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.36,
  },
  ownerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
    marginBottom: 8,
  },
  ownerName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  ownerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2xs'],
  },
  ownerRatingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 16,
    lineHeight: 21,
  },
  categoryContainer: {
    marginBottom: Spacing['2xs'],
    marginTop: Spacing['3xs'],
  },
  categoryText: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing['2xs'],
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 16,
    lineHeight: 21,
  },
  description: {
    marginTop: 16,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.41,
  },
});

