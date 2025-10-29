import React, { useMemo } from 'react';
import { View, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { HapticFeedback, todayLocalISO, enumerateInclusive, calculateReservationSummary } from '@/utils';
import type { Item } from '@/types';

type CalendarSectionProps = {
  item: Item;
  booked: Set<string>;
  startISO: string | null;
  endISOInc: string | null;
  onDateRangeChange: (start: string | null, end: string | null) => void;
  onRequestReservation: () => void;
  disabled?: boolean;
};

/**
 * CalendarSection component - handles date selection and reservation summary
 * 
 * Features:
 * - Calendar with booked dates marked
 * - Date range selection (check-in/check-out)
 * - Reservation summary calculation
 * - Request reservation button
 */
export function CalendarSection({
  item,
  booked,
  startISO,
  endISOInc,
  onDateRangeChange,
  onRequestReservation,
  disabled = false,
}: CalendarSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[colorScheme ?? 'light'];

  const todayISO = todayLocalISO();

  // Handle calendar day press for date selection
  const handleDayPress = (day: DateData) => {
    const d = day.dateString; // yyyy-mm-dd

    // If no start date selected, or both dates are selected, start fresh
    if (!startISO || (startISO && endISOInc)) {
      if (booked.has(d)) return;
      onDateRangeChange(d, null);
      return;
    }

    // Second date selection - calculate range
    let a = startISO;
    let b = d;
    if (b < a) [a, b] = [b, a];

    // Check if range overlaps with booked dates
    const span = enumerateInclusive(a, b);
    if (span.some((x) => booked.has(x))) {
      Alert.alert('Indisponível', 'O intervalo selecionado inclui dias já ocupados.');
      return;
    }

    onDateRangeChange(a, b);
  };

  // Calculate reservation summary
  const summary = useMemo(
    () => calculateReservationSummary(startISO, endISOInc, item),
    [startISO, endISOInc, item]
  );

  // Build marked dates for calendar
  const markedDates = useMemo(() => {
    const md: Record<
      string,
      {
        disabled?: boolean;
        disableTouchEvent?: boolean;
        selected?: boolean;
        startingDay?: boolean;
        endingDay?: boolean;
      }
    > = {};

    // Mark booked dates as disabled
    booked.forEach((d) => {
      md[d] = { ...(md[d] || {}), disabled: true, disableTouchEvent: true };
    });

    // Mark selected date range
    if (startISO && endISOInc) {
      const days = enumerateInclusive(startISO, endISOInc);
      days.forEach((d, idx) => {
        md[d] = {
          ...(md[d] || {}),
          selected: true,
          startingDay: idx === 0,
          endingDay: idx === days.length - 1,
        };
      });
    } else if (startISO) {
      md[startISO] = {
        ...(md[startISO] || {}),
        selected: true,
        startingDay: true,
        endingDay: true,
      };
    }

    return md;
  }, [booked, startISO, endISOInc]);

  const handleRequestPress = () => {
    HapticFeedback.medium();
    onRequestReservation();
  };

  const isRequestDisabled =
    disabled ||
    !startISO ||
    !summary.endExclusive ||
    summary.daysCount < summary.minDays;

  return (
    <LiquidGlassView intensity="standard" cornerRadius={20} style={{ padding: 20, marginBottom: 24 }}>
      <ThemedText type="title-2" style={{ marginBottom: 8, fontWeight: '600' }}>
        Escolha as datas
      </ThemedText>
      <ThemedText type="callout" style={{ marginBottom: 16 }} className="text-light-text-tertiary dark:text-dark-text-tertiary">
        Check-in (seleção do primeiro dia) e Check-out (dia seguinte ao último pernoite).
      </ThemedText>

      {/* Calendar */}
      <Calendar
        onDayPress={handleDayPress}
        markedDates={markedDates}
        markingType="period"
        current={todayISO}
        minDate={todayISO}
        hideExtraDays
        enableSwipeMonths
        disableArrowLeft
        theme={{
          calendarBackground: palette.background,
          textSectionTitleColor: palette.textTertiary,
          dayTextColor: palette.text,
          monthTextColor: palette.text,
          todayTextColor: palette.tint,
          selectedDayTextColor: '#fff',
          selectedDayBackgroundColor: palette.tint,
          arrowColor: palette.tint,
          disabledDayTextColor: palette.textTertiary,
        }}
        style={{ marginTop: 10, borderRadius: 16 }}
      />

      {/* Reservation Summary */}
      <View
        style={{
          marginTop: 16,
          gap: 8,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: palette.border,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <ThemedText type="callout" className="text-light-text-secondary dark:text-dark-text-secondary">
            Check-in: {startISO ?? '—'}
          </ThemedText>
          <ThemedText type="callout" className="text-light-text-secondary dark:text-dark-text-secondary">
            Check-out: {summary.endExclusive ?? '—'}
          </ThemedText>
        </View>
        <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
          ⏱️ {summary.daysCount} {summary.daysCount === 1 ? 'dia' : 'dias'}{' '}
          {item.minRentalDays ? `(mín: ${summary.minDays})` : ''}
        </ThemedText>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 }}>
          <View>
            <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
              Diária
            </ThemedText>
            <ThemedText type="title-3" style={{ fontWeight: '600', color: palette.tint }}>
              {item.isFree
                ? 'Grátis'
                : `${item.dailyRate != null ? `R$ ${item.dailyRate.toFixed(2)}` : '—'}`}
            </ThemedText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText type="caption-1" className="text-light-text-tertiary dark:text-dark-text-tertiary">
              Total
            </ThemedText>
            <ThemedText type="title-2" style={{ fontWeight: '700', color: '#96ff9a' }}>
              {summary.total ? `R$ ${summary.total.toFixed(2)}` : '—'}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Request Reservation Button */}
      <Button
        variant="primary"
        onPress={handleRequestPress}
        disabled={isRequestDisabled}
        fullWidth
        style={{ marginTop: 16 }}
      >
        Solicitar reserva
      </Button>
    </LiquidGlassView>
  );
}

