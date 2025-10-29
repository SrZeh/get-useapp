import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { auth, db, storage } from "@/lib/firebase";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import {
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
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
  useColorScheme,
} from "react-native";

const CATEGORIES = [
  "Ferramentas elétricas",
  "Ferramentas manuais",
  "Construção & Reforma",
  "Marcenaria & Carpintaria",
  "Jardinagem",
  "Camping & Trilha",
  "Esportes & Lazer",
  "Mobilidade (bike/patinete)",
  "Fotografia & Vídeo",
  "Música & Áudio",
  "Informática & Acessórios",
  "Eletroportáteis",
  "Cozinha & Utensílios",
  "Eventos & Festas",
  "Móveis & Decoração",
  "Automotivo & Moto",
  "Bebê & Infantil",
  "Brinquedos & Jogos",
  "Pet",
  "Saúde & Beleza",
  "Outros",
] as const;

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

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
  const [imageUri, setImageUri] = useState<string | null>(null);

  const textInputBase = useMemo(
    () => ({
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: isDark ? "#ffffff" : "#111827",
      borderColor: isDark ? "#374151" : "#d1d5db",
      backgroundColor: isDark ? "#111827" : "#ffffff",
    }),
    [isDark]
  );
  const placeholderColor = isDark ? "#9aa0a6" : "#6b7280";

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "items", id));
        if (!snap.exists()) {
          Alert.alert("Ops", "Item não encontrado.");
          router.back();
          return;
        }
        const d = snap.data() as Partial<Item> | undefined;
        setTitle(d?.title ?? "");
        setDescription(d?.description ?? "");
        setCategory(d?.category ?? "");
        setCondition(d.condition ?? "Usado");
        setMinRentalDays(String(d.minRentalDays ?? 1));
        setDailyRate(
          d.dailyRate != null && isFinite(d.dailyRate) ? String(d.dailyRate) : ""
        );
        setPhotoUrl(d.photos?.[0] ?? null);

        setCity(d.city ?? "");
        setNeighborhood(d.neighborhood ?? "");
        setPublished(d.published !== false); // default true
      } catch (e: unknown) {
        const error = e as { message?: string };
        Alert.alert("Erro ao carregar", error?.message ?? String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permissão necessária", "Conceda acesso às fotos.");
      return;
    }
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
      Alert.alert("Sessão expirada", "Faça login novamente.");
      return;
    }
    if (!title.trim() || !description.trim() || !category) {
      Alert.alert("Campos obrigatórios", "Preencha título, descrição e categoria.");
      return;
    }
    const days = Number(minRentalDays);
    if (!Number.isFinite(days) || days <= 0) {
      Alert.alert("Valor inválido", "Dias mínimos deve ser > 0.");
      return;
    }
    const rate = dailyRate.trim() ? Number(dailyRate.replace(",", ".")) : NaN;
    if (!Number.isFinite(rate) || rate <= 0) {
      Alert.alert("Valor inválido", "Informe a diária (número > 0).");
      return;
    }

    setSaving(true);
    try {
      let newPhotoUrl = photoUrl;

      if (imageUri) {
        // sobe nova imagem e substitui a primeira
        const resp = await fetch(imageUri);
        const blob = await resp.blob();
        const contentType = blob.type?.startsWith("image/") ? blob.type : "image/jpeg";
        const ext = contentType.split("/")[1] || "jpg";
        const filename = `item-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const storagePath = `items/${uid}/${filename}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, blob, { contentType });
        newPhotoUrl = await getDownloadURL(storageRef);
      }

      const normalize = (s?: string) => (s ?? "").trim();
      const toLower = (s?: string) => normalize(s).toLowerCase();

      await updateDoc(doc(db, "items", id), {
        title: normalize(title),
        description: normalize(description),
        category: normalize(category),
        condition: normalize(condition),
        minRentalDays: days,
        dailyRate: rate,
        photos: newPhotoUrl ? [newPhotoUrl] : [],
        published, // toggle
        city: normalize(city),
        neighborhood: normalize(neighborhood),
        cityLower: toLower(city),
        neighborhoodLower: toLower(neighborhood),
        updatedAt: serverTimestamp(),
      });

      Alert.alert("Sucesso", "Item atualizado.");
      router.back();
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
                {CATEGORIES.map((c) => (
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
            <TouchableOpacity onPress={pickCamera} disabled={saving}>
              <ThemedText type="defaultSemiBold">Usar câmera</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={pickImage} disabled={saving}>
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
