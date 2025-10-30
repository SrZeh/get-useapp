// app/review/[transactionId].tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '@/lib/firebase';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useTransactionsStore } from '@/stores/transactionsStore';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useThemeColors, HapticFeedback } from '@/utils';
import type { Reservation } from '@/types';

export default function ReviewScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const uid = auth.currentUser?.uid ?? '';
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [res, setRes] = useState<Reservation | null>(null);
  const [busy, setBusy] = useState(false);
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const colors = useThemeColors();

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

  async function submit() {
    if (!res || !canReview) {
      Alert.alert('Avaliação', 'Você não pode avaliar esta reserva.');
      return;
    }
    const rating = Math.max(1, Math.min(5, Number(stars) || 1));
    const text = (comment || '').trim().slice(0, 800);

    try {
      setBusy(true);
      HapticFeedback.medium();
      // 1 review por reserva: docId = reservationId
      const revRef = doc(db, `items/${res.itemId}/reviews/${res.id}`);
      await setDoc(
        revRef,
        {
          renterUid: uid,
          rating,
          comment: text,               // comentários ficam no review do ITEM
          reservationId: res.id,
          itemOwnerUid: res.itemOwnerUid,
          itemTitle: res.itemTitle || null,
          createdAt: serverTimestamp(),
        },
        { merge: false }
      );

      // Agregações do item e do dono são feitas pela trigger onItemReviewCreated
      HapticFeedback.success();
      Alert.alert('Obrigado!', 'Sua avaliação foi enviada.');
      router.replace('/transactions');
    } catch (e: unknown) {
      HapticFeedback.error();
      const error = e as { code?: string; message?: string };
      const msg = error?.code ? `${error.code}: ${error.message}` : (error?.message ?? String(e));
      if ((msg || '').toLowerCase().includes('permission')) {
        Alert.alert('Avaliação', 'Você já avaliou esta reserva.');
      } else {
        Alert.alert('Avaliação', 'Não foi possível enviar. Tente novamente.');
      }
    } finally {
      setBusy(false);
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
            <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md }}>
              <View style={{ gap: 20 }}>
                <View>
                  <ThemedText type="title-3" style={{ marginBottom: Spacing.xs, fontWeight: '600' }}>
                    Nota (1–5)
                  </ThemedText>
                  <View style={{ flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.sm }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <TouchableOpacity
                        key={n}
                        onPress={() => {
                          HapticFeedback.selection();
                          setStars(n);
                        }}
                        style={{
                          padding: Spacing.xs,
                          borderRadius: BorderRadius.md,
                          backgroundColor: stars >= n ? colors.brand.primary : colors.card.bg,
                          borderWidth: 1,
                          borderColor: stars >= n ? colors.brand.primary : colors.border.default,
                        }}
                      >
                        <ThemedText 
                          type="title-2" 
                          style={{ 
                            color: stars >= n ? colors.brand.primary : colors.text.primary,
                            fontWeight: '700',
                          }}
                        >
                          {n}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
                    Nota selecionada: {stars}
                  </ThemedText>
                </View>

                <View>
                  <ThemedText type="title-3" style={{ marginBottom: 12, fontWeight: '600' }}>
                    Comentário (opcional)
                  </ThemedText>
                  <LiquidGlassView intensity="subtle" cornerRadius={16}>
                    <TextInput
                      value={comment}
                      onChangeText={setComment}
                      placeholder="Conte como foi a experiência com o item…"
                      placeholderTextColor={placeholderColor}
                      multiline
                      style={[inputStyle, { backgroundColor: 'transparent', minHeight: 120, textAlignVertical: 'top' }]}
                    />
                  </LiquidGlassView>
                </View>

                <Button
                  variant="primary"
                  onPress={submit}
                  disabled={busy}
                  loading={busy}
                  fullWidth
                  style={{ marginTop: 8 }}
                >
                  Enviar avaliação
                </Button>
              </View>
            </LiquidGlassView>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
