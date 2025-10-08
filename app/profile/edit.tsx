import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db, storage } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import * as ImagePicker from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function EditProfile() {
  const uid = auth.currentUser?.uid;
  const isDark = useColorScheme() === "dark";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(""); const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(""); const [email, setEmail] = useState("");
  const [photoURL, setPhotoURL] = useState<string | null>(null);
  const [localUri, setLocalUri] = useState<string | null>(null);

  const inputStyle = useMemo(() => ({
    borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16,
    color: isDark ? "#fff" : "#111827",
    borderColor: isDark ? "#374151" : "#d1d5db",
    backgroundColor: isDark ? "#111827" : "#fff",
  }), [isDark]);
  const placeholderColor = isDark ? "#9aa0a6" : "#6b7280";

  useEffect(() => {
    (async () => {
      if (!uid) { setLoading(false); return; }
      const snap = await getDoc(doc(db, "users", uid));
      const d = snap.data() as any;
      setName(d?.name ?? "");
      setPhone(d?.phone ?? "");
      setAddress(d?.address ?? "");
      setEmail(d?.email ?? auth.currentUser?.email ?? "");
      setPhotoURL(d?.photoURL ?? null);
      setLoading(false);
    })();
  }, [uid]);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Permissão necessária", "Conceda acesso às fotos.");
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8,
    });
    if (!res.canceled) setLocalUri(res.assets[0].uri);
  };

  const save = async () => {
    if (!uid) return;
    setSaving(true);
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

      Alert.alert("Perfil atualizado!");
      router.back();
    } catch (e: any) {
      Alert.alert("Erro ao salvar", e?.message ?? String(e));
    } finally {
      setSaving(false);
    }
  };

  if (!uid) {
    return (
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: "center", alignItems: "center" }}>
        <ThemedText>Faça login para editar o perfil.</ThemedText>
      </ThemedView>
    );
  }

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, padding: 16 }}>
        <ActivityIndicator />
        <ThemedText style={{ marginTop: 8 }}>Carregando…</ThemedText>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
          <ThemedText type="title">Editar Perfil</ThemedText>

          <TouchableOpacity style={{ marginTop: 16 }} onPress={pickAvatar}>
            <ThemedText type="defaultSemiBold">
              {localUri ? "Alterar foto (nova selecionada)" : "Alterar foto"}
            </ThemedText>
          </TouchableOpacity>

          {(localUri || photoURL) && (
            <Image
              source={{ uri: localUri ?? photoURL ?? undefined }}
              style={{ width: 96, height: 96, borderRadius: 48, marginTop: 8 }}
            />
          )}

          <View style={{ marginTop: 16, gap: 12 }}>
            <TextInput placeholder="Nome" placeholderTextColor={placeholderColor}
              value={name} onChangeText={setName} style={inputStyle} />
            <TextInput placeholder="Telefone" placeholderTextColor={placeholderColor}
              value={phone} onChangeText={setPhone} keyboardType="phone-pad" style={inputStyle} />
            <TextInput placeholder="Endereço" placeholderTextColor={placeholderColor}
              value={address} onChangeText={setAddress} style={inputStyle} />
            <TextInput placeholder="E-mail" placeholderTextColor={placeholderColor}
              value={email} editable={false} style={[inputStyle, { opacity: 0.75 }]} />
          </View>

          <TouchableOpacity
            style={{
              marginTop: 24, backgroundColor: isDark ? "#2563eb" : "#1d4ed8",
              paddingVertical: 14, borderRadius: 12, alignItems: "center", opacity: saving ? 0.6 : 1
            }}
            disabled={saving}
            onPress={save}
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
