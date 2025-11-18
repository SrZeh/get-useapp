/**
 * ItemManagementCard component
 * 
 * Displays an item card with management actions (edit, toggle availability, delete).
 * Follows Single Responsibility Principle by focusing solely on item display and actions.
 * 
 * Features:
 * - Item image and details display
 * - Rating information (product and owner)
 * - Edit, toggle availability, and delete actions
 * - Loading states for operations
 */

import React from 'react';
import { View, TouchableOpacity, Alert, Platform, Share } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { AnimatedCard } from '@/components/AnimatedCard';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Button } from '@/components/Button';
import { GradientTypes, HapticFeedback, useThemeColors, calcAvg, renderStars, formatBRL, logger } from '@/utils';
import type { Item } from '@/types';

const SHARE_BASE_URL = (() => {
  const envUrl =
    (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_SITE_URL) || 'https://geteuse.com.br';
  return envUrl.replace(/\/$/, '');
})();

type ItemManagementCardProps = {
  /**
   * Item data to display
   */
  item: Item;

  /**
   * Whether this item is currently being updated
   */
  isUpdating: boolean;

  /**
   * Callback when edit button is pressed
   */
  onEdit: (itemId: string) => void;

  /**
   * Callback when toggle availability is pressed
   */
  onToggleAvailability: (item: Item) => void;

  /**
   * Callback when delete is pressed
   */
  onDelete: (item: Item) => void;
};

/**
 * ItemManagementCard - displays item with management actions
 */
export function ItemManagementCard({
  item,
  isUpdating,
  onEdit,
  onToggleAvailability,
  onDelete,
}: ItemManagementCardProps) {
  const colors = useThemeColors();

  const handleEdit = () => {
    HapticFeedback.light();
    onEdit(item.id);
  };

  const handleToggle = () => {
    HapticFeedback.medium();
    onToggleAvailability(item);
  };

  const handleDelete = () => {
    HapticFeedback.medium();
    onDelete(item);
  };

  const handleShare = async () => {
    const sharePath = `/item/${item.id}`;
    const shareUrl = `${SHARE_BASE_URL}${sharePath}`;
    const priceText = typeof item.dailyRate === 'number' ? formatBRL(item.dailyRate) : '';
    const baseMessage = priceText
      ? `Alugo "${item.title}" por ${priceText} no Get & Use! Clique e reserve!`
      : `Alugo "${item.title}" no Get & Use! Clique e reserve!`;
    const sharePayload = `${baseMessage} ${shareUrl}`.trim();

    try {
      HapticFeedback.light();
      if (Platform.OS === 'web') {
        const nav = typeof navigator !== 'undefined' ? navigator : undefined;

        if (nav?.share) {
          await nav.share({
            title: item.title,
            text: baseMessage,
            url: shareUrl,
          });
          return;
        }

        if (nav?.clipboard?.writeText) {
          await nav.clipboard.writeText(sharePayload);
          Alert.alert('Link copiado!', 'Cole a mensagem no WhatsApp ou nas suas redes sociais.');
          return;
        }

        Alert.alert('Compartilhar item', sharePayload);
        return;
      }

      await Share.share({
        title: item.title,
        message: sharePayload,
        url: shareUrl,
      });
    } catch (error) {
      logger.error('Erro ao compartilhar item', error, { itemId: item.id });
      Alert.alert('Compartilhar item', 'Não foi possível compartilhar agora. Tente novamente.');
    }
  };

  const productRating = calcAvg(item.ratingSum, item.ratingCount);
  const ownerRating = calcAvg(item.ownerRatingSum, item.ownerRatingCount);

  return (
    <AnimatedCard>
      <LiquidGlassView intensity="standard" cornerRadius={20} style={{ overflow: 'hidden' }}>
        {item.photos?.[0] && (
          <ExpoImage
            source={{ uri: item.photos[0] }}
            style={{ width: '100%', height: 200 }}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
            recyclingKey={item.photos[0]}
          />
        )}

        <View style={{ padding: 16 }}>
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginBottom: 12,
            }}
          >
            <ThemedText type="title-small" style={{ flexShrink: 1, fontWeight: '600' }} numberOfLines={2}>
              {item.title}
            </ThemedText>

            <LinearGradient
              colors={item.available ? GradientTypes.success.colors : [colors.text.quaternary, colors.text.tertiary]}
              style={{
                paddingVertical: Spacing['2xs'],
                paddingHorizontal: Spacing.xs,
                borderRadius: BorderRadius.md,
              }}
            >
              <ThemedText
                type="caption-1"
                style={{
                  color: colors.isDark ? colors.text.primary : '#ffffff',
                  fontWeight: '600',
                }}
              >
                {item.available ? 'Disponível' : 'Alugado'}
              </ThemedText>
            </LinearGradient>
          </View>

          {/* Ratings */}
          <View style={{ marginTop: 8, gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ThemedText type="caption" style={{ fontWeight: '600' }}>
                Produto:
              </ThemedText>
              {productRating ? (
                <ThemedText type="caption">
                  {renderStars(productRating)} {productRating.toFixed(1)} ({item.ratingCount})
                </ThemedText>
              ) : (
                <ThemedText type="caption">—</ThemedText>
              )}
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ThemedText type="caption" style={{ fontWeight: '600' }}>
                Dono:
              </ThemedText>
              {ownerRating ? (
                <ThemedText type="caption">
                  {renderStars(ownerRating)} {ownerRating.toFixed(1)} ({item.ownerRatingCount})
                </ThemedText>
              ) : (
                <ThemedText type="caption">—</ThemedText>
              )}
            </View>
          </View>

          {/* Description */}
          {!!item.description && (
            <ThemedText
              style={{ marginTop: 12 }}
              numberOfLines={2}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              {item.description}
            </ThemedText>
          )}

          {/* Actions */}
          <View style={{ gap: 12, marginTop: 16 }}>
            <Button
              variant="primary"
              onPress={handleShare}
              textStyle={{ fontSize: 14 }}
              accessibilityLabel="Compartilhar item"
              accessibilityHint="Abre opções para compartilhar o link do item"
              fullWidth
            >
              Compartilhar
            </Button>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Button
                variant="secondary"
                onPress={handleEdit}
                style={{ flex: 1 }}
                textStyle={{ fontSize: 14 }}
              >
                Editar
              </Button>

              <Button
                variant={item.available ? 'primary' : 'premium'}
                onPress={handleToggle}
                disabled={isUpdating}
                loading={isUpdating}
                style={{ flex: 1 }}
                textStyle={{ fontSize: 14 }}
              >
                {item.available ? 'Marcar Alugado' : 'Marcar Disponível'}
              </Button>

              <TouchableOpacity
                onPress={handleDelete}
                disabled={isUpdating}
                style={{
                  width: 48,
                  minHeight: 48,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: BorderRadius.sm,
                  backgroundColor: colors.semantic.error,
                  opacity: isUpdating ? 0.6 : 1,
                }}
                accessibilityLabel="Excluir item"
                accessibilityHint="Exclui permanentemente este item"
                accessibilityRole="button"
                accessibilityState={{ disabled: isUpdating }}
              >
                <ThemedText
                  style={{
                    color: colors.isDark ? colors.text.primary : '#ffffff',
                    fontSize: 18,
                    fontWeight: '700',
                  }}
                >
                  ×
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LiquidGlassView>
    </AnimatedCard>
  );
}

