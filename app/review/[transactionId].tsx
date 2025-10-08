// app/review/[transactionId].tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

type Reservation = {
  id: string;
  itemId: string;
  itemTitle?: string;
  renterUid: string;
  itemOwnerUid: string;
  status: 'returned' | string;
};

export default function ReviewScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const uid = auth.currentUser?.uid ?? '';
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [res, setRes] = useState<Reservation | null>(null);
  const [busy, setBusy] = useState(false);

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
      const r = { id: snap.id, ...(snap.data() as any) } as Reservation;
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
      Alert.alert('Obrigado!', 'Sua avaliação foi enviada.');
      router.replace('/(tabs)/transactions');
    } catch (e: any) {
      const msg = e?.code ? `${e.code}: ${e.message}` : (e?.message ?? String(e));
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

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">{title}</ThemedText>

      {!res ? (
        <ThemedText className="mt-4">Carregando…</ThemedText>
      ) : !canReview ? (
        <ThemedText className="mt-4" style={{ color: '#ef4444' }}>
          Você só pode avaliar reservas devolvidas em que você é o locatário.
        </ThemedText>
      ) : (
        <>
          <View style={{ marginTop: 16 }}>
            <ThemedText>Nota (1–5): {stars}</ThemedText>
            <TextInput
              keyboardType="number-pad"
              value={String(stars)}
              onChangeText={(t) => setStars(Math.max(1, Math.min(5, Number(t) || 1)))}
              placeholder="5"
              style={{ padding: 12, borderRadius: 8, borderWidth: 1, opacity: 0.8, marginTop: 8 }}
            />

            <ThemedText style={{ marginTop: 16 }}>Comentário (opcional)</ThemedText>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Conte como foi a experiência com o item…"
              multiline
              style={{ padding: 12, borderRadius: 8, borderWidth: 1, minHeight: 100, marginTop: 8 }}
            />
          </View>

          <TouchableOpacity
            style={{ marginTop: 24, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, opacity: busy ? 0.6 : 1 }}
            disabled={busy}
            onPress={submit}
          >
            <ThemedText type="defaultSemiBold">{busy ? 'Enviando…' : 'Enviar avaliação'}</ThemedText>
          </TouchableOpacity>
        </>
      )}
    </ThemedView>
  );
}
