// app/review/[transactionId].tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { auth } from '@/lib/firebase';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useThemeColors, HapticFeedback } from '@/utils';
import type { Reservation } from '@/types';
import { useReviewService } from '@/providers/ServicesProvider';

export default function ReviewScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const uid = auth.currentUser?.uid ?? '';
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [res, setRes] = useState<Reservation | null>(null);
  const [busy, setBusy] = useState(false);
  const [ownerStars, setOwnerStars] = useState(5);
  const [ownerComment, setOwnerComment] = useState('');
  const [ownerBusy, setOwnerBusy] = useState(false);
  const [itemReviewSent, setItemReviewSent] = useState(false);
  const [ownerReviewSent, setOwnerReviewSent] = useState(false);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const colors = useThemeColors();
  const reviewService = useReviewService();

  // Get reservation from store (cached, no duplicate query!)
  const getTransaction = useTransactionsStore((state) => state.getTransaction);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!transactionId) return;
      
      // Get from cache or fetch if not cached
      const transaction = await getTransaction(String(transactionId), false);
      if (!alive) return;
      
      if (!transaction || !('itemId' in transaction)) {
        Alert.alert('Avaliação', 'Reserva não encontrada.');
        router.back();
        return;
      }
      
      setRes(transaction as Reservation);
    })();
    return () => { alive = false; };
  }, [transactionId, getTransaction]);

  const canReview = useMemo(() => {
    if (!uid || !res) return false;
    return res.renterUid === uid && res.status === 'returned';
  }, [uid, res]);

  const reviewsOpen = res?.reviewsOpen as {
    renterCanReviewItem?: boolean;
    renterCanReviewOwner?: boolean;
  } | undefined;

  const canReviewItem = canReview && (reviewsOpen?.renterCanReviewItem ?? true) && !itemReviewSent;
  const canReviewOwner = canReview && (reviewsOpen?.renterCanReviewOwner ?? true) && !ownerReviewSent;

  async function submitItemReview() {
    if (!res || !canReviewItem) {
      Alert.alert('Avaliação', 'Você já avaliou este item ou a reserva não permite avaliações.');
      return;
    }
    if (!res.itemId || !res.itemOwnerUid) {
      Alert.alert('Avaliação', 'Não foi possível identificar o item ou o dono.');
      return;
    }

    const rating = Math.max(1, Math.min(5, Number(stars) || 1)) as 1 | 2 | 3 | 4 | 5;
    const text = (comment || '').trim();

    const validation = reviewService.validateItemReviewInput({
      renterUid: uid,
      reservationId: res.id,
      rating,
      itemId: res.itemId,
      itemOwnerUid: res.itemOwnerUid,
      comment: text,
    });

    if (!validation.valid) {
      Alert.alert('Avaliação', validation.error ?? 'Dados inválidos.');
      return;
    }

    try {
      setBusy(true);
      HapticFeedback.medium();
      await reviewService.createItemReview(res.itemId, {
        renterUid: uid,
        reservationId: res.id,
        rating,
        itemId: res.itemId,
        itemOwnerUid: res.itemOwnerUid,
        comment: text,
      });
      HapticFeedback.success();
      setItemReviewSent(true);
      setComment('');
      setStars(5);
      Alert.alert('Obrigado!', 'Avaliação do item registrada. 😊');
    } catch (e: unknown) {
      HapticFeedback.error();
      const error = e as { message?: string };
      const message = error?.message ?? String(e);
      if (message.toLowerCase().includes('já avaliou')) {
        Alert.alert('Avaliação', 'Você já avaliou este item para esta reserva.');
        setItemReviewSent(true);
      } else {
        Alert.alert('Avaliação', 'Não foi possível enviar. Tente novamente.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function submitOwnerReview() {
    if (!res || !canReviewOwner) {
      Alert.alert('Avaliação', 'Você já avaliou esta pessoa ou a reserva não permite avaliações.');
      return;
    }
    if (!res.itemOwnerUid) {
      Alert.alert('Avaliação', 'Não foi possível identificar o dono.');
      return;
    }

    const rating = Math.max(1, Math.min(5, Number(ownerStars) || 1)) as 1 | 2 | 3 | 4 | 5;
    const text = (ownerComment || '').trim();

    const validation = reviewService.validateUserReviewInput({
      reviewerUid: uid,
      reviewerRole: 'renter',
      reservationId: res.id,
      targetUid: res.itemOwnerUid,
      targetRole: 'owner',
      rating,
      comment: text,
    });

    if (!validation.valid) {
      Alert.alert('Avaliação', validation.error ?? 'Dados inválidos.');
      return;
    }

    try {
      setOwnerBusy(true);
      HapticFeedback.medium();
      await reviewService.createUserReview({
        reviewerUid: uid,
        reviewerRole: 'renter',
        reservationId: res.id,
        targetUid: res.itemOwnerUid,
        targetRole: 'owner',
        rating,
        comment: text,
      });
      HapticFeedback.success();
      setOwnerReviewSent(true);
      setOwnerComment('');
      setOwnerStars(5);
      Alert.alert('Obrigado!', 'Avaliação do dono registrada. 🙌');
    } catch (e: unknown) {
      HapticFeedback.error();
      const error = e as { message?: string };
      const message = error?.message ?? String(e);
      if (message.toLowerCase().includes('já avaliou')) {
        Alert.alert('Avaliação', 'Você já avaliou esta pessoa para esta reserva.');
        setOwnerReviewSent(true);
      } else {
        Alert.alert('Avaliação', 'Não foi possível enviar. Tente novamente.');
      }
    } finally {
      setOwnerBusy(false);
    }
  }

  const title = res?.itemTitle ? `Avaliar ${res.itemTitle}` : `Avaliar`;

  const inputStyle = useMemo(() => ({
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,  
    fontSize: 17, // Body size - acceptable for TextInput
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

          {!res ? (
            <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md, alignItems: 'center' }}>
              <ThemedText type="callout">Carregando…</ThemedText>
            </LiquidGlassView>
          ) : !canReview ? (
            <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md }}>
              <ThemedText type="body" style={{ color: palette.error, textAlign: 'center' }}>
                Você só pode avaliar reservas devolvidas em que você é o locatário.
              </ThemedText>
            </LiquidGlassView>
          ) : (
            <View style={{ gap: Spacing.md }}>
              <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.sm }}>
                <ThemedText type="footnote" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center' }}>
                  Avaliações são opcionais, mas notas 1 ou 2 exigem comentário para manter a comunidade segura.
                </ThemedText>
              </LiquidGlassView>

              {canReviewItem ? (
                <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md, gap: Spacing.sm }}>
                  <ThemedText type="title-3" style={{ fontWeight: '700' }}>
                    Avaliar o item
                  </ThemedText>
                  {renderStarRow(stars, setStars)}
                  <ThemedText type="footnote" className="text-light-text-secondary dark:text-dark-text-secondary">
                    Nota selecionada: {stars}
                  </ThemedText>
                  <LiquidGlassView intensity="subtle" cornerRadius={16}>
                    <TextInput
                      value={comment}
                      onChangeText={setComment}
                      placeholder="Conte como foi a experiência com o item…"
                      placeholderTextColor={placeholderColor}
                      multiline
                      editable={!busy}
                      style={[inputStyle, { backgroundColor: 'transparent', minHeight: 120, textAlignVertical: 'top' }]}
                    />
                  </LiquidGlassView>
                  <Button
                    variant="primary"
                    onPress={submitItemReview}
                    disabled={busy}
                    loading={busy}
                    fullWidth
                  >
                    Enviar avaliação do item
                  </Button>
                </LiquidGlassView>
              ) : (
                <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md }}>
                  <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary" style={{ textAlign: 'center' }}>
                    ✅ Avaliação do item registrada. Obrigado!
                  </ThemedText>
                </LiquidGlassView>
              )}

              {canReviewOwner ? (
                <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md, gap: Spacing.sm }}>
                  <ThemedText type="title-3" style={{ fontWeight: '700' }}>
                    Avaliar o dono
                  </ThemedText>
                  {renderStarRow(ownerStars, setOwnerStars)}
                  <ThemedText type="footnote" className="text-light-text-secondary dark:text-dark-text-secondary">
                    Nota selecionada: {ownerStars}
                  </ThemedText>
                  <LiquidGlassView intensity="subtle" cornerRadius={16}>
                    <TextInput
                      value={ownerComment}
                      onChangeText={setOwnerComment}
                      placeholder="Compartilhe como foi a experiência com o dono…"
                      placeholderTextColor={placeholderColor}
                      multiline
                      editable={!ownerBusy}
                      style={[inputStyle, { backgroundColor: 'transparent', minHeight: 120, textAlignVertical: 'top' }]}
                    />
                  </LiquidGlassView>
                  <Button
                    variant="primary"
                    onPress={submitOwnerReview}
                    disabled={ownerBusy}
                    loading={ownerBusy}
                    fullWidth
                  >
                    Enviar avaliação do dono
                  </Button>
                </LiquidGlassView>
              ) : (
                <LiquidGlassView intensity="subtle" cornerRadius={BorderRadius.md} style={{ padding: Spacing.md }}>
                  <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary" style={{ textAlign: 'center' }}>
                    ✅ Avaliação do dono registrada. Obrigado!
                  </ThemedText>
                </LiquidGlassView>
              )}

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
