/**
 * New Item Screen - Create a new item for rental
 * 
 * Refactored to use extracted form sections:
 * - BasicInfoSection: Title, description, category, condition
 * - PricingSection: Min rental days, daily rate, free toggle
 * - LocationSection: CEP, city, neighborhood with ViaCEP
 * - ImageUploadSection: Image picker from camera/gallery
 */

import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useItemService, useNavigationService } from "@/providers/ServicesProvider";
import { uploadUserImageFromUri } from "@/services/images";
import { useImagePicker } from "@/hooks/useImagePicker";
import { useItemForm } from "@/hooks/features/items";
import { useThemeColors } from "@/utils";
import { Spacing, BorderRadius } from "@/constants/spacing";
import { useResponsive } from "@/hooks/useResponsive";
import { useViaCEP } from "@/hooks/useViaCEP";
import { formatCEP } from "@/utils/formatters";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import {
  BasicInfoSection,
  PricingSection,
  LocationSection,
  ImageUploadSection,
} from "@/components/features/items/forms";
import { TERMS_URL, TERMS_VERSION } from "@/constants/terms";

export default function NewItemScreen() {
  const colors = useThemeColors();
  const { isTablet, isDesktop } = useResponsive();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ helpRequestId?: string }>();
  const helpRequestId = params.helpRequestId;

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [condition, setCondition] = useState<string>("Usado");
  const [minRentalDays, setMinRentalDays] = useState("1");
  const [dailyRate, setDailyRate] = useState("");

  // Address fields
  const [cep, setCep] = useState("");
  const [city, setCity] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [cepFetched, setCepFetched] = useState(false);

  // Terms acceptance
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Image picker
  const { imageUri, pickFromGallery, pickFromCamera, clearImage } = useImagePicker();
  
  // Services
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
    city?: string;
    neighborhood?: string;
    photos?: string[];
    published?: boolean;
    termsAccepted: boolean;
    termsAcceptedVersion?: string;
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
    // isFree is automatically calculated from dailyRate === 0 in buildItemDoc
    const result = await itemService.createItem({
      ...data,
      photos: photoUrl ? [photoUrl] : data.photos ?? [],
    });

    // If created from help request, link it
    if (helpRequestId && result.data.id) {
      try {
        const { offerItemToHelpRequest } = await import('@/services/helpRequest');
        await offerItemToHelpRequest(helpRequestId, result.data.id);
        Alert.alert("Sucesso", "Item cadastrado e vinculado ao pedido de ajuda!");
        router.replace(`/help/${helpRequestId}`);
        return;
      } catch (error) {
        console.error('Error linking item to help request:', error);
        // Continue anyway
      }
    }

    Alert.alert("Sucesso", `Item cadastrado! (id: ${result.data.id})`);
    navigation.navigateToHome();
  };

  const { submit, loading: saving, errors } = useItemForm(handleSubmit);

  // Handle CEP input change and auto-fetch address
  const handleCepChange = useCallback(async (value: string) => {
    const formatted = formatCEP(value);
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

  // Two-column layout for larger screens
  const useTwoColumns = isTablet || isDesktop;

  const handleSave = async () => {
    await submit({
      title,
      description,
      category,
      condition,
      minRentalDays,
      dailyRate,
      city,
      neighborhood,
      photos: [],
      termsAccepted,
      termsAcceptedVersion: TERMS_VERSION,
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
          contentContainerStyle={[
            styles.scrollContent,
            useTwoColumns && styles.scrollContentTwoColumns,
            {
              paddingTop: Math.max(insets.top + 80, Spacing.lg), // Account for transparent header
            },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="title" style={styles.title}>Novo Item</ThemedText>

          {/* Main Form Container */}
          <View style={[
            styles.formContainer,
            useTwoColumns ? styles.formContainerTwoColumns : styles.formContainerMobile,
          ]}>
            {/* Left Column / Full Width */}
            <View style={useTwoColumns ? styles.column : styles.columnMobile}>
              {/* Basic Information Section */}
              <Animated.View entering={FadeInDown.duration(300).delay(0)}>
                <BasicInfoSection
                  title={title}
                  description={description}
                  category={category}
                  condition={condition}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onCategoryChange={setCategory}
                  onConditionChange={setCondition}
                  errors={errors}
                  colors={colors}
                />
              </Animated.View>

              {/* Pricing & Rental Section */}
              <Animated.View entering={FadeInDown.duration(300).delay(100)}>
                <PricingSection
                  minRentalDays={minRentalDays}
                  dailyRate={dailyRate}
                  onMinRentalDaysChange={setMinRentalDays}
                  onDailyRateChange={setDailyRate}
                  errors={errors}
                  colors={colors}
                />
              </Animated.View>
            </View>

            {/* Right Column (only on larger screens) */}
            <View style={useTwoColumns ? styles.column : styles.columnMobile}>
              {/* Location Section */}
              <Animated.View entering={FadeInUp.duration(300).delay(200)}>
                <LocationSection
                  cep={cep}
                  city={city}
                  neighborhood={neighborhood}
                  onCepChange={handleCepChange}
                  onCityChange={setCity}
                  onNeighborhoodChange={setNeighborhood}
                  cepLoading={cepLoading}
                  cepError={cepError}
                  cepFetched={cepFetched}
                  saving={saving}
                  colors={colors}
                  cityError={errors.city}
                  neighborhoodError={errors.neighborhood}
                />
              </Animated.View>

              {/* Image Section */}
              <Animated.View entering={FadeInUp.duration(300).delay(300)}>
                <ImageUploadSection
                  imageUri={imageUri}
                  onPickFromCamera={pickFromCamera}
                  onPickFromGallery={pickFromGallery}
                  onRemoveImage={clearImage}
                  saving={saving}
                  colors={colors}
                />
              </Animated.View>
            </View>
          </View>

          {/* Terms Acceptance */}
          <Animated.View entering={FadeInDown.duration(300).delay(350)}>
            <View
              style={[
                styles.termsContainer,
                {
                  backgroundColor: colors.bg.secondary,
                  borderColor: colors.border.default,
                },
              ]}
            >
              <Pressable
                onPress={() => setTermsAccepted((value) => !value)}
                style={[
                  styles.checkbox,
                  {
                    borderColor: termsAccepted ? colors.brand.primary : colors.border.default,
                    backgroundColor: colors.isDark ? colors.bg.tertiary : colors.bg.primary,
                  },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
                accessibilityLabel="Aceitar os termos de uso para cadastrar o item"
              >
                {termsAccepted && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.isDark ? colors.text.primary : colors.brand.dark}
                  />
                )}
              </Pressable>

              <ThemedText style={[styles.termsText, { color: colors.text.primary }]}>
                Concordo com os{" "}
                <ThemedText
                  onPress={() => router.push(TERMS_URL)}
                  accessibilityRole="link"
                  accessibilityHint="Abrir os termos de uso em uma nova tela"
                  style={[styles.termsLink, { color: colors.brand.primary }]}
                >
                  Termos de Uso
                </ThemedText>{" "}
                para publicar este item.
              </ThemedText>
            </View>

            {errors.termsAccepted && (
              <ThemedText style={[styles.errorText, { color: colors.semantic.error }]}>
                {errors.termsAccepted}
              </ThemedText>
            )}
          </Animated.View>

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
                <ActivityIndicator
                  size="small"
                  color={colors.isDark ? colors.text.primary : "#ffffff"}
                />
              ) : (
                <ThemedText
                  type="defaultSemiBold"
                  style={{ color: colors.isDark ? colors.text.primary : "#ffffff" }}
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
    width: '100%',
  },
  scrollContentTwoColumns: {
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  title: {
    marginBottom: Spacing.md,
  },
  formContainer: {
    width: '100%',
  },
  formContainerMobile: {
    flexDirection: 'column',
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
    minWidth: 0, // Prevents flex items from overflowing
  },
  columnMobile: {
    width: '100%',
    gap: Spacing.md,
    flexShrink: 0,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius['2xs'],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
  },
  termsLink: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  errorText: {
    marginTop: Spacing['3xs'],
    fontSize: 12,
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
