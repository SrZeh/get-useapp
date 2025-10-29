/**
 * Custom hook for review operations
 * Separates business logic from UI components
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { HapticFeedback } from '@/utils';
import { 
  reviewRatingSchema, 
  reviewCommentSchema,
  safeValidate,
} from '@/utils/validation';
import { z } from 'zod';

/**
 * Review input schema
 */
const reviewInputSchema = z.object({
  rating: reviewRatingSchema,
  comment: reviewCommentSchema,
});

/**
 * Review form input
 */
export interface ReviewFormInput {
  rating: number;
  comment: string;
}

/**
 * Hook for submitting reviews
 */
export function useSubmitReview(
  onSubmit: (data: {
    rating: number;
    comment: string;
  }) => Promise<void>
) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = useCallback(async (input: ReviewFormInput) => {
    setErrors({});

    // Validate input
    const validation = safeValidate(reviewInputSchema, {
      rating: input.rating,
      comment: input.comment.trim(),
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.errors.forEach((err) => {
        const path = err.path[0]?.toString();
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      setErrors(fieldErrors);
      return { success: false, error: 'Dados inválidos', fieldErrors } as const;
    }

    setLoading(true);
    HapticFeedback.medium();

    try {
      await onSubmit({
        rating: validation.data.rating,
        comment: validation.data.comment || '',
      });
      
      HapticFeedback.success();
      Alert.alert('Obrigado!', 'Sua avaliação foi enviada.');
      router.replace('/(tabs)/transactions');
      return { success: true } as const;
    } catch (error: unknown) {
      HapticFeedback.error();
      const err = error as { code?: string; message?: string };
      const msg = err?.code ? `${err.code}: ${err.message}` : (err?.message ?? String(error));
      
      if ((msg || '').toLowerCase().includes('permission')) {
        Alert.alert('Avaliação', 'Você já avaliou esta reserva.');
      } else {
        Alert.alert('Avaliação', 'Não foi possível enviar. Tente novamente.');
      }
      return { success: false, error: msg } as const;
    } finally {
      setLoading(false);
    }
  }, [onSubmit]);

  return {
    submit,
    loading,
    errors,
    clearErrors: useCallback(() => setErrors({}), []),
  };
}

