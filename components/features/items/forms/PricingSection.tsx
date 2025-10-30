/**
 * PricingSection - Form section for pricing and rental information
 * 
 * Handles:
 * - Minimum rental days
 * - Daily rate (when not free)
 * - Free rental toggle
 */

import React from 'react';
import { View, Switch, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Input } from '@/components/Input';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { z } from 'zod';
import type { UseThemeColorsReturn } from '@/utils/theme';

const minRentalDaysStringSchema = z
  .string()
  .min(1, 'Dias mínimos é obrigatório')
  .regex(/^\d+$/, 'Dias mínimos deve ser um número inteiro')
  .refine((val) => {
    const num = Number(val);
    return num > 0 && num <= 365;
  }, 'Dias mínimos deve ser entre 1 e 365');

const dailyRateStringSchema = z
  .string()
  .min(1, 'Valor da diária é obrigatório')
  .refine((val) => {
    const num = Number(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, 'Valor da diária deve ser um número positivo');

type PricingSectionProps = {
  minRentalDays: string;
  dailyRate: string;
  isFree: boolean;
  onMinRentalDaysChange: (value: string) => void;
  onDailyRateChange: (value: string) => void;
  onIsFreeChange: (value: boolean) => void;
  errors: {
    minRentalDays?: string;
    dailyRate?: string;
  };
  colors: UseThemeColorsReturn;
};

export const PricingSection = React.memo(function PricingSection({
  minRentalDays,
  dailyRate,
  isFree,
  onMinRentalDaysChange,
  onDailyRateChange,
  onIsFreeChange,
  errors,
  colors,
}: PricingSectionProps) {
  return (
    <LiquidGlassView
      intensity="subtle"
      cornerRadius={BorderRadius.xl}
      style={styles.sectionGlass}
    >
      <View style={styles.section}>
        <ThemedText type="subhead" style={styles.sectionTitle}>
          Aluguel e Preço
        </ThemedText>

        <Input
          label="Dias mínimos para aluguel"
          placeholder="Ex: 1, 3, 7..."
          value={minRentalDays}
          onChangeText={onMinRentalDaysChange}
          keyboardType="number-pad"
          helperText="Número mínimo de dias que o item pode ser alugado"
          leftElement={<Ionicons name="calendar" size={20} color={colors.icon.default} />}
          zodSchema={minRentalDaysStringSchema}
          validateOnBlur={true}
          error={errors.minRentalDays}
        />

        {!isFree && (
          <Input
            label="Valor da diária *"
            placeholder="Ex: 25,00 ou 30.50"
            value={dailyRate}
            onChangeText={onDailyRateChange}
            keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
            helperText={!errors.dailyRate ? "Valor em reais (R$) por dia de aluguel" : undefined}
            leftElement={<Ionicons name="cash" size={20} color={colors.icon.default} />}
            zodSchema={dailyRateStringSchema}
            validateOnBlur={true}
            error={errors.dailyRate}
          />
        )}

        <View style={styles.switchContainer}>
          <Switch 
            value={isFree} 
            onValueChange={onIsFreeChange}
            trackColor={{
              false: colors.border.default,
              true: colors.brand.primary,
            }}
            thumbColor={isFree ? colors.bg.primary : colors.text.tertiary}
          />
          <ThemedText style={styles.switchLabel}>Emprestar de graça</ThemedText>
        </View>
      </View>
    </LiquidGlassView>
  );
});

const styles = StyleSheet.create({
  section: {
    gap: Spacing.sm,
    padding: Spacing.md,
    width: '100%',
  },
  sectionGlass: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
    width: '100%',
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing['2xs'],
  },
  switchLabel: {
    flex: 1,
  },
});

