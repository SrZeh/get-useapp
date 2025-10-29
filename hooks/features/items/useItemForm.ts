/**
 * Custom hook for item form operations
 * Separates business logic from UI components
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { auth } from '@/lib/firebase';
import { HapticFeedback, logger } from '@/utils';
import { 
  itemTitleSchema, 
  itemDescriptionSchema,
  validateItemInput,
  parseDailyRate,
  parseMinRentalDays,
  safeValidate,
} from '@/utils/validation';
import type { Item } from '@/types';

/**
 * Item form input type
 */
export interface ItemFormInput {
  title: string;
  description: string;
  category: string;
  condition: string;
  minRentalDays: string;
  dailyRate: string;
  isFree: boolean;
  city?: string;
  neighborhood?: string;
  photos?: string[];
}

/**
 * Hook for item form validation and submission
 */
export function useItemForm(
  onSubmit: (data: {
    title: string;
    description: string;
    category: string;
    condition: string;
    minRentalDays: number;
    dailyRate: number;
    isFree: boolean;
    city?: string;
    neighborhood?: string;
    photos?: string[];
    published?: boolean;
  }) => Promise<void>
) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = useCallback((input: ItemFormInput): { valid: boolean; data?: any; error?: string } => {
    setErrors({});

    // Validate title
    const titleResult = safeValidate(itemTitleSchema, input.title);
    if (!titleResult.success) {
      const error = titleResult.errors.errors[0]?.message ?? 'Título inválido';
      setErrors({ title: error });
      return { valid: false, error };
    }

    // Validate description (optional but if provided must be valid)
    if (input.description.trim()) {
      const descResult = safeValidate(itemDescriptionSchema, input.description);
      if (!descResult.success) {
        const error = descResult.errors.errors[0]?.message ?? 'Descrição inválida';
        setErrors({ description: error });
        return { valid: false, error };
      }
    }

    // Validate category
    if (!input.category.trim()) {
      setErrors({ category: 'Categoria é obrigatória' });
      return { valid: false, error: 'Selecione uma categoria para o item.' };
    }

    // Validate using utility
    const itemValidation = validateItemInput({
      title: input.title,
      description: input.description,
      category: input.category,
      minRentalDays: input.minRentalDays,
      dailyRate: input.dailyRate,
      isFree: input.isFree,
    });

    if (!itemValidation.valid) {
      return { valid: false, error: itemValidation.error };
    }

    // Parse numeric values
    let days: number;
    let rate = 0;

    try {
      days = parseMinRentalDays(input.minRentalDays);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Dias mínimos inválido.';
      setErrors({ minRentalDays: errorMsg });
      return { valid: false, error: errorMsg };
    }

    if (!input.isFree) {
      try {
        rate = parseDailyRate(input.dailyRate);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Diária inválida.';
        setErrors({ dailyRate: errorMsg });
        return { valid: false, error: errorMsg };
      }
    }

    return {
      valid: true,
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        category: input.category,
        condition: input.condition,
        minRentalDays: days,
        dailyRate: rate,
        isFree: input.isFree,
        city: input.city?.trim(),
        neighborhood: input.neighborhood?.trim(),
        photos: input.photos || [],
      },
    };
  }, []);

  const submit = useCallback(async (input: ItemFormInput, options?: { published?: boolean }) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Sessão expirada', 'Faça login novamente para cadastrar itens.');
      return { success: false, error: 'Usuário não autenticado' } as const;
    }

    const validation = validate(input);
    if (!validation.valid || !validation.data) {
      Alert.alert('Campos inválidos', validation.error ?? 'Verifique os campos preenchidos.');
      return { success: false, error: validation.error } as const;
    }

    setLoading(true);
    HapticFeedback.medium();

    try {
      await onSubmit({
        ...validation.data,
        published: options?.published ?? true,
      });
      return { success: true } as const;
    } catch (error: unknown) {
      HapticFeedback.error();
      const err = error as { code?: string; message?: string };
      logger.error('Error submitting item form', error, { code: err?.code, message: err?.message });
      const errorMsg = err?.message ?? 'Não foi possível salvar o item. Tente novamente.';
      Alert.alert('Erro ao salvar', errorMsg);
      return { success: false, error: errorMsg } as const;
    } finally {
      setLoading(false);
    }
  }, [validate, onSubmit]);

  return {
    submit,
    validate,
    loading,
    errors,
    clearErrors: useCallback(() => setErrors({}), []),
  };
}

