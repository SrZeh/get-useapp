/**
 * BasicInfoSection - Form section for item basic information
 * 
 * Handles:
 * - Title input
 * - Description input
 * - Category picker
 * - Condition input
 */

import { Input } from '@/components/Input';
import { LiquidGlassView } from '@/components/liquid-glass';
import { ThemedText } from '@/components/themed-text';
import { ITEM_CATEGORIES } from '@/constants/categories';
import { BorderRadius, Spacing } from '@/constants/spacing';
import { itemDescriptionSchema, itemTitleSchema } from '@/utils';
import type { ThemeColors } from '@/utils/theme';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { z } from 'zod';

const conditionStringSchema = z
  .string()
  .min(1, 'Condição é obrigatória')
  .max(100, 'Condição muito longa');

type BasicInfoSectionProps = {
  title: string;
  description: string;
  category: string;
  condition: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onConditionChange: (value: string) => void;
  errors: {
    title?: string;
    description?: string;
    category?: string;
  };
  colors: ThemeColors;
};

export function BasicInfoSection({
  title,
  description,
  category,
  condition,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onConditionChange,
  errors,
  colors,
}: BasicInfoSectionProps) {
  return (
    <LiquidGlassView
      intensity="subtle"
      cornerRadius={BorderRadius.xl}
      style={styles.sectionGlass}
    >
      <View style={styles.section}>
        <ThemedText type="subhead" style={styles.sectionTitle}>
          Informações Básicas
        </ThemedText>

        <Input
          label="Título do item *"
          placeholder="Ex: Furadeira Bosch GSR 180-LI"
          value={title}
          onChangeText={onTitleChange}
          autoCapitalize="sentences"
          error={errors.title}
          helperText={!errors.title ? "Nome curto e descritivo do item" : undefined}
          zodSchema={itemTitleSchema}
          validateOnBlur={true}
          leftElement={<Ionicons name="pricetag" size={20} color={colors.icon.default} />}
        />

        <Input
          label="Descrição *"
          placeholder="Descreva o item, condições de uso, etc."
          value={description}
          onChangeText={onDescriptionChange}
          multiline
          error={errors.description}
          helperText={!errors.description ? "Seja claro sobre o estado e uso do item" : undefined}
          style={{ minHeight: 100 }}
          inputStyle={{ textAlignVertical: "top" }}
          zodSchema={itemDescriptionSchema}
          validateOnBlur={true}
          leftElement={<Ionicons name="document-text" size={20} color={colors.icon.default} />}
        />

        {/* Category Dropdown */}
        <View>
          <ThemedText type="caption-1" style={styles.label}>
            Categoria *
          </ThemedText>
          <View
            style={[
              styles.pickerContainer,
              {
                borderColor: !category ? colors.semantic.error : colors.border.default,
                backgroundColor: colors.input.bg,
              },
            ]}
          >
            <Picker
              selectedValue={category}
              onValueChange={onCategoryChange}
              dropdownIconColor={colors.text.primary}
              style={[
                styles.picker,
                { color: colors.text.primary },
              ]}
            >
              <Picker.Item
                label="Selecione uma categoria…"
                value=""
                color={colors.input.placeholder}
              />
              {ITEM_CATEGORIES.map((c) => (
                <Picker.Item key={c} label={c} value={c} />
              ))}
            </Picker>
          </View>
          {!category && (errors.category ? (
            <ThemedText type="caption-2" style={[styles.errorText, { color: colors.semantic.error }]}>
              {errors.category}
            </ThemedText>
          ) : (
            <ThemedText type="caption-2" style={[styles.errorText, { color: colors.semantic.error }]}>
              Selecione uma categoria
            </ThemedText>
          ))}
        </View>

        <Input
          label="Condição"
          placeholder="Ex: Novo, Usado, Com marcas de uso..."
          value={condition}
          onChangeText={onConditionChange}
          autoCapitalize="sentences"
          helperText="Estado atual do item"
          leftElement={<Ionicons name="information-circle" size={20} color={colors.icon.default} />}
          zodSchema={conditionStringSchema}
          validateOnBlur={true}
        />
      </View>
    </LiquidGlassView>
  );
}

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
  label: {
    marginBottom: Spacing['2xs'],
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing['2xs'],
  },
});

