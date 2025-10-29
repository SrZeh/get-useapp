// app/item/new.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db, storage } from "@/lib/firebase";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import React, { useMemo, useState } from "react";
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
import { HapticFeedback } from "@/utils/haptics";
import { Image as ExpoImage } from "expo-image";
import { logger } from "@/utils/logger";

const CATEGORIES = [
  // Ferramentas & construção
  "Ferramentas elétricas",
  "Ferramentas manuais",
  "Construção & Reforma",
  "Marcenaria & Carpintaria",
  "Jardinagem",
  // Aventura & lazer
  "Camping & Trilha",
  "Esportes & Lazer",
  "Mobilidade (bike/patinete)",
  // Audiovisual & tech
  "Fotografia & Vídeo",
  "Música & Áudio",
  "Informática & Acessórios",
  // Casa & outros úteis
  "Eletroportáteis",
  "Cozinha & Utensílios",
  "Eventos & Festas",
  "Móveis & Decoração",
  // Veículos
  "Automotivo & Moto",
  // Infantil / pet / saúde
  "Bebê & Infantil",
  "Brinquedos & Jogos",
  "Pet",
  "Saúde & Beleza",
  // fallback (evitar, mas disponível)
  "Outros",
] as const;

export default function NewItemScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = Colors[colorScheme];

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

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const textInputBase = useMemo(
    () => ({
      borderWidth: 1,
      borderRadius: 16,
      padding: 16,
      fontSize: 17,
      color: palette.text,
      borderColor: palette.border,
      backgroundColor: palette.inputBg,
    }),
    [palette]
  );
  const placeholderColor = palette.textTertiary;

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Conceda acesso às fotos para selecionar uma imagem.");
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const ok = await requestGalleryPermission();
    if (!ok) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsMultipleSelection: false,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Conceda acesso à câmera.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Sessão expirada", "Faça login novamente para cadastrar itens.");
      return;
    }
    if (!title.trim() || !description.trim()) {
      Alert.alert("Campos obrigatórios", "Preencha título e descrição.");
      return;
    }
    if (!category) {
      Alert.alert("Categoria", "Selecione uma categoria.");
      return;
    }
    const days = Number(minRentalDays);
    if (!Number.isFinite(days) || days <= 0) {
      Alert.alert("Valor inválido", "Dias mínimos deve ser maior que 0.");
      return;
    }

    let rate = 0;
    if (!isFree) {
      const parsed = dailyRate.trim() ? Number(dailyRate.replace(",", ".")) : NaN;
      if (!Number.isFinite(parsed) || parsed <= 0) {
        Alert.alert("Valor inválido", "Informe a diária (maior que 0) ou marque Grátis.");
        return;
      }
      rate = parsed;
    }

    setSaving(true);
    try {
      // 1) Upload da imagem (opcional)
      let photoUrl: string | null = null;
      if (imageUri) {
        const resp = await fetch(imageUri);
        const blob = await resp.blob();

        const guessed = blob.type && blob.type.startsWith("image/")
          ? blob.type
          : "image/jpeg";
        const ext = guessed.split("/")[1] || "jpg";
        const filename = `item-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const storagePath = `items/${uid}/${filename}`;

        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, blob, { contentType: guessed });
        photoUrl = await getDownloadURL(storageRef);
      }

      // 2) Documento no Firestore (já publicado)
      const normalize = (s?: string) => (s ?? "").trim();
      const toLower = (s?: string) => normalize(s).toLowerCase();

      const docRef = await addDoc(collection(db, "items"), {
        ownerUid: uid,
        title: normalize(title),
        description: normalize(description),
        category: normalize(category),
        condition: normalize(condition),
        minRentalDays: days,
        dailyRate: rate,
        isFree,
        photos: photoUrl ? [photoUrl] : [],
        available: true,

        // vitrine / localização
        published: true,
        city: normalize(city),
        neighborhood: normalize(neighborhood),
        cityLower: toLower(city),
        neighborhoodLower: toLower(neighborhood),

        // agregados de avaliação (inicial)
        ratingAvg: 0,
        ratingCount: 0,
        lastReviewSnippet: "",

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", `Item cadastrado! (id: ${docRef.id})`);
      router.replace("/(tabs)"); // ajuste a rota final que você usa
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
                {CATEGORIES.map((c) => (
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
            <TouchableOpacity onPress={pickCamera} disabled={saving}>
              <ThemedText type="defaultSemiBold">Usar câmera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} disabled={saving}>
              <ThemedText type="defaultSemiBold">
                {imageUri ? "Alterar foto" : "Selecionar foto"}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={{ width: "40%", height: 140, marginTop: 12, borderRadius: 10 }}
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
