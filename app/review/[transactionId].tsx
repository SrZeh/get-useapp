import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput, TouchableOpacity, View } from 'react-native';

export default function ReviewScreen() {
  const { transactionId } = useLocalSearchParams<{ transactionId: string }>();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Avaliar transação #{transactionId}</ThemedText>

      <View className="mt-4">
        <ThemedText>Nota (1–5): {stars}</ThemedText>
        <TextInput
          keyboardType="number-pad"
          onChangeText={(t) => setStars(Math.max(1, Math.min(5, Number(t) || 1)))}
          placeholder="5"
          style={{ padding: 12, borderRadius: 8, borderWidth: 1, opacity: 0.6, marginTop: 8 }}
        />

        <ThemedText className="mt-4">Comentário (opcional)</ThemedText>
        <TextInput
          value={comment}
          onChangeText={setComment}
          placeholder="Escreva sua experiência…"
          multiline
          style={{ padding: 12, borderRadius: 8, borderWidth: 1, minHeight: 100, marginTop: 8 }}
        />
      </View>

      <TouchableOpacity className="mt-6" onPress={() => router.replace('/(tabs)/transactions')}>
        <ThemedText type="defaultSemiBold">Enviar avaliação</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
