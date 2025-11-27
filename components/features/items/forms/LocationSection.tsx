/**
 * LocationSection - Form section for item location
 * 
 * Handles:
 * - CEP input with ViaCEP integration
 * - City (auto-filled from CEP)
 * - Neighborhood (auto-filled from CEP)
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Input } from '@/components/Input';
import { Ionicons } from '@expo/vector-icons';
import { cepSchema } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import type { UseThemeColorsReturn } from '@/utils/theme';

type LocationSectionProps = {
  cep: string;
  city: string;
  neighborhood: string;
  onCepChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  cepLoading: boolean;
  cepError: string | null;
  cepFetched: boolean;
  saving: boolean;
  colors: UseThemeColorsReturn;
  cityError?: string;
  neighborhoodError?: string;
};

export const LocationSection = React.memo(function LocationSection({
  cep,
  city,
  neighborhood,
  onCepChange,
  onCityChange,
  onNeighborhoodChange,
  cepLoading,
  cepError,
  cepFetched,
  saving,
  colors,
  cityError,
  neighborhoodError,
}: LocationSectionProps) {
  return (
    <LiquidGlassView
      intensity="subtle"
      cornerRadius={BorderRadius.xl}
      style={styles.sectionGlass}
    >
      <View style={styles.section}>
        <ThemedText type="subhead" style={styles.sectionTitle}>
          Localização do item
        </ThemedText>

        {/* CEP Input with ViaCEP */}
        <Input
          label="CEP (opcional)"
          placeholder="00000-000"
          value={cep}
          onChangeText={onCepChange}
          keyboardType="number-pad"
          maxLength={9}
          error={cepError || undefined}
          helperText={
            cepLoading
              ? "Buscando endereço..."
              : cepFetched
                ? "Endereço preenchido automaticamente"
                : !cepError
                  ? "Digite o CEP para preencher automaticamente"
                  : undefined
          }
          editable={!cepFetched && !saving}
          rightElement={
            cepLoading ? (
              <ActivityIndicator size="small" color={colors.brand.primary} />
            ) : cepFetched ? (
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={colors.semantic.success || colors.brand.primary}
              />
            ) : (
              <Ionicons 
                name="search" 
                size={20} 
                color={cep.length === 9 ? colors.brand.primary : colors.text.tertiary}
              />
            )
          }
          zodSchema={cepSchema}
          validateOnBlur={true}
          leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
        />

        <Input
          label="Cidade *"
          placeholder="Ex: São Paulo, Rio de Janeiro..."
          value={city}
          onChangeText={onCityChange}
          autoCapitalize="words"
          error={cityError}
          helperText={cityError ? undefined : (cepFetched ? "Preenchido automaticamente via CEP" : "Campo obrigatório - digite a cidade ou preencha o CEP acima")}
          leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
          editable={!saving}
        />

        <Input
          label="Bairro *"
          placeholder="Ex: Centro, Vila Madalena..."
          value={neighborhood}
          onChangeText={onNeighborhoodChange}
          autoCapitalize="words"
          error={neighborhoodError}
          helperText={neighborhoodError ? undefined : (cepFetched ? "Preenchido automaticamente via CEP" : "Campo obrigatório - digite o bairro ou preencha o CEP acima")}
          leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
          editable={!saving}
        />
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
});

