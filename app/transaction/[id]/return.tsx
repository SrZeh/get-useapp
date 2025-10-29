// app/transaction/[id]/return.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, storage } from "@/lib/firebase";
import * as FileSystem from "expo-file-system/legacy"; // 👈 API legacy estável
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { confirmReturn } from "@/services/cloudFunctions";
import { useThemeColors } from "@/utils";
import { Spacing } from "@/constants/spacing";

export default function ReturnScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const uid = auth.currentUser?.uid ?? null;
  const colors = useThemeColors();
  const [imgUri, setImgUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Permissão", "Precisamos da câmera para tirar a foto.");
      return;
    }
    const r = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (!r.canceled) setImgUri(r.assets[0].uri);
  }

  async function uploadAndConfirm() {
    try {
      if (!uid || !id) return Alert.alert("Erro", "Sessão inválida.");
      if (!imgUri) return Alert.alert("Foto", "Tire uma foto do item devolvido.");

      setBusy(true);

      // Caminho no Storage
      const path = `returns/${uid}/${id}-${Date.now()}.jpg`;
      const rf = ref(storage, path);

      // Lê a imagem em base64 e monta um Data URL (evita Blob/ArrayBuffer)
      const base64 = await FileSystem.readAsStringAsync(imgUri, { encoding: "base64" });
      const dataUrl = `data:image/jpeg;base64,${base64}`;

      // Envia Data URL
      await uploadString(rf, dataUrl, "data_url");
      const url = await getDownloadURL(rf);

      // Chama a função para marcar devolução e trocar capa
      await confirmReturn(id, url);

      Alert.alert("Devolução confirmada", "A foto virou a nova capa da vitrine 👌");
      router.back();
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Falha", error?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: Spacing.sm }}>
        <ThemedText type="title">Confirmar devolução</ThemedText>
        <ThemedText style={{ marginTop: 6, opacity: 0.8 }}>
          Tire uma foto do item devolvido. Ela será usada como nova capa na vitrine.
        </ThemedText>

        <View style={{ marginTop: 16, alignItems: "center", gap: 16 }}>
          {imgUri ? (
            <Image source={{ uri: imgUri }} style={{ width: "100%", height: 280, borderRadius: 12 }} />
          ) : (
            <View
              style={{
                width: "100%",
                height: 180,
                borderRadius: 12,
                borderWidth: 1,
                borderStyle: "dashed",
                borderColor: colors.border.default,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ThemedText>Tire a foto do item</ThemedText>
            </View>
          )}

          <TouchableOpacity 
            onPress={pick} 
            disabled={busy} 
            style={{ 
              padding: 12, 
              borderWidth: 1, 
              borderRadius: 10,
              borderColor: colors.border.default,
            }}
          >
            {busy ? <ActivityIndicator /> : <ThemedText>Usar Câmera</ThemedText>}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={uploadAndConfirm}
            disabled={busy || !imgUri}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 18,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: colors.border.default,
              opacity: imgUri ? 1 : 0.5,
            }}
          >
            {busy ? <ActivityIndicator /> : <ThemedText type="defaultSemiBold">Confirmar devolução</ThemedText>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
