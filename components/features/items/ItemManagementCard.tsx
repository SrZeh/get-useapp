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

import { AnimatedCard } from '@/components/AnimatedCard';
import { Button } from '@/components/Button';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ThemedText } from '@/components/themed-text';
import { BorderRadius, Spacing } from '@/constants/spacing';
import type { Item } from '@/types';
import { formatBRL, GradientTypes, HapticFeedback, logger, useThemeColors } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Platform, Share, TouchableOpacity, View } from 'react-native';

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
    const baseMessage = `Alugo "${item.title}" no Get & Use! Clique e reserve!`;
    const sharePayload = `${baseMessage} ${shareUrl}`.trim();
    const itemImage = item.photos?.[0];

    try {
      HapticFeedback.light();
      if (Platform.OS === 'web') {
        const nav = typeof navigator !== 'undefined' ? navigator : undefined;

        if (nav?.share) {
          const shareData: any = {
            title: item.title,
            text: baseMessage,
            url: shareUrl,
          };
          
          // Include image if available (Web Share API supports files)
          if (itemImage) {
            try {
              // Fetch image and convert to File for Web Share API
              const response = await fetch(itemImage);
              const blob = await response.blob();
              const file = new File([blob], 'item-photo.jpg', { type: blob.type });
              shareData.files = [file];
            } catch (imageError) {
              // If image fetch fails, share without image
              logger.warn('Failed to fetch image for share', imageError);
            }
          }
          
          await nav.share(shareData);
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

      // Native platforms (iOS/Android)
      if (itemImage && Platform.OS !== 'web') {
        // For native, Share.share can include url which may show image preview
        await Share.share({
          title: item.title,
          message: sharePayload,
          url: itemImage, // Some platforms use this for image preview
        });
      } else {
        await Share.share({
          title: item.title,
          message: sharePayload,
          url: shareUrl,
        });
      }
    } catch (error) {
      logger.error('Erro ao compartilhar item', error, { itemId: item.id });
      Alert.alert('Compartilhar item', 'Não foi possível compartilhar agora. Tente novamente.');
    }
  };

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
            <ThemedText type="title-2" style={{ flexShrink: 1, fontWeight: '600' }} numberOfLines={2}>
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
              accessibilityLabel="Compartilhar item"
              accessibilityHint="Abre opções para compartilhar o link do item"
              style={{ width: '100%', maxWidth: '100%' }}
            >
              Compartilhar
            </Button>

            <View style={{ flexDirection: 'row', gap: 10, width: '100%', alignItems: 'flex-start' }}>
              <Button
                variant="secondary"
                onPress={handleEdit}
                style={{ flexShrink: 0 }}
              >
                Editar
              </Button>

              <View style={{ flex: 1, minWidth: 0 }}>
                <Button
                  variant="outline"
                  onPress={handleToggle}
                  disabled={isUpdating}
                  loading={isUpdating}
                  style={{ 
                    width: '100%',
                    borderWidth: 2,
                    borderColor: colors.semantic.error,
                  }}
                  textStyle={{ 
                    color: colors.semantic.error,
                  } as any}
                  numberOfLines={1}
                >
                  {item.available ? 'Marcar Alugado' : 'Marcar Disponível'}
                </Button>
              </View>
            </View>

            <View style={{ alignItems: 'center' }}>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isUpdating}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  paddingHorizontal: 12,
                  minHeight: 48,
                  borderRadius: BorderRadius.sm,
                  backgroundColor: colors.semantic.error,
                  opacity: isUpdating ? 0.6 : 1,
                }}
                accessibilityLabel="Excluir item"
                accessibilityHint="Exclui permanentemente este item"
                accessibilityRole="button"
                accessibilityState={{ disabled: isUpdating }}
              >
                <Ionicons
                  name="trash"
                  size={18}
                  color={colors.isDark ? colors.text.primary : '#ffffff'}
                />
                <ThemedText
                  style={{
                    color: colors.isDark ? colors.text.primary : '#ffffff',
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  Excluir
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LiquidGlassView>
    </AnimatedCard>
  );
}

