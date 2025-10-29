// app/item/new.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Picker } from "@react-native-picker/picker";
import React, { useState, useCallback } from "react";
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
  StyleSheet,
} from "react-native";
import { Input } from "@/components/Input";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useThemeColors, itemTitleSchema, itemDescriptionSchema, cepSchema } from "@/utils";
import { LiquidGlassView } from "@/components/liquid-glass";
import { z } from "zod";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

// Zod schemas for string inputs that will be parsed
const minRentalDaysStringSchema = z
  .string()
  .min(1, 'Dias mínimos é obrigatório')
  .regex(/^\d+$/, 'Dias mínimos deve ser um número inteiro')
  .refine((val) => {
    const num = Number(val);
    return num > 0 && num <= 365;
  }, 'Dias mínimos deve ser entre 1 e 365');

// Daily rate schema - required when item is not free
const dailyRateStringSchema = z
  .string()
  .min(1, 'Valor da diária é obrigatório')
  .refine((val) => {
    const num = Number(val.replace(',', '.'));
    return !isNaN(num) && num > 0;
  }, 'Valor da diária deve ser um número positivo');

const conditionStringSchema = z
  .string()
  .min(1, 'Condição é obrigatória')
  .max(100, 'Condição muito longa');
import { Image as ExpoImage } from "expo-image";
import { ITEM_CATEGORIES } from "@/constants/categories";
import { useItemService, useNavigationService } from "@/providers/ServicesProvider";
import { uploadUserImageFromUri } from "@/services/images";
import { Ionicons } from "@expo/vector-icons";
import { useItemForm } from "@/hooks/useItemForm";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { useResponsive } from "@/hooks/useResponsive";
import { useViaCEP, formatCEPValue } from "@/hooks/useViaCEP";

