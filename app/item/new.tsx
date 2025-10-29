// app/item/new.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { Picker } from "@react-native-picker/picker";
import React, { useMemo, useState } from "react";
import { useImagePicker } from "@/hooks/useImagePicker";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Button } from "@/components/Button";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useThemeColors, HapticFeedback, logger, validateItemInput, parseDailyRate, parseMinRentalDays } from "@/utils";
import { Image as ExpoImage } from "expo-image";
import { ITEM_CATEGORIES } from "@/constants/categories";
import { useItemService, useNavigationService } from "@/providers/ServicesProvider";
import { uploadUserImageFromUri } from "@/services/images";

export default function NewItemScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = Colors[colorScheme];
  const colors = useThemeColors();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("Usado");
  const [minRentalDays, setMinRentalDays] = useState("1");
  const [dailyRate, setDailyRate] = useState("");
  const [isFree, setIsFree] = useState(false);

  // novos
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");

  const { imageUri, pickFromGallery, pickFromCamera } = useImagePicker();
  const itemService = useItemService();
  const navigation = useNavigationService();
  const [saving, setSaving] = useState(false);

  const textInputBase = useMemo(
    () => ({
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      fontSize: 17,
      color: colors.text.primary,
      borderColor: colors.border.default,
      backgroundColor: colors.input.bg,
    }),
    [colors]
  );
  const placeholderColor = colors.input.placeholder;

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Sessão expirada", "Faça login novamente para cadastrar itens.");
      return;
    }

    // Validate input using validation utilities
    const itemValidation = validateItemInput({
      title,
      description,
      category,
      minRentalDays,
      dailyRate,
      isFree,
    });

    if (!itemValidation.valid) {
      Alert.alert("Campos inválidos", itemValidation.error ?? "Verifique os campos preenchidos.");
      return;
    }

    // Parse numeric values
    let days: number;
    let rate = 0;

    try {
      days = parseMinRentalDays(minRentalDays);
    } catch (error) {
      Alert.alert("Valor inválido", error instanceof Error ? error.message : "Dias mínimos inválido.");
      return;
    }

    if (!isFree) {
      try {
        rate = parseDailyRate(dailyRate);
      } catch (error) {
        Alert.alert("Valor inválido", error instanceof Error ? error.message : "Diária inválida.");
        return;
      }
    }

    setSaving(true);
    try {
      // 1) Upload da imagem (opcional) usando ImageUploadService
      let photoUrl: string | null = null;
      if (imageUri) {
        const uploadResult = await uploadUserImageFromUri(imageUri, {
          forceFormat: 'jpeg',
          maxBytes: 2 * 1024 * 1024, // 2MB max
        });
        photoUrl = uploadResult.url;
      }

      // 2) Criar item usando service interface
      const result = await itemService.createItem({
        title,
        description,
        category,
        condition,
        minRentalDays: days,
        dailyRate: isFree ? 0 : rate,
        isFree,
        photos: photoUrl ? [photoUrl] : [],
        city,
        neighborhood,
        published: true,
      });

      Alert.alert("Sucesso", `Item cadastrado! (id: ${result.data.id})`);
      navigation.navigateToHome();
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      logger.error("Error creating new item", e, { code: error?.code, message: error?.message });
      Alert.alert("Erro ao salvar", `${error?.code ?? ""} ${error?.message ?? ""}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title">Novo Item</ThemedText>

          <View style={{ marginTop: 16, gap: 12 }}>
            <TextInput
              placeholder="Título"
              placeholderTextColor={placeholderColor}
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
              style={textInputBase}
            />

            <TextInput
              placeholder="Descrição"
              placeholderTextColor={placeholderColor}
              value={description}
              onChangeText={setDescription}
              multiline
              style={[textInputBase, { minHeight: 100, textAlignVertical: "top" }]}
            />

            {/* Dropdown de categoria */}
            <View
              style={[
                textInputBase,
                { padding: 0, overflow: "hidden", justifyContent: "center" },
              ]}
            >
              <Picker
                selectedValue={category}
                onValueChange={(v) => setCategory(v)}
                dropdownIconColor={isDark ? "#111827" : "#fff"}
                style={{
                  color: isDark ? "#fff" : "#111827",
                  backgroundColor: "transparent",
                }}
              >
                <Picker.Item
                  label="Selecione uma categoria…"
                  value=""
                  color={placeholderColor}
                />
                {ITEM_CATEGORIES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>

            {/* Condição (livre) */}
            <TextInput
              placeholder="Condição (ex.: Novo, Usado, Com marcas...)"
              placeholderTextColor={placeholderColor}
              value={condition}
              onChangeText={setCondition}
              autoCapitalize="sentences"
              style={textInputBase}
            />

            {/* Mínimo de dias */}
            <ThemedText>Mínimo de dias para aluguel</ThemedText>
            <TextInput
              placeholder="Dias mínimos de aluguel"
              placeholderTextColor={placeholderColor}
              value={minRentalDays}
              onChangeText={setMinRentalDays}
              keyboardType="number-pad"
              style={textInputBase}
            />

            {/* Diária do item */}
            {!isFree && (
              <TextInput
                placeholder="Valor da diária (ex.: 25,00)"
                placeholderTextColor={placeholderColor}
                value={dailyRate}
                onChangeText={setDailyRate}
                keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                style={textInputBase}
              />
            )}

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Switch value={isFree} onValueChange={setIsFree} />
              <ThemedText>Emprestar de graça</ThemedText>
            </View>

            {/* Cidade / Bairro */}
            <TextInput
              placeholder="Cidade"
              placeholderTextColor={placeholderColor}
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              style={textInputBase}
            />
            <TextInput
              placeholder="Bairro"
              placeholderTextColor={placeholderColor}
              value={neighborhood}
              onChangeText={setNeighborhood}
              autoCapitalize="words"
              style={textInputBase}
            />
          </View>

          {/* Imagem: câmera e galeria */}
          <View style={{ marginTop: 16, flexDirection: "row", gap: 16 }}>
            <TouchableOpacity onPress={pickFromCamera} disabled={saving}>
              <ThemedText type="defaultSemiBold">Usar câmera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickFromGallery} disabled={saving}>
              <ThemedText type="defaultSemiBold">
                {imageUri ? "Alterar foto" : "Selecionar foto"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {imageUri && (
            <ExpoImage
              source={{ uri: imageUri }}
              style={{ width: "40%", height: 140, marginTop: 12, borderRadius: 10 }}
              contentFit="cover"
            />
          )}

          {/* Salvar */}
          <TouchableOpacity
            style={{
              marginTop: 24,
              opacity: saving ? 0.6 : 1,
              backgroundColor: isDark ? "#08af0e" : "#08af0e",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
              {saving ? "Salvando..." : "Salvar Item"}
            </ThemedText>
          </TouchableOpacity>

          {saving && (
            <View style={{ marginTop: 12 }}>
              <ActivityIndicator />
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
