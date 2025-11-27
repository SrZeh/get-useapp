import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth } from "@/lib/firebase";
import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useImagePicker } from "@/hooks/useImagePicker";
import React, { useEffect, useState } from "react";
import type { Item } from "@/types";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { Input } from "@/components/Input";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useThemeColors, validateItemInput, parseDailyRate, parseMinRentalDays, itemTitleSchema, itemDescriptionSchema } from "@/utils";
import { ITEM_CATEGORIES } from "@/constants/categories";
import { useItemService, useNavigationService } from "@/providers/ServicesProvider";
import { uploadUserImageFromUri } from "@/services/images";
import { Ionicons } from "@expo/vector-icons";
import { Spacing } from "@/constants/spacing";
import { useItemDetail } from "@/hooks/features/items";
import { useItemsStore } from "@/stores/itemsStore";

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = Colors[colorScheme];
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

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

  // Get item from store (cached, optimized!) instead of service
  const { item, loading } = useItemDetail(id);
  const [published, setPublished] = useState<boolean>(true);

  // nova imagem local (para trocar)
  const { imageUri, pickFromGallery, pickFromCamera } = useImagePicker();
  const itemService = useItemService();
  const navigation = useNavigationService();

  // Validation errors
  const [titleError, setTitleError] = useState<string | undefined>();
  const [descriptionError, setDescriptionError] = useState<string | undefined>();
  const [cityError, setCityError] = useState<string | undefined>();
  const [neighborhoodError, setNeighborhoodError] = useState<string | undefined>();

  // Populate form from cached item (no duplicate query!)
  useEffect(() => {
    if (!item) return;

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
  }, [item]);


  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Sessão expirada", "Faça login novamente.");
      return;
    }

    // Validate input
    setTitleError(undefined);
    setDescriptionError(undefined);
    setCityError(undefined);
    setNeighborhoodError(undefined);

    if (!title.trim()) {
      setTitleError("Título é obrigatório");
      Alert.alert("Título obrigatório", "Digite um título para o item.");
      return;
    }

    const titleResult = itemTitleSchema.safeParse(title);
    if (!titleResult.success) {
      setTitleError(titleResult.error.errors[0]?.message ?? "Título inválido");
      return;
    }

    if (!description.trim()) {
      setDescriptionError("Descrição é obrigatória");
      Alert.alert("Descrição obrigatória", "Descreva o item para ajudar outros usuários.");
      return;
    }

    if (!category) {
      Alert.alert("Categoria obrigatória", "Selecione uma categoria para o item.");
      return;
    }

    // Validate city (required)
    if (!city || !city.trim()) {
      setCityError("Cidade é obrigatória");
      Alert.alert("Cidade obrigatória", "Digite a cidade onde o item está localizado.");
      return;
    }

    // Validate neighborhood (required)
    if (!neighborhood || !neighborhood.trim()) {
      setNeighborhoodError("Bairro é obrigatório");
      Alert.alert("Bairro obrigatório", "Digite o bairro onde o item está localizado.");
      return;
    }

    const itemValidation = validateItemInput({
      title,
      description,
      category,
      minRentalDays,
      dailyRate,
      isFree: false, // Edit screen doesn't have isFree toggle
    });

    if (!itemValidation.valid) {
      Alert.alert("Campos inválidos", itemValidation.error ?? "Verifique os campos preenchidos.");
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

      // Update cache with updated item
      if (item) {
        const updatedItem: Item = {
          ...item,
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
        };
        setItemInStore(updatedItem);
      }

      // Invalidate cache to force refetch
      invalidateItem(id);

      Alert.alert("Sucesso", "Item atualizado.");
      navigation.goBack();
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert("Erro ao salvar", error?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  // Get store action for cache invalidation after save
  const invalidateItem = useItemsStore((state) => state.invalidateItem);
  const setItemInStore = useItemsStore((state) => state.setItem);

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.sm }}>
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
        <ScrollView 
          contentContainerStyle={{ 
            padding: Spacing.sm, 
            paddingBottom: Spacing.lg,
            paddingTop: Math.max(insets.top + 80, Spacing.lg), // Account for transparent header
          }}
        >
          <ThemedText type="title">Editar Item</ThemedText>

          <View style={{ marginTop: Spacing.sm, gap: Spacing.sm }}>
            <Input
              label="Título do item"
              placeholder="Ex: Furadeira Bosch GSR 180-LI"
              value={title}
              onChangeText={setTitle}
              autoCapitalize="sentences"
              error={titleError}
              helperText={!titleError ? "Nome curto e descritivo do item" : undefined}
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
              error={descriptionError}
              helperText={!descriptionError ? "Seja claro sobre o estado e uso do item" : undefined}
              style={{ minHeight: 100 }}
              inputStyle={{ textAlignVertical: "top" }}
              zodSchema={itemDescriptionSchema}
              validateOnBlur={true}
              leftElement={<Ionicons name="document-text" size={20} color={colors.icon.default} />}
            />

            {/* Categoria */}
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
                  onValueChange={setCategory}
                  dropdownIconColor={colors.text.primary}
                  style={{
                    color: colors.text.primary,
                    backgroundColor: "transparent",
                    paddingHorizontal: 16,
                    paddingVertical: 16,
                  }}
                >
                  <Picker.Item label="Selecione uma categoria…" value="" color={colors.input.placeholder} />
                  {ITEM_CATEGORIES.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                </Picker>
              </View>
              {!category && (
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

            <Input
              label="Valor da diária"
              placeholder="Ex: 25,00 ou 30.50"
              value={dailyRate}
              onChangeText={setDailyRate}
              keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
              helperText="Valor em reais (R$) por dia de aluguel"
              leftElement={<Ionicons name="cash" size={20} color={colors.icon.default} />}
            />

            {/* Cidade / Bairro */}
            <ThemedText type="subhead" style={{ marginTop: Spacing.sm, marginBottom: Spacing.xs, fontWeight: '600' }}>
              Localização do item
            </ThemedText>
            <Input
              label="Cidade *"
              placeholder="Ex: São Paulo, Rio de Janeiro..."
              value={city}
              onChangeText={setCity}
              autoCapitalize="words"
              error={cityError}
              helperText={cityError ? undefined : "Campo obrigatório - ajuda outros usuários a encontrarem seu item"}
              leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
            />
            <Input
              label="Bairro *"
              placeholder="Ex: Centro, Vila Madalena..."
              value={neighborhood}
              onChangeText={setNeighborhood}
              autoCapitalize="words"
              error={neighborhoodError}
              helperText={neighborhoodError ? undefined : "Campo obrigatório - localização mais específica"}
              leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
            />

            {/* Publicar item */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginTop: 6 }}>
              <Switch value={published} onValueChange={setPublished} />
              <ThemedText>Publicar item</ThemedText>
            </View>
          </View>

          {/* Imagem: câmera e galeria */}
          <View style={{ marginTop: Spacing.sm, flexDirection: "row", gap: Spacing.sm }}>
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
              backgroundColor: colors.semantic.info,
              paddingVertical: 14,
              borderRadius: 12,
              alignItems: "center",
            }}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText type="defaultSemiBold" style={{ color: colors.isDark ? colors.text.primary : '#ffffff' }}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
