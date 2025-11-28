import React, { useMemo } from 'react';
import { View, Alert } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useThemeColors, HapticFeedback, todayLocalISO, enumerateInclusive, calculateReservationSummary } from '@/utils';
import type { Item } from '@/types';
import { Spacing, BorderRadius } from '@/constants/spacing';

type CalendarSectionProps = {
  item: Item;
  booked: Set<string>;
  startISO: string | null;
  endISOInc: string | null;
  onDateRangeChange: (start: string | null, end: string | null) => void;
  onRequestReservation: () => void;
  disabled?: boolean;
  submitting?: boolean;
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
  submitting = false,
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
    const brandBg = isDark ? '#96ff9a' : '#08af0e';
    const brandText = '#ffffff';
    
    const md: Record<
      string,
      {
        disabled?: boolean;
        disableTouchEvent?: boolean;
        selected?: boolean;
        startingDay?: boolean;
        endingDay?: boolean;
        color?: string;
        textColor?: string;
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
        const isStart = idx === 0;
        const isEnd = idx === days.length - 1;
        const isMiddle = !isStart && !isEnd;
        
        md[d] = {
          ...(md[d] || {}),
          selected: true,
          startingDay: isStart,
          endingDay: isEnd,
          // All days in range get background color
          color: isStart || isEnd ? brandBg : (isDark ? '#96ff9a30' : '#08af0e25'),
          textColor: isStart || isEnd ? brandText : (isDark ? '#f9fafb' : '#0a0a0a'),
        };
      });
    } else if (startISO) {
      md[startISO] = {
        ...(md[startISO] || {}),
        selected: true,
        startingDay: true,
        endingDay: true,
        // Explicit colors for single selected day
        color: brandBg,
        textColor: brandText,
      };
    }

    return md;
  }, [booked, startISO, endISOInc, isDark]);

  const handleRequestPress = () => {
    HapticFeedback.medium();
    onRequestReservation();
  };

  const isRequestDisabled =
    disabled ||
    submitting ||
    !startISO ||
    !summary.endExclusive ||
    summary.daysCount < summary.minDays;

  return (
    <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24, marginBottom: 24 }}>
      <ThemedText 
        type="title-2" 
        style={{ marginBottom: 6, fontWeight: '700', fontSize: 22, lineHeight: 28 }}
        lightColor={Colors.light.text}
        darkColor={Colors.dark.text}
      >
        Escolha as datas
      </ThemedText>
      <ThemedText 
        type="callout" 
        style={{ marginBottom: 20, lineHeight: 21 }} 
        className="text-light-text-tertiary dark:text-dark-text-tertiary"
      >
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
        firstDay={1}
        monthFormat="MMMM yyyy"
        dayNames={['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']}
        monthNames={[
          'Janeiro',
          'Fevereiro',
          'Março',
          'Abril',
          'Maio',
          'Junho',
          'Julho',
          'Agosto',
          'Setembro',
          'Outubro',
          'Novembro',
          'Dezembro',
        ]}
        theme={{
          calendarBackground: palette.background,
          textSectionTitleColor: isDark ? '#94a3b8' : '#6b7280',
          dayTextColor: palette.text,
          monthTextColor: palette.text,
          todayTextColor: isDark ? '#96ff9a' : '#08af0e',
          todayBackgroundColor: isDark ? '#96ff9a20' : '#08af0e15',
          selectedDayTextColor: '#ffffff',
          selectedDayBackgroundColor: isDark ? '#96ff9a' : '#08af0e',
          selectedDayBorderColor: isDark ? '#80e685' : '#06a00a',
          selectedDayBorderRadius: 12,
          arrowColor: isDark ? '#96ff9a' : '#08af0e',
          disabledDayTextColor: isDark ? '#475569' : '#9ca3af',
          textDisabledColor: isDark ? '#475569' : '#9ca3af',
          dotColor: isDark ? '#96ff9a' : '#08af0e',
          markedDayBackgroundColor: isDark ? '#96ff9a20' : '#08af0e15',
          'stylesheet.calendar.header': {
            week: {
              marginTop: 8,
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 8,
            },
          },
        }}
        markingStyle={{
          backgroundColor: isDark ? '#96ff9a30' : '#08af0e25',
          borderRadius: BorderRadius['2xs'],
          textColor: isDark ? '#f9fafb' : '#0a0a0a',
        }}
        style={{ 
          marginTop: Spacing.xs, 
          borderRadius: BorderRadius.lg,
          padding: Spacing['2xs'],
        }}
      />

      {/* Reservation Summary */}
      <View
        style={{
          marginTop: 20,
          gap: 12,
          paddingTop: 20,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#334155' : '#e5e7eb',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <ThemedText 
              type="caption-1" 
              style={{ marginBottom: 4 }}
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              Check-in
            </ThemedText>
            <ThemedText 
              type="callout" 
              style={{ fontWeight: '600' }}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              {startISO ? new Date(startISO).toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: 'short',
                timeZone: 'UTC'
              }) : '—'}
            </ThemedText>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <ThemedText 
              type="caption-1" 
              style={{ marginBottom: 4 }}
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              Check-out
            </ThemedText>
            <ThemedText 
              type="callout" 
              style={{ fontWeight: '600' }}
              className="text-light-text-secondary dark:text-dark-text-secondary"
            >
              {summary.endExclusive 
                ? new Date(summary.endExclusive).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short',
                    timeZone: 'UTC'
                  })
                : '—'}
            </ThemedText>
          </View>
        </View>
        
        <ThemedText 
          type="body" 
          style={{ fontSize: 15, lineHeight: 20 }}
          className="text-light-text-secondary dark:text-dark-text-secondary"
        >
          ⏱️ {summary.daysCount} {summary.daysCount === 1 ? 'dia' : 'dias'}{' '}
          {item.minRentalDays ? `(mín: ${summary.minDays} ${summary.minDays === 1 ? 'dia' : 'dias'})` : ''}
        </ThemedText>
        
        <View style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'baseline', 
          marginTop: 4,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: isDark ? '#334155' : '#e5e7eb',
        }}>
          <View>
            <ThemedText 
              type="caption-1" 
              style={{ marginBottom: 6 }}
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              Diária
            </ThemedText>
            <ThemedText 
              type="title-3" 
              style={{ 
                fontWeight: '700',
                fontSize: 20,
                lineHeight: 25
              }}
              lightColor={Colors.light.tint}
              darkColor={Colors.dark.tint}
            >
              {item.isFree
                ? 'Grátis'
                : `${item.dailyRate != null ? `R$ ${item.dailyRate.toFixed(2)}` : '—'}`}
            </ThemedText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <ThemedText 
              type="caption-1" 
              style={{ marginBottom: 6 }}
              className="text-light-text-tertiary dark:text-dark-text-tertiary"
            >
              Total
            </ThemedText>
            <ThemedText 
              type="title-2" 
              style={{ 
                fontWeight: '700',
                fontSize: 22,
                lineHeight: 28
              }}
              lightColor={Colors.light.tint}
              darkColor={Colors.dark.tint}
            >
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
        loading={submitting}
        fullWidth
        style={{ marginTop: 16 }}
      >
        {submitting ? 'Enviando...' : 'Solicitar reserva'}
      </Button>
    </LiquidGlassView>
  );
}

