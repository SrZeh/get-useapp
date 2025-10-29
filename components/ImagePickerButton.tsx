// components/ImagePickerButton.tsx
import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed-text";
import * as ImagePicker from "expo-image-picker";

type Props = {
  onPick: (uri: string, mimeType?: string) => void;
};

export default function ImagePickerButton({ onPick }: Props) {
  async function pickFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
    });
    if (!res.canceled && res.assets?.[0]?.uri) onPick(res.assets[0].uri, res.assets[0].mimeType);
  }

  async function pickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return;
    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.85,
      allowsEditing: true,
    });
    if (!res.canceled && res.assets?.[0]?.uri) onPick(res.assets[0].uri, res.assets[0].mimeType);
  }

  return (
    <View style={{ flexDirection: "row", gap: 16, marginTop: 8 }}>
      <TouchableOpacity
        onPress={pickFromCamera}
        accessibilityRole="button"
        accessibilityLabel="Usar câmera"
        accessibilityHint="Toque para tirar uma foto com a câmera"
      >
        <ThemedText type="defaultSemiBold">Usar câmera</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={pickFromLibrary}
        accessibilityRole="button"
        accessibilityLabel="Escolher da galeria"
        accessibilityHint="Toque para escolher uma imagem da galeria"
      >
        <ThemedText>Escolher da galeria</ThemedText>
      </TouchableOpacity>
    </View>
  );
}
