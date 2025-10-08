// app/profile/reviews.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ReviewsScreen() {
  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Minhas avaliações</ThemedText>
      <ThemedText style={{ marginTop: 8 }}>Em breve…</ThemedText>
    </ThemedView>
  );
}
