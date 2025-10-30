import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db, storage } from '@/lib/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, View } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useThemeColors, HapticFeedback, GradientTypes, formatPhone, phoneSchema, displayPhone, emailSchema } from '@/utils';
import { AddressInput } from '@/components/forms';
import { parseAddress, formatAddress } from '@/utils/address';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfileStore } from '@/stores/userProfileStore';

export default function EditProfile() {
  const uid = auth.currentUser?.uid;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(""); 
  const [phone, setPhone] = useState("");
  
  // Structured address fields
  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  
  const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);
  
  // Validation errors
  const [nameError, setNameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();

  // Get profile from store (cached, no duplicate query!)
  const currentUserProfile = useUserProfileStore((state) => state.currentUserProfile);
  const currentUserLoading = useUserProfileStore((state) => state.currentUserLoading);
  const getProfile = useUserProfileStore((state) => state.getProfile);
  const subscribeToCurrentUser = useUserProfileStore((state) => state.subscribeToCurrentUser);

  // Subscribe to current user profile (shared listener)
  useEffect(() => {
    if (uid) {
      subscribeToCurrentUser();
    }
  }, [uid, subscribeToCurrentUser]);

  // Load profile data from store
  useEffect(() => {
    (async () => {
      if (!uid) { setLoading(false); return; }
      
      // Get from cache or fetch if not cached
      const profile = await getProfile(uid, false); // Use cache first
      const d = profile;
      
      if (d) {
        setName(d.name ?? "");
        // Format phone for display if it exists
        setPhone(d.phone ? displayPhone(d.phone) : "");
        
        // Parse address into structured components
        const parsedAddress = parseAddress(d.address);
        setCep(parsedAddress.cep);
        setStreet(parsedAddress.street);
        setNumber(parsedAddress.number);
        setComplement(parsedAddress.complement);
        setNeighborhood(parsedAddress.neighborhood);
        setCity(parsedAddress.city);
        setState(parsedAddress.state);
        
        setEmail(d.email ?? auth.currentUser?.email ?? "");
        setPhotoURL(d.photoURL ?? null);
      } else {
        // Fallback to auth user data
        setEmail(auth.currentUser?.email ?? "");
      }
      
      setLoading(false);
    })();
  }, [uid, getProfile]);

  const pickAvatar = async () => {
    HapticFeedback.light();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permissão necessária", "Conceda acesso às fotos.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8,
    });
    if (!res.canceled) {
      HapticFeedback.selection();
      setLocalUri(res.assets[0].uri);
    }
  };

  const save = async () => {
    if (!uid) return;
    
    // Clear previous errors
    setNameError(undefined);
    setPhoneError(undefined);
    
    // Validate name
    if (!name.trim()) {
      setNameError('Nome é obrigatório');
      Alert.alert('Nome obrigatório', 'Digite seu nome completo');
      return;
    }
    if (name.trim().length < 2) {
      setNameError('Nome deve ter pelo menos 2 caracteres');
      return;
    }
    
    setSaving(true);
    HapticFeedback.medium();
    try {
      let newPhotoURL = photoURL;

      if (localUri) {
        const r = await fetch(localUri);
        const blob = await r.blob();
        const ct = blob.type?.startsWith("image/") ? blob.type : "image/jpeg";
        const ext = ct.split("/")[1] || "jpg";
        const filename = `avatar-${Date.now()}.${ext}`;
        const path = `avatars/${uid}/${filename}`;
        const rf = ref(storage, path);
        await uploadBytes(rf, blob, { contentType: ct });
        newPhotoURL = await getDownloadURL(rf);
      }

      // Validate and clean phone if provided
      let phoneClean: string | null = null;
      if (phone.trim()) {
        const phoneResult = phoneSchema.safeParse(phone);
        if (!phoneResult.success) {
          const errorMsg = phoneResult.error.errors[0]?.message ?? 'Verifique o número de telefone';
          setPhoneError(errorMsg);
          Alert.alert('Telefone inválido', errorMsg);
          return;
        }
        phoneClean = phoneResult.data; // Zod already cleaned it
      }
      
      // Format address from structured components
      const formattedAddress = formatAddress({
        street: street.trim(),
        number: number.trim(),
        complement: complement.trim() || undefined,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase(),
        cep: cep.trim() || undefined,
      });

      await updateDoc(doc(db, "users", uid), {
        name: name.trim(),
        phone: phoneClean,
        address: formattedAddress || null,
        // email no auth/credencial; aqui mantemos referência
        photoURL: newPhotoURL ?? null,
        updatedAt: serverTimestamp(),
      });

      HapticFeedback.success();
      Alert.alert("Perfil atualizado!", "Suas informações foram salvas com sucesso.");
      router.back();
    } catch (e: unknown) {
      HapticFeedback.error();
      const error = e as { message?: string };
      Alert.alert("Erro ao salvar", error?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  if (!uid) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: "center", alignItems: "center" }}>
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md }}>
          <ThemedText type="title-2">Faça login para editar o perfil.</ThemedText>
        </LiquidGlassView>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <ThemedText type="callout" style={{ marginTop: Spacing.sm }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={{ 
            padding: Spacing.sm, 
            paddingTop: Spacing.sm + insets.top + 90, // Account for header height (approx 90px) + safe area
            paddingBottom: Spacing.lg 
          }}
        >
          <ThemedText type="large-title" style={{ marginBottom: Spacing.lg }}>Editar Perfil</ThemedText>

          <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md, marginBottom: Spacing.md, alignItems: 'center' }}>
            {(localUri || photoURL) ? (
              <ExpoImage
                source={{ uri: localUri ?? photoURL ?? undefined }}
                style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 16, borderWidth: 3, borderColor: colors.isDark ? colors.brand.primary : colors.brand.dark }}
                contentFit="cover"
                transition={200}
                cachePolicy="memory-disk"
                recyclingKey={localUri ?? photoURL ?? 'profile'}
              />
            ) : (
              <LinearGradient
                colors={GradientTypes.brand.colors}
                style={{ width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
              >
                <ThemedText style={{ color: colors.isDark ? colors.text.primary : '#ffffff', fontSize: 48 }}>👤</ThemedText>
              </LinearGradient>
            )}
            <Button variant="secondary" onPress={pickAvatar}>
              {localUri ? "Alterar foto (nova selecionada)" : "Alterar foto"}
            </Button>
          </LiquidGlassView>

          <LiquidGlassView intensity="standard" cornerRadius={20} style={{ padding: 20 }}>
            <View style={{ gap: 16 }}>
              <Input
                label="Nome completo"
                placeholder="Digite seu nome completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                error={nameError}
                helperText={!nameError ? "Como você gostaria de ser chamado" : undefined}
                leftElement={<Ionicons name="person" size={20} color={colors.icon.default} />}
              />

              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChangeText={(value) => setPhone(formatPhone(value))}
                keyboardType="phone-pad"
                maxLength={15}
                error={phoneError}
                helperText={!phoneError ? "Inclua DDD. Formato: (00) 00000-0000" : undefined}
                zodSchema={phoneSchema}
                validateOnBlur={true}
                onValidationChange={(isValid, error) => setPhoneError(error)}
                leftElement={<Ionicons name="call" size={20} color={colors.icon.default} />}
              />
              
              {/* Address Input with ViaCEP */}
              <View style={{ marginTop: 8 }}>
                <AddressInput
                  cep={cep}
                  street={street}
                  number={number}
                  complement={complement}
                  neighborhood={neighborhood}
                  city={city}
                  state={state}
                  onCepChange={setCep}
                  onStreetChange={setStreet}
                  onNumberChange={setNumber}
                  onComplementChange={setComplement}
                  onNeighborhoodChange={setNeighborhood}
                  onCityChange={setCity}
                  onStateChange={setState}
                />
              </View>
              
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                editable={false}
                helperText="E-mail não pode ser alterado"
                leftElement={<Ionicons name="mail" size={20} color={colors.text.tertiary} />}
                inputStyle={{ opacity: 0.7 }}
              />
            </View>

            <Button
              variant="primary"
              onPress={save}
              disabled={saving}
              loading={saving}
              fullWidth
              style={{ marginTop: 24 }}
            >
              Salvar alterações
            </Button>
          </LiquidGlassView>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
