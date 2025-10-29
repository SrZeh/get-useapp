/**
 * ReservationCard - Displays a reservation with status, dates, and actions
 */

import React from "react";
import { ThemedText } from "@/components/themed-text";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Button } from "@/components/Button";
import { LinearGradient } from "expo-linear-gradient";
import { HapticFeedback, useThemeColors, type ThemeColors } from "@/utils";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { Reservation } from "@/types";
import { View } from "react-native";
import type { BaseCardProps } from "@/components/types";
import { useNavigationService } from "@/providers/ServicesProvider";

type ReservationCardProps = BaseCardProps & {
  /**
   * Reservation data to display
   */
  reservation: Reservation;

  /**
   * Custom actions to render in the card
   */
  actions?: React.ReactNode;
};

// Status color mapping - uses theme colors where applicable
const getStatusColors = (status: string, colors: ThemeColors): [string, string] => {
  switch (status) {
    case 'requested':
      return [colors.semantic.warning, colors.isDark ? '#d97706' : '#f59e0b']; // Use theme warning
    case 'accepted':
      return [colors.semantic.success, colors.brand.dark]; // Use theme success
    case 'rejected':
      return [colors.semantic.error, colors.isDark ? '#dc2626' : '#ef4444']; // Use theme error
    case 'paid':
      return [colors.semantic.info, colors.isDark ? '#3b82f6' : '#2563eb']; // Use theme info
    case 'picked_up':
      return ['#0891b2', '#0e7490']; // Cyan - keep as is (not in theme)
    case 'paid_out':
      return ['#7c3aed', '#6d28d9']; // Purple - keep as is (not in theme)
    case 'returned':
      return [colors.semantic.success, colors.brand.dark]; // Use theme success
    case 'canceled':
      return [colors.text.quaternary, colors.text.tertiary]; // Use theme neutral colors
    default:
      return [colors.text.quaternary, colors.text.tertiary]; // Default to neutral
  }
};

export const ReservationCard = React.memo(function ReservationCard({ reservation: r, actions }: ReservationCardProps) {
  const colors = useThemeColors();
  const isDark = colors.isDark;
  const navigation = useNavigationService();
  
  const daysLabel = r.days 
    ? `${r.days} ${r.days === 1 ? 'dia' : 'dias'}`
    : "Duração não informada";

  const statusColors = getStatusColors(r.status, colors);

  return (
    <AnimatedCard>
      <LiquidGlassView intensity="standard" cornerRadius={20} style={{ overflow: 'hidden' }}>
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <ThemedText type="title-small" style={{ fontWeight: '600', flex: 1 }}>
              {r.itemTitle ?? "Item"}
            </ThemedText>
            <LinearGradient
              colors={statusColors}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 16,
              }}
            >
              <ThemedText style={{ color: colors.isDark ? colors.text.primary : '#ffffff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                {r.status}
              </ThemedText>
            </LinearGradient>
          </View>

          <View style={{ gap: 6, marginBottom: 12 }}>
            <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
              📅 {r.startDate ?? "?"} → {r.endDate ?? "?"}
            </ThemedText>
            <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
              ⏱️ {daysLabel}
            </ThemedText>
            <ThemedText type="body" style={{ fontWeight: '600', color: colors.brand.primary, marginTop: 4 }}>
              💰 Total: R$ {typeof r.total === 'number' ? r.total.toFixed(2) : r.total ?? "-"}
            </ThemedText>
          </View>

          {actions && (
            <View style={{ marginTop: 16, gap: 10, paddingTop: 16, borderTopWidth: 1, borderTopColor: colors.border.default }}>
              {actions}
              <Button
                variant="ghost"
                onPress={() => {
                  HapticFeedback.light();
                  navigation.navigateToTransactionChat(r.id);
                }}
                style={{ alignSelf: 'flex-start' }}
              >
                💬 Mensagens
              </Button>
            </View>
          )}
        </View>
      </LiquidGlassView>
    </AnimatedCard>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.reservation.id === nextProps.reservation.id &&
    prevProps.reservation.status === nextProps.reservation.status &&
    prevProps.reservation.startDate === nextProps.reservation.startDate &&
    prevProps.reservation.endDate === nextProps.reservation.endDate &&
    prevProps.reservation.days === nextProps.reservation.days &&
    prevProps.reservation.total === nextProps.reservation.total &&
    prevProps.reservation.itemTitle === nextProps.reservation.itemTitle &&
    prevProps.actions === nextProps.actions
  );
});

