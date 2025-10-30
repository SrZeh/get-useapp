import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Spacing } from '@/constants/spacing';

export default function RequestTransaction() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.sm }}>
      <ThemedText type="title">Solicitar Item</ThemedText>
      <ThemedText>Item: {itemId}</ThemedText>

      <View className="mt-4">
        <ThemedText>Data de retirada: —</ThemedText>
        <ThemedText>Data de devolução: —</ThemedText>
      </View>

      <TouchableOpacity className="mt-6" onPress={() => router.replace('/transactions')}>
        <ThemedText type="defaultSemiBold">Enviar solicitação</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
