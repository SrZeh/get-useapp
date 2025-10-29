import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { useImagePicker } from "@/hooks/useImagePicker";
import React, { useEffect, useMemo, useState } from "react";
import type { Item } from "@/types";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useThemeColors, validateItemInput, parseDailyRate, parseMinRentalDays } from "@/utils";
import { ITEM_CATEGORIES } from "@/constants/categories";
import { useItemService, useNavigationService } from "@/providers/ServicesProvider";
import { uploadUserImageFromUri } from "@/services/images";

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = Colors[colorScheme];
  const colors = useThemeColors();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("Usado");
  const [minRentalDays, setMinRentalDays] = useState("1");
  const [dailyRate, setDailyRate] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null); // já salva

  // novos
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [published, setPublished] = useState<boolean>(true);

  // nova imagem local (para trocar)
  const { imageUri, pickFromGallery, pickFromCamera } = useImagePicker();
  const itemService = useItemService();
  const navigation = useNavigationService();

  const textInputBase = useMemo(
    () => ({
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: colors.text.primary,
      borderColor: colors.border.default,
      backgroundColor: colors.input.bg,
    }),
    [colors]
  );
  const placeholderColor = colors.input.placeholder;

  useEffect(() => {
    (async () => {
      try {
        const item = await itemService.getItem(id);
        if (!item) {
          Alert.alert("Ops", "Item não encontrado.");
          navigation.goBack();
          return;
        }

        setTitle(item.title ?? "");
        setDescription(item.description ?? "");
        setCategory(item.category ?? "");
        setCondition(item.condition ?? "Usado");
        setMinRentalDays(String(item.minRentalDays ?? 1));
        setDailyRate(
          item.dailyRate != null && isFinite(item.dailyRate) ? String(item.dailyRate) : ""
        );
        setPhotoUrl(item.photos?.[0] ?? null);

        setCity(item.city ?? "");
        setNeighborhood(item.neighborhood ?? "");
        setPublished(item.published !== false); // default true
      } catch (e: unknown) {
        const error = e as { message?: string };
        Alert.alert("Erro ao carregar", error?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation, itemService]);


  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Sessão expirada", "Faça login novamente.");
      return;
    }

    // Validate input using validation utilities
    const itemValidation = validateItemInput({
      title,
      description,
      category,
      minRentalDays,
      dailyRate,
      isFree: false, // Edit screen doesn't have isFree toggle
    });

    if (!itemValidation.valid || !category) {
      Alert.alert("Campos inválidos", itemValidation.error ?? "Preencha título, descrição e categoria.");
      return;
    }

    // Parse numeric values
    let days: number;
    let rate: number;

    try {
      days = parseMinRentalDays(minRentalDays);
    } catch (error) {
      Alert.alert("Valor inválido", error instanceof Error ? error.message : "Dias mínimos inválido.");
      return;
    }

    try {
      rate = parseDailyRate(dailyRate);
    } catch (error) {
      Alert.alert("Valor inválido", error instanceof Error ? error.message : "Diária inválida.");
      return;
    }

    setSaving(true);
    try {
      let newPhotoUrl = photoUrl;

      // Upload nova imagem se houver, usando ImageUploadService
      if (imageUri) {
        const uploadResult = await uploadUserImageFromUri(imageUri, {
          forceFormat: 'jpeg',
          maxBytes: 2 * 1024 * 1024, // 2MB max
        });
        newPhotoUrl = uploadResult.url;
      }

      // Atualizar item usando service interface
      await itemService.updateItem(id, {
        title,
        description,
        category,
        condition,
        minRentalDays: days,
        dailyRate: rate,
        photos: newPhotoUrl ? [newPhotoUrl] : [],
        published,
        city,
        neighborhood,
      });

      Alert.alert("Sucesso", "Item atualizado.");
      navigation.goBack();
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Erro ao salvar", error?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <ThemedText type="title">Editar Item</ThemedText>

          <View style={{ marginTop: 16, gap: 12 }}>
            <TextInput
              placeholder="Título"
              placeholderTextColor={placeholderColor}
              value={title}
              onChangeText={setTitle}
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

            {/* Categoria */}
            <View style={[textInputBase, { padding: 0, overflow: "hidden" }]}>
              <Picker
                selectedValue={category}
                onValueChange={setCategory}
                dropdownIconColor={isDark ? "#fff" : "#111827"}
                style={{ color: isDark ? "#fff" : "#111827", backgroundColor: "transparent" }}
              >
                <Picker.Item label="Selecione uma categoria…" value="" color={placeholderColor} />
                {ITEM_CATEGORIES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </View>

            <TextInput
              placeholder="Condição (ex.: Novo, Usado, Com marcas...)"
              placeholderTextColor={placeholderColor}
              value={condition}
              onChangeText={setCondition}
              style={textInputBase}
            />

            <TextInput
              placeholder="Dias mínimos de aluguel"
              placeholderTextColor={placeholderColor}
              value={minRentalDays}
              onChangeText={setMinRentalDays}
              keyboardType="number-pad"
              style={textInputBase}
            />

            <TextInput
              placeholder="Valor da diária (ex.: 25,00)"
              placeholderTextColor={placeholderColor}
              value={dailyRate}
              onChangeText={setDailyRate}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              style={textInputBase}
            />

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

            {/* Publicar item */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
              <Switch value={published} onValueChange={setPublished} />
              <ThemedText>Publicar item</ThemedText>
            </View>
          </View>

          {/* Imagem: câmera e galeria */}
          <View style={{ marginTop: 16, flexDirection: "row", gap: 16 }}>
            <TouchableOpacity onPress={() => pickFromCamera()} disabled={saving}>
              <ThemedText type="defaultSemiBold">Usar câmera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => pickFromGallery()} disabled={saving}>
              <ThemedText type="defaultSemiBold">
                {imageUri ? "Alterar foto (nova)" : "Alterar foto"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {(imageUri || photoUrl) && (
            <Image
              source={{ uri: imageUri ?? photoUrl ?? undefined }}
              style={{ width: "40%", height: 140, marginTop: 12, borderRadius: 10 }}
            />
          )}

          <TouchableOpacity
            style={{
              marginTop: 24,
              opacity: saving ? 0.6 : 1,
              backgroundColor: isDark ? "#2563eb" : "#1d4ed8",
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
