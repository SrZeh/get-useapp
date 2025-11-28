import React from 'react';
import { Alert, View, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { StarInput } from './StarInput';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useThemeColors, HapticFeedback } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import type { EligibleReservation } from '@/types';

type ReviewFormProps = {
  eligibleReservations: EligibleReservation[];
  selectedReservationId: string;
  onReservationSelect: (id: string) => void;
  rating: number;
  onRatingChange: (rating: number) => void;
  comment: string;
  onCommentChange: (comment: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isAlreadyReviewed?: boolean;
};

/**
 * ReviewForm component - form for submitting item reviews
 * 
 * Features:
 * - Reservation selection
 * - Star rating input
 * - Comment text input
 * - Submit button
 */
export function ReviewForm({
  eligibleReservations,
  selectedReservationId,
  onReservationSelect,
  rating,
  onRatingChange,
  comment,
  onCommentChange,
  onSubmit,
  disabled = false,
  isAlreadyReviewed = false,
}: ReviewFormProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = useThemeColors();

  const inputStyle = {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 17, // Body size - acceptable for TextInput
    color: colors.text.primary,
    borderColor: colors.border.default,
    backgroundColor: colors.input.bg,
  };
  const placeholderColor = colors.input.placeholder;

  const handleSubmit = () => {
    if (rating <= 2 && comment.trim().length === 0) {
      Alert.alert('Avaliação', 'Para notas 1 ou 2, explique o motivo no comentário.');
      return;
    }
    HapticFeedback.medium();
    onSubmit();
  };

  if (eligibleReservations.length === 0) {
    return (
      <ThemedText type="callout" style={{ marginTop: 16 }} className="text-light-text-tertiary dark:text-dark-text-tertiary">
        Você poderá avaliar depois de concluir a devolução de uma reserva deste item.
      </ThemedText>
    );
  }

  // Show message if already reviewed
  if (isAlreadyReviewed) {
    return (
      <ThemedText type="callout" style={{ marginTop: 16 }} className="text-light-text-secondary dark:text-dark-text-secondary">
        ✅ Você já avaliou este item para esta reserva.
      </ThemedText>
    );
  }

  const showReservationSelector = eligibleReservations.length > 1;

  return (
    <>
      {showReservationSelector && (
        <>
          <ThemedText style={{ marginTop: 10, opacity: 0.8 }}>
            Selecione a reserva que você utilizou:
          </ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 8 }}
            contentContainerStyle={{ gap: 8 }}
          >
            {eligibleReservations.map((r) => {
              const active = selectedReservationId === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  onPress={() => onReservationSelect(active ? '' : r.id)}
                  style={{
                    paddingVertical: Spacing['2xs'],
                    paddingHorizontal: Spacing.xs,
                    borderRadius: BorderRadius.full,
                    borderWidth: 1,
                    backgroundColor: active ? colors.brand.primary : 'transparent',
                    borderColor: active ? 'transparent' : colors.border.default,
                  }}
                >
                  <ThemedText 
                    style={{ color: active ? (colors.isDark ? colors.text.primary : '#ffffff') : colors.text.primary }}
                  >
                    {r.label}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}

      <ThemedText style={{ marginTop: 14, opacity: 0.8 }}>Sua nota:</ThemedText>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <StarInput key={n} n={n} rating={rating} onPress={onRatingChange} />
        ))}
      </View>
      <ThemedText type="footnote" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ marginTop: Spacing['3xs'] }}>
        Comentário obrigatório para notas 1 ou 2.
      </ThemedText>

      <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ marginTop: 12 }}>
        <TextInput
          placeholder="Escreva um comentário (opcional)"
          placeholderTextColor={placeholderColor}
          value={comment}
          onChangeText={onCommentChange}
          multiline
          style={[inputStyle, { backgroundColor: 'transparent', minHeight: 100, textAlignVertical: 'top' }]}
        />
      </LiquidGlassView>

      <Button variant="primary" onPress={handleSubmit} style={{ marginTop: 16, alignSelf: 'flex-start' }} disabled={disabled}>
        Enviar avaliação
      </Button>
    </>
  );
}

