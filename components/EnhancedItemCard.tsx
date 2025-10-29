import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LiquidGlassView } from './liquid-glass';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTypes } from '@/utils/gradients';
import { ThemedText } from './themed-text';
import { VerifiedBadge } from './VerifiedBadge';
import { AnimatedCard } from './AnimatedCard';

type Item = {
  id: string;
  title: string;
  dailyRate?: number;
  photos?: string[];
  available?: boolean;
  verified?: boolean;
  city?: string;
  neighborhood?: string;
  ownerUid?: string;
};

type EnhancedItemCardProps = {
  item: Item;
  onPress?: () => void;
  width?: number;
};

function formatBRL(n?: number) {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  try {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(n);
  } catch {
    return `R$ ${n.toFixed(2).replace('.', ',')}`;
  }
}

export function EnhancedItemCard({ item, onPress, width }: EnhancedItemCardProps) {
  const cardWidth = width || 180;
  const imageHeight = cardWidth * 0.75;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/item/${item.id}`);
    }
  };

  return (
    <AnimatedCard onPress={handlePress} style={{ width: cardWidth }}>
      <LiquidGlassView intensity="standard" cornerRadius={20} style={{ overflow: 'hidden' }}>
        {/* Image with Gradient Overlay */}
        <View style={{ position: 'relative' }}>
          {item.photos?.[0] ? (
            <Image
              source={{ uri: item.photos[0] }}
              style={{ width: '100%', height: imageHeight }}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View
              style={{
                width: '100%',
                height: imageHeight,
                backgroundColor: '#f3f4f6',
              }}
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />
          {/* Price Badge */}
          {item.dailyRate && (
            <View style={{ position: 'absolute', bottom: 12, left: 12 }}>
              <LinearGradient
                colors={GradientTypes.brand.colors}
                start={GradientTypes.brand.start}
                end={GradientTypes.brand.end}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                }}
              >
                <ThemedText style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>
                  {formatBRL(item.dailyRate)}/dia
                </ThemedText>
              </LinearGradient>
            </View>
          )}
          {/* Verified Badge */}
          {item.verified && (
            <View style={{ position: 'absolute', top: 12, right: 12 }}>
              <VerifiedBadge size="md" />
            </View>
          )}
        </View>

        {/* Card Content */}
        <View style={{ padding: 12 }}>
          <ThemedText type="title-small" numberOfLines={1} style={{ marginBottom: 4 }}>
            {item.title}
          </ThemedText>
          {/* Location */}
          {(item.city || item.neighborhood) && (
            <ThemedText
              type="caption"
              style={{ opacity: 0.7, marginBottom: 4 }}
              numberOfLines={1}
            >
              {[item.neighborhood, item.city].filter(Boolean).join(', ')}
            </ThemedText>
          )}
          {/* Status with Pulse */}
          {item.available !== false && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: '#08af0e',
                }}
              />
              <ThemedText type="caption" style={{ color: '#08af0e' }}>
                Disponível agora
              </ThemedText>
            </View>
          )}
        </View>
      </LiquidGlassView>
    </AnimatedCard>
  );
}

