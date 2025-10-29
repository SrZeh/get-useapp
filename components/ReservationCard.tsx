/**
 * ReservationCard - Displays a reservation with status, dates, and actions
 */

import React from "react";
import { ThemedText } from "@/components/themed-text";
import { AnimatedCard } from "@/components/AnimatedCard";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Button } from "@/components/Button";
import { LinearGradient } from "expo-linear-gradient";
import { HapticFeedback, useThemeColors } from "@/utils";
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

const STATUS_COLORS: Record<string, [string, string]> = {
  requested: ['#f59e0b', '#d97706'],
  accepted: ['#10b981', '#059669'],
  rejected: ['#ef4444', '#dc2626'],
  paid: ['#2563eb', '#1d4ed8'],
  picked_up: ['#0891b2', '#0e7490'],
  paid_out: ['#7c3aed', '#6d28d9'],
  returned: ['#16a34a', '#15803d'],
  canceled: ['#6b7280', '#4b5563'],
};

export const ReservationCard = React.memo(function ReservationCard({ reservation: r, actions }: ReservationCardProps) {
  const colors = useThemeColors();
  const isDark = colors.isDark;
  const navigation = useNavigationService();
  
  const daysLabel = r.days 
    ? `${r.days} ${r.days === 1 ? 'dia' : 'dias'}`
    : "Duração não informada";

  const statusColors = STATUS_COLORS[r.status] || ['#6b7280', '#4b5563'];

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
              <ThemedText style={{ color: "#fff", fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
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
            <ThemedText type="body" style={{ fontWeight: '600', color: '#96ff9a', marginTop: 4 }}>
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

