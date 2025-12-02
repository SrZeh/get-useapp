/**
 * Offer Help Screen
 * 
 * Screen to select an item to offer help to a request
 */

import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/Button';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useThemeColors, formatBRL, HapticFeedback } from '@/utils';
import { useUserItems } from '@/hooks/features/items';
import { offerItemToRequest } from '@/services/items/offerItemToRequest';
import { useItemsStore } from '@/stores/itemsStore';
import { Ionicons } from '@expo/vector-icons';
import { LoadingState } from '@/components/states';
import { Image } from 'expo-image';

export default function OfferHelpScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { id: requestItemId } = useLocalSearchParams<{ id: string }>();
  const { items, loading: itemsLoading } = useUserItems();
  const invalidateItem = useItemsStore((state) => state.invalidateItem);
  
  const [offeringItemId, setOfferingItemId] = useState<string | null>(null);

  // Filter only published and available items
  const availableItems = items.filter(
    (item) => item.published === true && item.available !== false && item.itemType !== 'request'
  );

  const handleOffer = async (itemId: string) => {
    if (!requestItemId) {
      Alert.alert('Erro', 'ID do pedido não encontrado.');
      return;
    }

    try {
      setOfferingItemId(itemId);
      HapticFeedback.medium();
      
      console.log('[OfferHelpScreen] Iniciando oferta de item:', {
        requestItemId,
        itemId,
      });
      
      await offerItemToRequest(requestItemId, itemId);
      
      console.log('[OfferHelpScreen] ✅ Item oferecido com sucesso!');
      
      // Invalidate cache to refresh the request item with new offered items
      invalidateItem(requestItemId);
      
      // Also refresh user items to update the help screen
      // Wait a bit for Firestore to propagate the update
      setTimeout(() => {
        invalidateItem(requestItemId);
        console.log('[OfferHelpScreen] Cache invalidado após 500ms');
      }, 500);
      
      HapticFeedback.success();
      Alert.alert(
        'Item oferecido!',
        'Seu item foi adicionado ao pedido de ajuda. O solicitante poderá ver e reservar seu item.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('[OfferHelpScreen] ❌ Erro ao oferecer item:', error);
      HapticFeedback.error();
      Alert.alert('Erro', error?.message || 'Não foi possível oferecer o item. Tente novamente.');
    } finally {
      setOfferingItemId(null);
    }
  };

  const handleNewItem = () => {
    router.push({
      pathname: '/item/new',
      params: { helpRequestId: requestItemId },
    });
  };

  if (itemsLoading) {
    return <LoadingState message="Carregando seus itens..." />;
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: Spacing.md + insets.top + 90 } // Account for header height (approx 90px) + safe area
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <ThemedText type="large-title" style={styles.title}>
            Oferecer Ajuda
          </ThemedText>
          <View style={{ width: 40 }} />
        </View>
        <ThemedText
          type="body"
          style={[styles.description, { color: colors.text.secondary }]}
        >
          Selecione um dos seus itens para oferecer ajuda a este pedido. O solicitante poderá ver e reservar seu item.
        </ThemedText>

        {/* New Item Button */}
        <Button
          variant="secondary"
          onPress={handleNewItem}
          style={styles.newItemButton}
        >
          <Ionicons name="add-circle-outline" size={20} color={colors.brand.primary} style={{ marginRight: 8 }} />
          Cadastrar Novo Item
        </Button>

        {/* Items List */}
        {availableItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color={colors.text.tertiary} />
            <ThemedText
              type="title-3"
              style={[styles.emptyTitle, { color: colors.text.secondary }]}
            >
              Nenhum item disponível
            </ThemedText>
            <ThemedText
              type="body"
              style={[styles.emptyDescription, { color: colors.text.tertiary }]}
            >
              Cadastre um item para poder oferecer ajuda
            </ThemedText>
          </View>
        ) : (
          <View style={styles.itemsContainer}>
            <ThemedText
              type="title-3"
              style={[styles.sectionTitle, { color: colors.text.primary }]}
            >
              Seus Itens
            </ThemedText>
            
            {availableItems.map((item) => {
              const isOffering = offeringItemId === item.id;
              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: colors.card.bg,
                      borderColor: colors.border.default,
                    },
                  ]}
                >
                  {/* Item Image */}
                  {item.photos?.[0] ? (
                    <Image
                      source={{ uri: item.photos[0] }}
                      style={[
                        styles.itemImage,
                        { backgroundColor: colors.bg.tertiary },
                      ]}
                      contentFit="cover"
                      transition={200}
                    />
                  ) : (
                    <View
                      style={[
                        styles.itemImage,
                        styles.placeholderImage,
                        { backgroundColor: colors.bg.tertiary },
                      ]}
                    >
                      <Ionicons name="cube-outline" size={32} color={colors.text.tertiary} />
                    </View>
                  )}

                  {/* Item Info */}
                  <View style={styles.itemInfo}>
                    <ThemedText
                      type="title-3"
                      numberOfLines={2}
                      style={[styles.itemTitle, { color: colors.text.primary }]}
                    >
                      {item.title}
                    </ThemedText>
                    
                    {item.description && (
                      <ThemedText
                        type="footnote"
                        numberOfLines={2}
                        style={[styles.itemDescription, { color: colors.text.secondary }]}
                      >
                        {item.description}
                      </ThemedText>
                    )}

                    <View style={styles.itemFooter}>
                      <ThemedText
                        type="title-2"
                        style={[styles.itemPrice, { color: colors.brand.primary }]}
                      >
                        {formatBRL(item.dailyRate)}
                      </ThemedText>
                      <ThemedText
                        type="footnote"
                        style={[styles.itemPriceLabel, { color: colors.text.tertiary }]}
                      >
                        / dia
                      </ThemedText>
                    </View>

                    <Button
                      variant="primary"
                      onPress={() => handleOffer(item.id)}
                      disabled={isOffering || offeringItemId !== null}
                      style={styles.itemOfferButton}
                    >
                      {isOffering ? 'Oferecendo...' : 'Oferecer este item'}
                    </Button>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  description: {
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  newItemButton: {
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemsContainer: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  itemCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  itemImage: {
    width: '100%',
    height: 200,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    padding: Spacing.md,
  },
  itemTitle: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  itemDescription: {
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing['2xs'],
    marginBottom: Spacing.md,
  },
  itemPrice: {
    fontWeight: '700',
  },
  itemPriceLabel: {
    fontSize: 12,
  },
  itemOfferButton: {
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    gap: Spacing.md,
  },
  emptyTitle: {
    fontWeight: '600',
  },
  emptyDescription: {
    textAlign: 'center',
    maxWidth: 300,
  },
});

