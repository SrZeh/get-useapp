// app/item/new.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { useImagePicker } from "@/hooks/useImagePicker";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { LiquidGlassView } from "@/components/liquid-glass";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useThemeColors, itemTitleSchema, itemDescriptionSchema } from "@/utils";
import { Image as ExpoImage } from "expo-image";
import { ITEM_CATEGORIES } from "@/constants/categories";
import { useItemService, useNavigationService } from "@/providers/ServicesProvider";
import { uploadUserImageFromUri } from "@/services/images";
import { Ionicons } from "@expo/vector-icons";
import { useItemForm } from "@/hooks/useItemForm";

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

  const handleSubmit = async (data: {
    title: string;
    description: string;
    category: string;
    condition: string;
    minRentalDays: number;
    dailyRate: number;
    isFree: boolean;
    city?: string;
    neighborhood?: string;
    photos?: string[];
    published?: boolean;
  }) => {
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
      ...data,
      photos: photoUrl ? [photoUrl] : [],
    });

    Alert.alert("Sucesso", `Item cadastrado! (id: ${result.data.id})`);
    navigation.navigateToHome();
  };

  const { submit, loading: saving, errors } = useItemForm(handleSubmit);

  const handleSave = async () => {
    await submit({
      title,
      description,
      category,
      condition,
      minRentalDays,
      dailyRate,
      isFree,
      city,
      neighborhood,
      photos: [],
    });
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

          <View style={{ marginTop: 16, gap: 16 }}>
            <Input
              label="Título do item"
              placeholder="Ex: Furadeira Bosch GSR 180-LI"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
              error={errors.title}
              helperText={!errors.title ? "Nome curto e descritivo do item" : undefined}
              zodSchema={itemTitleSchema}
              validateOnBlur={true}
              leftElement={<Ionicons name="pricetag" size={20} color={colors.icon.default} />}
            />

            <Input
              label="Descrição"
              placeholder="Descreva o item, condições de uso, etc."
              value={description}
              onChangeText={setDescription}
              multiline
              error={errors.description}
              helperText={!errors.description ? "Seja claro sobre o estado e uso do item" : undefined}
              style={{ minHeight: 100 }}
              inputStyle={{ textAlignVertical: "top" }}
              zodSchema={itemDescriptionSchema}
              validateOnBlur={true}
              leftElement={<Ionicons name="document-text" size={20} color={colors.icon.default} />}
            />

            {/* Dropdown de categoria */}
            <View>
              <ThemedText type="caption-1" style={{ marginBottom: 8, fontWeight: '600' }}>
                Categoria *
              </ThemedText>
              <View
                style={{
                  borderWidth: 1,
                  borderRadius: 16,
                  overflow: "hidden",
                  borderColor: !category ? colors.semantic.error : colors.border.default,
                  backgroundColor: colors.input.bg,
                }}
              >
                <Picker
                  selectedValue={category}
                  onValueChange={(v) => setCategory(v)}
                  dropdownIconColor={isDark ? colors.text.primary : colors.text.primary}
                  style={{
                    color: colors.text.primary,
                    backgroundColor: "transparent",
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                  }}
                >
                  <Picker.Item
                    label="Selecione uma categoria…"
                    value=""
                    color={colors.input.placeholder}
                  />
                  {ITEM_CATEGORIES.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
              {!category && errors.category && (
                <ThemedText type="caption-2" style={{ color: colors.semantic.error, marginTop: 8 }}>
                  {errors.category}
                </ThemedText>
              )}
              {!category && !errors.category && (
                <ThemedText type="caption-2" style={{ color: colors.semantic.error, marginTop: 8 }}>
                  Selecione uma categoria
                </ThemedText>
              )}
            </View>

            <Input
              label="Condição"
              placeholder="Ex: Novo, Usado, Com marcas de uso..."
              value={condition}
              onChangeText={setCondition}
              autoCapitalize="sentences"
              helperText="Estado atual do item"
              leftElement={<Ionicons name="information-circle" size={20} color={colors.icon.default} />}
            />

            <Input
              label="Dias mínimos para aluguel"
              placeholder="Ex: 1, 3, 7..."
              value={minRentalDays}
              onChangeText={setMinRentalDays}
              keyboardType="number-pad"
              helperText="Número mínimo de dias que o item pode ser alugado"
              leftElement={<Ionicons name="calendar" size={20} color={colors.icon.default} />}
            />

            {/* Diária do item */}
            {!isFree && (
              <Input
                label="Valor da diária"
                placeholder="Ex: 25,00 ou 30.50"
                value={dailyRate}
                onChangeText={setDailyRate}
                keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                helperText="Valor em reais (R$) por dia de aluguel"
                leftElement={<Ionicons name="cash" size={20} color={colors.icon.default} />}
              />
            )}

            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Switch value={isFree} onValueChange={setIsFree} />
              <ThemedText>Emprestar de graça</ThemedText>
            </View>

            {/* Cidade / Bairro */}
            <Input
              label="Cidade"
              placeholder="Ex: São Paulo, Rio de Janeiro..."
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              helperText="Opcional - ajuda outros usuários a encontrarem seu item"
              leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
            />
            <Input
              label="Bairro"
              placeholder="Ex: Centro, Vila Madalena..."
              value={neighborhood}
              onChangeText={setNeighborhood}
              autoCapitalize="words"
              helperText="Opcional - localização mais específica"
              leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
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
              backgroundColor: colors.brand.dark,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText type="defaultSemiBold" style={{ color: colors.isDark ? colors.text.primary : '#ffffff' }}>
              {saving ? "Salvando..." : "Salvar Item"}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
