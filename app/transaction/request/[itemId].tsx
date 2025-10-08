import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { router, useLocalSearchParams } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';

export default function RequestTransaction() {
  const { itemId } = useLocalSearchParams<{ itemId: string }>();

  return (
    <ThemedView style={{ flex: 1, padding: 16 }}>
      <ThemedText type="title">Solicitar Item</ThemedText>
      <ThemedText>Item: {itemId}</ThemedText>

      <View className="mt-4">
        <ThemedText>Data de retirada: —</ThemedText>
        <ThemedText>Data de devolução: —</ThemedText>
      </View>

      <TouchableOpacity className="mt-6" onPress={() => router.replace('/(tabs)/transactions')}>
        <ThemedText type="defaultSemiBold">Enviar solicitação</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
