import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useThemeColors, HapticFeedback } from '@/utils';
import { auth } from '@/lib/firebase';
import { useTransactionsStore } from '@/stores/transactionsStore';
import type { Reservation } from '@/types';
import { useReviewService } from '@/providers/ServicesProvider';

export default function OwnerReviewScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const uid = auth.currentUser?.uid ?? '';
  const reviewService = useReviewService();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const colors = useThemeColors();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [reviewSent, setReviewSent] = useState(false);

  const getTransaction = useTransactionsStore((state) => state.getTransaction);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!transactionId) return;
      const transaction = await getTransaction(String(transactionId), false);
      if (!alive) return;

      if (!transaction || !('itemId' in transaction)) {
        Alert.alert('Avaliação', 'Reserva não encontrada.');
        router.back();
        return;
      }

      setReservation(transaction as Reservation);
    })();
    return () => {
      alive = false;
    };
  }, [transactionId, getTransaction]);

  const canReview = useMemo(() => {
    if (!uid || !reservation) return false;
    return reservation.itemOwnerUid === uid && reservation.status === 'returned';
  }, [uid, reservation]);

  const reviewsOpen = reservation?.reviewsOpen as { ownerCanReviewRenter?: boolean } | undefined;
  const canReviewRenter = canReview && (reviewsOpen?.ownerCanReviewRenter ?? true) && !reviewSent;

  const inputStyle = useMemo(() => ({
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 17,
    color: colors.text.primary,
    borderColor: colors.border.default,
    backgroundColor: colors.input.bg,
  }), [colors]);
  const placeholderColor = colors.input.placeholder;

  const renderStarRow = (value: number, onSelect: (n: number) => void) => (
    <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm }}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = value >= n;
        return (
          <TouchableOpacity
            key={n}
            onPress={() => {
              HapticFeedback.selection();
              onSelect(n);
            }}
            style={{
              padding: Spacing.xs,
              borderRadius: BorderRadius.md,
              backgroundColor: active ? colors.brand.primary : colors.card.bg,
              borderWidth: 1,
              borderColor: active ? colors.brand.primary : colors.border.default,
            }}
          >
            <ThemedText
              type="title-2"
              style={{
                color: active ? colors.brand.primary : colors.text.primary,
                fontWeight: '700',
              }}
            >
              {n}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  async function submitReview() {
    if (!reservation || !canReviewRenter) {
      Alert.alert('Avaliação', 'Você já avaliou este locatário ou a reserva não permite avaliações.');
      return;
    }
    if (!reservation.renterUid) {
      Alert.alert('Avaliação', 'Não foi possível identificar o locatário.');
      return;
    }

    const rating = Math.max(1, Math.min(5, Number(stars) || 1)) as 1 | 2 | 3 | 4 | 5;
    const text = (comment || '').trim();

    const validation = reviewService.validateUserReviewInput({
      reviewerUid: uid,
      reviewerRole: 'owner',
      reservationId: reservation.id,
      targetUid: reservation.renterUid,
      targetRole: 'renter',
      rating,
      comment: text,
    });

    if (!validation.valid) {
      Alert.alert('Avaliação', validation.error ?? 'Dados inválidos.');
      return;
    }

    try {
      setBusy(true);
      HapticFeedback.medium();
      await reviewService.createUserReview({
        reviewerUid: uid,
        reviewerRole: 'owner',
        reservationId: reservation.id,
        targetUid: reservation.renterUid,
        targetRole: 'renter',
        rating,
        comment: text,
      });
      HapticFeedback.success();
      setReviewSent(true);
      setComment('');
      setStars(5);
      Alert.alert('Obrigado!', 'Avaliação do locatário registrada. 🙌');
    } catch (e: unknown) {
      HapticFeedback.error();
      const error = e as { message?: string };
      const message = error?.message ?? String(e);
      if (message.toLowerCase().includes('já avaliou')) {
        Alert.alert('Avaliação', 'Você já avaliou este locatário para esta reserva.');
        setReviewSent(true);
      } else {
        Alert.alert('Avaliação', 'Não foi possível enviar. Tente novamente.');
      }
    } finally {
      setBusy(false);
    }
  }

  const renterName = (reservation as unknown as { renterName?: string })?.renterName;
  const title = renterName ? `Avaliar ${renterName}` : 'Avaliar locatário';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: Spacing.sm, paddingBottom: Spacing.lg }}>
          <ThemedText type="large-title" style={{ marginBottom: Spacing.lg }}>
            {title}
          </ThemedText>

          {!reservation ? (
            <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md, alignItems: 'center' }}>
              <ThemedText type="callout">Carregando…</ThemedText>
            </LiquidGlassView>
          ) : !canReview ? (
            <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md }}>
              <ThemedText type="body" style={{ color: palette.error, textAlign: 'center' }}>
                Apenas o dono do item pode avaliar o locatário após a devolução.
              </ThemedText>
            </LiquidGlassView>
          ) : (
            <View style={{ gap: Spacing.md }}>
              <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md, gap: Spacing.sm }}>
                <ThemedText type="title-3" style={{ fontWeight: '700' }}>
                  Avaliar o locatário
                </ThemedText>
                <ThemedText type="footnote" className="text-light-text-tertiary dark:text-dark-text-tertiary">
                  Avaliação opcional, mas notas 1 ou 2 exigem comentário.
                </ThemedText>
                {canReviewRenter ? (
                  <>
                    {renderStarRow(stars, setStars)}
                    <ThemedText type="footnote" className="text-light-text-secondary dark:text-dark-text-secondary">
                      Nota selecionada: {stars}
                    </ThemedText>
                    <LiquidGlassView intensity="subtle" cornerRadius={16}>
                      <TextInput
                        value={comment}
                        onChangeText={setComment}
                        placeholder="Como foi a experiência com o locatário?"
                        placeholderTextColor={placeholderColor}
                        multiline
                        editable={!busy}
                        style={[inputStyle, { backgroundColor: 'transparent', minHeight: 120, textAlignVertical: 'top' }]}
                      />
                    </LiquidGlassView>
                    <Button
                      variant="primary"
                      onPress={submitReview}
                      disabled={busy}
                      loading={busy}
                      fullWidth
                    >
                      Enviar avaliação do locatário
                    </Button>
                  </>
                ) : (
                  <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
                    ✅ Avaliação do locatário registrada. Obrigado!
                  </ThemedText>
                )}
              </LiquidGlassView>

              <Button
                variant="secondary"
                onPress={() => router.replace('/transactions')}
                fullWidth
              >
                Voltar para minhas reservas
              </Button>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

