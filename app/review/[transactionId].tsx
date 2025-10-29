// app/review/[transactionId].tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
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

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!transactionId) return;
      const snap = await getDoc(doc(db, 'reservations', String(transactionId)));
      if (!alive) return;
      if (!snap.exists()) {
        Alert.alert('Avaliação', 'Reserva não encontrada.');
        router.back();
        return;
      }
      const data = snap.data() as Partial<Reservation>;
      const r: Reservation = {
        id: snap.id,
        ...data,
      } as Reservation;
      setRes(r);
    })();
    return () => { alive = false; };
  }, [transactionId]);

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
      router.replace('/(tabs)/transactions');
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
    borderRadius: 16,
    padding: 16,
    fontSize: 17,
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
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <ThemedText type="large-title" style={{ marginBottom: 32 }}>
            {title}
          </ThemedText>

          {!res ? (
            <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ padding: 24, alignItems: 'center' }}>
              <ThemedText type="callout">Carregando…</ThemedText>
            </LiquidGlassView>
          ) : !canReview ? (
            <LiquidGlassView intensity="standard" cornerRadius={16} style={{ padding: 24 }}>
              <ThemedText type="body" style={{ color: palette.error, textAlign: 'center' }}>
                Você só pode avaliar reservas devolvidas em que você é o locatário.
              </ThemedText>
            </LiquidGlassView>
          ) : (
            <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24 }}>
              <View style={{ gap: 20 }}>
                <View>
                  <ThemedText type="title-3" style={{ marginBottom: 12, fontWeight: '600' }}>
                    Nota (1–5)
                  </ThemedText>
                  <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <TouchableOpacity
                        key={n}
                        onPress={() => {
                          HapticFeedback.selection();
                          setStars(n);
                        }}
                        style={{
                          padding: 12,
                          borderRadius: 16,
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