export default function NewItemScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = Colors[colorScheme];
  const colors = useThemeColors();
  const { isTablet, isDesktop } = useResponsive();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("Usado");
  const [minRentalDays, setMinRentalDays] = useState("1");
  const [dailyRate, setDailyRate] = useState("");
  const [isFree, setIsFree] = useState(false);

  // Address fields
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [cepFetched, setCepFetched] = useState(false);

  const { imageUri, pickFromGallery, pickFromCamera } = useImagePicker();
  const itemService = useItemService();
  const navigation = useNavigationService();
  const { loading: cepLoading, error: cepError, fetchAddress } = useViaCEP();

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

  // Handle CEP input change and auto-fetch address
  const handleCepChange = useCallback(async (value: string) => {
    const formatted = formatCEPValue(value);
    setCep(formatted);
    
    // Auto-fetch when CEP is complete (8 digits)
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8 && !cepFetched) {
      const address = await fetchAddress(formatted);
      if (address) {
        setNeighborhood(address.neighborhood);
        setCity(address.city);
        setCepFetched(true);
      }
    }
  }, [fetchAddress, cepFetched]);

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

  // Two-column layout for larger screens
  const useTwoColumns = isTablet || isDesktop;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            useTwoColumns && styles.scrollContentTwoColumns,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title" style={styles.title}>Novo Item</ThemedText>

          {/* Main Form Container */}
          <View style={[
            styles.formContainer,
            useTwoColumns && styles.formContainerTwoColumns,
          ]}>
            {/* Left Column / Full Width */}
            <View style={styles.column}>
              {/* Basic Information Section */}
              <Animated.View entering={FadeInDown.duration(300).delay(0)}>
                <LiquidGlassView
                  intensity="subtle"
                  cornerRadius={BorderRadius.xl}
                  style={styles.sectionGlass}
                >
                  <View style={styles.section}>
                <ThemedText type="subhead" style={styles.sectionTitle}>
                  Informações Básicas
                </ThemedText>

                <Input
                  label="Título do item *"
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
                  label="Descrição *"
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

                {/* Category Dropdown */}
                <View>
                  <ThemedText type="caption-1" style={styles.label}>
                    Categoria *
                  </ThemedText>
                  <View
                    style={[
                      styles.pickerContainer,
                      {
                        borderColor: !category ? colors.semantic.error : colors.border.default,
                        backgroundColor: colors.input.bg,
                      },
                    ]}
                  >
                    <Picker
                      selectedValue={category}
                      onValueChange={(v) => setCategory(v)}
                      dropdownIconColor={colors.text.primary}
                      style={[
                        styles.picker,
                        { color: colors.text.primary },
                      ]}
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
                  {!category && (errors.category ? (
                    <ThemedText type="caption-2" style={[styles.errorText, { color: colors.semantic.error }]}>
                      {errors.category}
                    </ThemedText>
                  ) : (
                    <ThemedText type="caption-2" style={[styles.errorText, { color: colors.semantic.error }]}>
                      Selecione uma categoria
                    </ThemedText>
                  ))}
                </View>

                <Input
                  label="Condição"
                  placeholder="Ex: Novo, Usado, Com marcas de uso..."
                  value={condition}
                  onChangeText={setCondition}
                  autoCapitalize="sentences"
                  helperText="Estado atual do item"
                  leftElement={<Ionicons name="information-circle" size={20} color={colors.icon.default} />}
                  zodSchema={conditionStringSchema}
                  validateOnBlur={true}
                />
                  </View>
                </LiquidGlassView>
              </Animated.View>

              {/* Pricing & Rental Section */}
              <Animated.View entering={FadeInDown.duration(300).delay(100)}>
                <LiquidGlassView
                  intensity="subtle"
                  cornerRadius={BorderRadius.xl}
                  style={styles.sectionGlass}
                >
                  <View style={styles.section}>
                <ThemedText type="subhead" style={styles.sectionTitle}>
                  Aluguel e Preço
                </ThemedText>

                <Input
                  label="Dias mínimos para aluguel"
                  placeholder="Ex: 1, 3, 7..."
                  value={minRentalDays}
                  onChangeText={setMinRentalDays}
                  keyboardType="number-pad"
                  helperText="Número mínimo de dias que o item pode ser alugado"
                  leftElement={<Ionicons name="calendar" size={20} color={colors.icon.default} />}
                  zodSchema={minRentalDaysStringSchema}
                  validateOnBlur={true}
                  error={errors.minRentalDays}
                />

                {!isFree && (
                  <Input
                    label="Valor da diária *"
                    placeholder="Ex: 25,00 ou 30.50"
                    value={dailyRate}
                    onChangeText={setDailyRate}
                    keyboardType={Platform.OS === "ios" ? "decimal-pad" : "numeric"}
                    helperText={!errors.dailyRate ? "Valor em reais (R$) por dia de aluguel" : undefined}
                    leftElement={<Ionicons name="cash" size={20} color={colors.icon.default} />}
                    zodSchema={dailyRateStringSchema}
                    validateOnBlur={true}
                    error={errors.dailyRate}
                  />
                )}

                <View style={styles.switchContainer}>
                  <Switch 
                    value={isFree} 
                    onValueChange={setIsFree}
                    trackColor={{
                      false: colors.border.default,
                      true: colors.brand.primary,
                    }}
                    thumbColor={isFree ? colors.bg.primary : colors.text.tertiary}
                  />
                  <ThemedText style={styles.switchLabel}>Emprestar de graça</ThemedText>
                </View>
                  </View>
                </LiquidGlassView>
              </Animated.View>
            </View>

            {/* Right Column (only on larger screens) */}
            <View style={styles.column}>
              {/* Location Section */}
              <Animated.View entering={FadeInUp.duration(300).delay(200)}>
                <LiquidGlassView
                  intensity="subtle"
                  cornerRadius={BorderRadius.xl}
                  style={styles.sectionGlass}
                >
                  <View style={styles.section}>
                <ThemedText type="subhead" style={styles.sectionTitle}>
                  Localização
                </ThemedText>

                {/* CEP Input with ViaCEP */}
                <Input
                  label="CEP (opcional)"
                  placeholder="00000-000"
                  value={cep}
                  onChangeText={handleCepChange}
                  keyboardType="number-pad"
                  maxLength={9}
                  error={cepError || undefined}
                  helperText={
                    cepLoading
                      ? "Buscando endereço..."
                      : cepFetched
                        ? "Endereço preenchido automaticamente"
                        : !cepError
                          ? "Digite o CEP para preencher automaticamente"
                          : undefined
                  }
                  editable={!cepFetched && !saving}
                  rightElement={
                    cepLoading ? (
                      <ActivityIndicator size="small" color={colors.brand.primary} />
                    ) : cepFetched ? (
                      <Ionicons 
                        name="checkmark-circle" 
                        size={20} 
                        color={colors.semantic.success || colors.brand.primary}
                      />
                    ) : (
                      <Ionicons 
                        name="search" 
                        size={20} 
                        color={cep.length === 9 ? colors.brand.primary : colors.text.tertiary}
                      />
                    )
                  }
                  zodSchema={cepSchema}
                  validateOnBlur={true}
                  leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
                />

                <Input
                  label="Cidade"
                  placeholder="Preencha o CEP acima para buscar automaticamente"
                  value={city}
                  onChangeText={setCity}
                  autoCapitalize="words"
                  helperText="Preenchido automaticamente via CEP"
                  leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
                  editable={false}
                  style={{ opacity: 0.7 }}
                />

                <Input
                  label="Bairro"
                  placeholder="Preencha o CEP acima para buscar automaticamente"
                  value={neighborhood}
                  onChangeText={setNeighborhood}
                  autoCapitalize="words"
                  helperText="Preenchido automaticamente via CEP"
                  leftElement={<Ionicons name="location" size={20} color={colors.icon.default} />}
                  editable={false}
                  style={{ opacity: 0.7 }}
                />
                  </View>
                </LiquidGlassView>
              </Animated.View>

              {/* Image Section */}
              <Animated.View entering={FadeInUp.duration(300).delay(300)}>
                <LiquidGlassView
                  intensity="subtle"
                  cornerRadius={BorderRadius.xl}
                  style={styles.sectionGlass}
                >
                  <View style={styles.section}>
                <ThemedText type="subhead" style={styles.sectionTitle}>
                  Foto do Item
                </ThemedText>

                <View style={styles.imageButtonsContainer}>
                  <TouchableOpacity 
                    style={[styles.imageButton, { borderColor: colors.border.default }]}
                    onPress={pickFromCamera} 
                    disabled={saving}
                  >
                    <Ionicons name="camera" size={20} color={colors.icon.default} />
                    <ThemedText type="defaultSemiBold">Câmera</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.imageButton, { borderColor: colors.border.default }]}
                    onPress={pickFromGallery} 
                    disabled={saving}
                  >
                    <Ionicons name="images" size={20} color={colors.icon.default} />
                    <ThemedText type="defaultSemiBold">
                      {imageUri ? "Alterar" : "Galeria"}
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                {imageUri && (
                  <View style={styles.imagePreview}>
                    <ExpoImage
                      source={{ uri: imageUri }}
                      style={styles.previewImage}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      style={[styles.removeImageButton, { backgroundColor: colors.semantic.error }]}
                      onPress={() => {
                        // Note: useImagePicker doesn't have clear method, we'll need to work around this
                        // For now, just hide it visually or add a clear method
                      }}
                    >
                      <Ionicons name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                )}
                  </View>
                </LiquidGlassView>
              </Animated.View>
            </View>
          </View>

          {/* Submit Button */}
          <Animated.View entering={FadeInDown.duration(300).delay(400)}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: colors.brand.dark,
                opacity: saving ? 0.6 : 1,
              },
            ]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color={colors.isDark ? colors.text.primary : '#ffffff'} />
            ) : (
              <ThemedText 
                type="defaultSemiBold" 
                style={{ color: colors.isDark ? colors.text.primary : '#ffffff' }}
              >
                Salvar Item
              </ThemedText>
            )}
          </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  scrollContentTwoColumns: {
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  title: {
    marginBottom: Spacing.md,
  },
  formContainer: {
    gap: Spacing.md,
  },
  formContainerTwoColumns: {
    flexDirection: 'row',
    gap: Spacing.lg,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
    padding: Spacing.md,
  },
  sectionGlass: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
    fontWeight: '600',
  },
  label: {
    marginBottom: Spacing['2xs'],
    fontWeight: '600',
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  picker: {
    backgroundColor: 'transparent',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  errorText: {
    marginTop: Spacing['2xs'],
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing['2xs'],
  },
  switchLabel: {
    flex: 1,
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2xs'],
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  imagePreview: {
    marginTop: Spacing.sm,
    position: 'relative',
    alignSelf: 'flex-start',
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: BorderRadius.md,
  },
  removeImageButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
});
