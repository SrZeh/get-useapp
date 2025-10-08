// app/profile/reviews.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { View } from 'react-native';

function Stars({ value = 0 }: { value?: number }) {
  const filled = Math.round(value);
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1,2,3,4,5].map((i) => (
        <ThemedText key={i} type="defaultSemiBold">{i <= filled ? '★' : '☆'}</ThemedText>
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const uid = auth.currentUser?.uid ?? '';
  const [avg, setAvg] = useState<number | null>(null);
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const u = snap.data() as any;
      setAvg(typeof u?.ratingAvg === 'number' ? u.ratingAvg : null);
      setCount(typeof u?.ratingCount === 'number' ? u.ratingCount : 0);
    });
    return () => unsub();
  }, [uid]);

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 12 }}>
      <ThemedText type="title">Minha reputação</ThemedText>

      {avg == null || count === 0 ? (
        <ThemedText style={{ marginTop: 8 }}>Você ainda não recebeu avaliações.</ThemedText>
      ) : (
        <View style={{ gap: 6 }}>
          <Stars value={avg} />
          <ThemedText>{avg} ({count} {count === 1 ? 'avaliação' : 'avaliações'})</ThemedText>
        </View>
      )}

      <ThemedText style={{ marginTop: 24, opacity: 0.7, fontSize: 12 }}>
        As mensagens dos avaliadores ficam somente nos reviews dos itens.
      </ThemedText>
    </ThemedView>
  );
}
