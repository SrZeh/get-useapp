import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { HapticFeedback } from '@/utils/haptics';
import { Image as ExpoImage } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTypes } from '@/utils/gradients';
import type { UserProfile } from '@/types';

export default function EditProfile() {
  const uid = auth.currentUser?.uid;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const palette = Colors[colorScheme];

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(""); const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);

  const inputStyle = useMemo(() => ({
    borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 17,
    color: palette.text,
    borderColor: palette.border,
    backgroundColor: palette.inputBg,
  }), [palette]);
  const placeholderColor = palette.textTertiary;

  useEffect(() => {
    (async () => {
      if (!uid) { setLoading(false); return; }
      const snap = await getDoc(doc(db, "users", uid));
      const d = snap.data() as Partial<UserProfile> | undefined;
      setName(d?.name ?? "");
      setPhone(d?.phone ?? "");
      setAddress(d?.address ?? "");
      setEmail(d?.email ?? auth.currentUser?.email ?? "");
      setPhotoURL(d?.photoURL ?? null);
      setLoading(false);
    })();
  }, [uid]);

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

      await updateDoc(doc(db, "users", uid), {
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        // email no auth/credencial; aqui mantemos referência
        photoURL: newPhotoURL ?? null,
        updatedAt: serverTimestamp(),
      });

      HapticFeedback.success();
      Alert.alert("Perfil atualizado!");
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
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center", backgroundColor: palette.background }}>
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24 }}>
          <ThemedText type="title-2">Faça login para editar o perfil.</ThemedText>
        </LiquidGlassView>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center', alignItems: 'center', backgroundColor: palette.background }}>
        <ActivityIndicator size="large" />
        <ThemedText type="callout" style={{ marginTop: 16 }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: palette.background }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, backgroundColor: palette.background }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <ThemedText type="large-title" style={{ marginBottom: 32 }}>Editar Perfil</ThemedText>

          <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24, marginBottom: 24, alignItems: 'center' }}>
            {(localUri || photoURL) ? (
              <ExpoImage
                source={{ uri: localUri ?? photoURL ?? undefined }}
                style={{ width: 120, height: 120, borderRadius: 60, marginBottom: 16, borderWidth: 3, borderColor: '#96ff9a' }}
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
                <ThemedText style={{ color: '#fff', fontSize: 48 }}>👤</ThemedText>
              </LinearGradient>
            )}
            <Button variant="secondary" onPress={pickAvatar}>
              {localUri ? "Alterar foto (nova selecionada)" : "Alterar foto"}
            </Button>
          </LiquidGlassView>

          <LiquidGlassView intensity="standard" cornerRadius={20} style={{ padding: 20 }}>
            <View style={{ gap: 16 }}>
              <LiquidGlassView intensity="subtle" cornerRadius={16}>
                <TextInput 
                  placeholder="Nome" 
                  placeholderTextColor={placeholderColor}
                  value={name} 
                  onChangeText={setName} 
                  style={[inputStyle, { backgroundColor: 'transparent' }]} 
                />
              </LiquidGlassView>
              <LiquidGlassView intensity="subtle" cornerRadius={16}>
                <TextInput 
                  placeholder="Telefone" 
                  placeholderTextColor={placeholderColor}
                  value={phone} 
                  onChangeText={setPhone} 
                  keyboardType="phone-pad" 
                  style={[inputStyle, { backgroundColor: 'transparent' }]} 
                />
              </LiquidGlassView>
              <LiquidGlassView intensity="subtle" cornerRadius={16}>
                <TextInput 
                  placeholder="Endereço" 
                  placeholderTextColor={placeholderColor}
                  value={address} 
                  onChangeText={setAddress} 
                  style={[inputStyle, { backgroundColor: 'transparent' }]} 
                />
              </LiquidGlassView>
              <LiquidGlassView intensity="subtle" cornerRadius={16} style={{ opacity: 0.7 }}>
                <TextInput 
                  placeholder="E-mail" 
                  placeholderTextColor={placeholderColor}
                  value={email} 
                  editable={false} 
                  style={[inputStyle, { backgroundColor: 'transparent' }]} 
                />
              </LiquidGlassView>
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
