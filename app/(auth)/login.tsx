import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const isDark = useColorScheme() === "dark";

  const inputStyle = useMemo(() => ({
    borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16,
    color: isDark ? "#fff" : "#111827",
    borderColor: isDark ? "#374151" : "#d1d5db",
    backgroundColor: isDark ? "#111827" : "#fff",
  }), [isDark]);
  const placeholderColor = isDark ? "#9aa0a6" : "#6b7280";

  const onLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      console.log('LOGIN ERROR', e?.code, e?.message);
      Alert.alert('Erro ao entrar', `${e?.code ?? ''} ${e?.message ?? ''}`);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <ThemedText type="title">Entrar</ThemedText>
        <View style={{ gap: 12, marginTop: 16 }}>
          <TextInput
            placeholder="E-mail" placeholderTextColor={placeholderColor}
            autoCapitalize="none" keyboardType="email-address"
            onChangeText={setEmail} value={email} style={inputStyle}
          />
          <TextInput
            placeholder="Senha" placeholderTextColor={placeholderColor}
            secureTextEntry onChangeText={setPassword} value={password} style={inputStyle}
          />
        </View>

        <TouchableOpacity style={{
          marginTop: 16, backgroundColor: isDark ? "#00ce08" : "#00ce08",
          paddingVertical: 14, borderRadius: 12, alignItems: "center"
        }} onPress={onLogin}>
          <ThemedText type="defaultSemiBold" style={{ color: "#181818" }}>Entrar</ThemedText>
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          <Link href="/(auth)/register"><ThemedText>Não tem conta? Criar conta</ThemedText></Link>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
