// app/(auth)/login.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { sendPasswordResetEmail, signInWithEmailAndPassword, type ActionCodeSettings } from 'firebase/auth';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busyLogin, setBusyLogin] = useState(false);
  const [busyReset, setBusyReset] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const isDark = useColorScheme() === 'dark';

  const notify = (title: string, msg: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${msg}`);
    } else {
      Alert.alert(title, msg);
    }
  };

  const inputStyle = useMemo(
    () => ({
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      fontSize: 16,
      color: isDark ? '#fff' : '#111827',
      borderColor: isDark ? '#374151' : '#d1d5db',
      backgroundColor: isDark ? '#111827' : '#fff',
    }),
    [isDark]
  );
  const placeholderColor = isDark ? '#9aa0a6' : '#6b7280';

  const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://upperreggae.web.app';
  const actionCodeSettings: ActionCodeSettings = {
    url: `${SITE_URL}/login?reset=1`,
    handleCodeInApp: false,
  };

  const onLogin = async () => {
    if (busyLogin) return;
    setErrMsg(null);
    setBusyLogin(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      console.log('LOGIN ERROR', e?.code, e?.message);
      const code = e?.code ?? '';
      let msg = 'Não foi possível entrar.';
      if (code === 'auth/invalid-email') msg = 'E-mail inválido.';
      else if (code === 'auth/user-disabled') msg = 'Usuário desativado.';
      else if (code === 'auth/user-not-found') msg = 'Usuário não encontrado.';
      else if (code === 'auth/wrong-password') msg = 'Senha incorreta.';
      else if (code === 'auth/network-request-failed') msg = 'Falha de rede. Verifique sua conexão.';
      setErrMsg(msg);
      notify('Erro ao entrar', msg);
    } finally {
      setBusyLogin(false);
    }
  };

  const onForgot = async () => {
    if (busyReset) return;
    const mail = email.trim();
    if (!mail) {
      notify('Informe seu e-mail', "Digite seu e-mail e toque novamente em 'Esqueci a senha'.");
      return;
    }
    setErrMsg(null);
    setBusyReset(true);
    try {
      await sendPasswordResetEmail(auth, mail, actionCodeSettings);
      notify('Verifique seu e-mail', 'Se o e-mail existir, enviamos um link de redefinição. Veja também a caixa de spam.');
    } catch (e: any) {
      console.log('[RESET ERROR]', e?.code, e?.message);
      const code = e?.code ?? '';
      if (
        code === 'auth/unauthorized-continue-uri' ||
        code === 'auth/invalid-continue-uri' ||
        code === 'auth/missing-continue-uri'
      ) {
        // Fallback sem settings (página padrão Firebase)
        try {
          await sendPasswordResetEmail(auth, mail);
          notify('Verifique seu e-mail', 'Enviamos um link de redefinição. Veja também a caixa de spam.');
        } catch (e2: any) {
          const msg = e2?.message ?? 'Tente novamente mais tarde.';
          setErrMsg(msg);
          notify('Não foi possível enviar', msg);
        }
      } else {
        let msg = e?.message ?? 'Tente novamente mais tarde.';
        if (code === 'auth/invalid-email') msg = 'E-mail inválido.';
        if (code === 'auth/network-request-failed') msg = 'Falha de rede. Verifique sua conexão.';
        setErrMsg(msg);
        notify('Não foi possível enviar', msg);
      }
    } finally {
      setBusyReset(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <ThemedText type="title">Entrar</ThemedText>

        <View style={{ gap: 12, marginTop: 16 }}>
          <TextInput
            placeholder="E-mail"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            keyboardType="email-address"
            onChangeText={setEmail}
            value={email}
            style={inputStyle}
          />
          <TextInput
            placeholder="Senha"
            placeholderTextColor={placeholderColor}
            secureTextEntry
            onChangeText={setPassword}
            value={password}
            style={inputStyle}
          />
        </View>

        <TouchableOpacity
          style={{
            marginTop: 16,
            backgroundColor: '#00ce08',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            opacity: busyLogin ? 0.7 : 1,
          }}
          onPress={onLogin}
          disabled={busyLogin}
        >
          {busyLogin ? <ActivityIndicator color="#181818" /> : <ThemedText type="defaultSemiBold" style={{ color: '#181818' }}>Entrar</ThemedText>}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 12, paddingVertical: 10, alignItems: 'center', opacity: busyReset ? 0.7 : 1 }}
          onPress={onForgot}
          disabled={busyReset}
        >
          {busyReset ? <ActivityIndicator /> : <ThemedText style={{ textDecorationLine: 'underline' }}>Esqueci a senha</ThemedText>}
        </TouchableOpacity>

        {!!errMsg && (
          <ThemedText style={{ color: isDark ? '#fca5a5' : '#b91c1c', marginTop: 8 }}>
            {errMsg}
          </ThemedText>
        )}

        <View style={{ marginTop: 16 }}>
          <Link href="/(auth)/register">
            <ThemedText>Não tem conta? Criar conta</ThemedText>
          </Link>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
