/**
 * HelpRequestCard - Displays a help request in a card format
 * 
 * Shows help requests in the vitrine with urgency indicator and time remaining
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { MegaphoneIcon } from '@/assets/icons/megaphone-icon';
import { useThemeColors } from '@/utils';
import type { HelpRequest } from '@/types/helpRequest';
import { formatTimeRemaining, getTimeRemaining } from '@/utils/helpRequest';
import { Spacing, BorderRadius } from '@/constants/spacing';

type HelpRequestCardProps = {
  request: HelpRequest;
  onPress?: () => void;
};

export function HelpRequestCard({ request, onPress }: HelpRequestCardProps) {
  const colors = useThemeColors();
  const isUrgent = request.urgencyType === 'immediate';
  
  const timeRemaining = getTimeRemaining(request.expiresAt);
  const timeText = formatTimeRemaining(timeRemaining);
  
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/help/${request.id}`);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <LiquidGlassView
        intensity="standard"
        cornerRadius={BorderRadius.md}
        style={[
          styles.card,
          isUrgent && { borderColor: colors.semantic.warning, borderWidth: 2 },
        ]}
      >
        {/* Header with icon and urgency badge */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <MegaphoneIcon
              width={24}
              height={24}
              color={isUrgent ? colors.semantic.warning : colors.brand.primary}
            />
          </View>
          <View style={styles.headerText}>
            <ThemedText
              type="title-3"
              style={[styles.title, { color: colors.text.primary }]}
            >
              Socorro!
            </ThemedText>
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isUrgent
                      ? `${colors.semantic.warning}20`
                      : `${colors.brand.primary}20`,
                  },
                ]}
              >
                <ThemedText
                  type="caption-1"
                  style={{
                    color: isUrgent
                      ? colors.semantic.warning
                      : colors.brand.primary,
                    fontWeight: '600',
                  }}
                >
                  {isUrgent ? 'Urgente' : 'Planejado'}
                </ThemedText>
              </View>
              <ThemedText
                type="caption-1"
                style={[styles.timeText, { color: colors.text.secondary }]}
              >
                {timeText}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Message */}
        <ThemedText
          type="body"
          style={[styles.message, { color: colors.text.primary }]}
          numberOfLines={3}
        >
          {request.message}
        </ThemedText>

        {/* Location */}
        <View style={styles.locationContainer}>
          <ThemedText
            type="caption-1"
            style={[styles.location, { color: colors.text.tertiary }]}
          >
            📍 {request.neighborhood.join(', ')}
            {request.city ? ` • ${request.city}` : ''}
          </ThemedText>
        </View>

        {/* Footer with items count */}
        {request.offeredItems.length > 0 && (
          <View style={styles.footer}>
            <ThemedText
              type="caption-1"
              style={[styles.itemsCount, { color: colors.brand.primary }]}
            >
              {request.offeredItems.length}{' '}
              {request.offeredItems.length === 1 ? 'item oferecido' : 'itens oferecidos'}
            </ThemedText>
          </View>
        )}
      </LiquidGlassView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  card: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing['2xs'],
  },
  iconContainer: {
    marginTop: 2,
  },
  headerText: {
    flex: 1,
    gap: Spacing['2xs'],
  },
  title: {
    fontWeight: '700',
    fontSize: 18,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing['2xs'],
    borderRadius: BorderRadius.sm,
  },
  timeText: {
    fontSize: 12,
  },
  message: {
    marginTop: Spacing['2xs'],
    lineHeight: 20,
  },
  locationContainer: {
    marginTop: Spacing['2xs'],
  },
  location: {
    fontSize: 12,
  },
  footer: {
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  itemsCount: {
    fontSize: 12,
    fontWeight: '600',
  },
});

