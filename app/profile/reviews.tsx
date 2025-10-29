// app/profile/reviews.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { View, ScrollView } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useThemeColors } from '@/utils';
import type { UserProfile } from '@/types';

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
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const colors = useThemeColors();

  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'users', uid), (snap) => {
      const u = snap.data() as Partial<UserProfile> | undefined;
      setAvg(typeof u?.ratingAvg === 'number' ? u.ratingAvg : null);
      setCount(typeof u?.ratingCount === 'number' ? u.ratingCount : 0);
    });
    return () => unsub();
  }, [uid]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <ThemedText type="large-title" style={{ marginBottom: 32 }}>Minha reputação</ThemedText>

        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24, marginBottom: 24 }}>
          {avg == null || count === 0 ? (
            <View style={{ alignItems: 'center' }}>
              <ThemedText type="title-2" style={{ marginBottom: 8, textAlign: 'center' }}>
                Você ainda não recebeu avaliações.
              </ThemedText>
              <ThemedText type="callout" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center', marginTop: 8 }}>
                Continue usando o app para receber avaliações!
              </ThemedText>
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <View style={{ alignItems: 'center', marginBottom: 16 }}>
                <Stars value={avg} />
              </View>
              <ThemedText type="title-1" style={{ fontWeight: '700', color: colors.isDark ? colors.brand.primary : colors.brand.dark, marginBottom: 8 }}>
                {avg.toFixed(1)}
              </ThemedText>
              <ThemedText type="body" className="text-light-text-secondary dark:text-dark-text-secondary">
                {count} {count === 1 ? 'avaliação' : 'avaliações'}
              </ThemedText>
            </View>
          )}
        </LiquidGlassView>

        <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ padding: 16 }}>
          <ThemedText type="footnote" className="text-light-text-tertiary dark:text-dark-text-tertiary" style={{ textAlign: 'center' }}>
            As mensagens dos avaliadores ficam somente nos reviews dos itens.
          </ThemedText>
        </LiquidGlassView>
      </ScrollView>
    </ThemedView>
  );
}
