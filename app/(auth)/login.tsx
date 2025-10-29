// app/(auth)/login.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { sendPasswordResetEmail, signInWithEmailAndPassword, type ActionCodeSettings } from 'firebase/auth';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useThemeColors } from '@/utils/theme';
import { HapticFeedback, logger } from '@/utils';
import { extractErrorCode, getErrorMessage } from '@/constants/errors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busyLogin, setBusyLogin] = useState(false);
  const [busyReset, setBusyReset] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const colors = useThemeColors();

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
      borderRadius: 16,
      padding: 16,
      fontSize: 17, // iOS body size
      color: colors.text.primary,
      borderColor: colors.border.default,
      backgroundColor: colors.input.bg,
    }),
    [colors]
  );
  const placeholderColor = colors.input.placeholder;

  const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://upperreggae.web.app';
  const actionCodeSettings: ActionCodeSettings = {
    url: `${SITE_URL}/login?reset=1`,
    handleCodeInApp: false,
  };

  const onLogin = async () => {
    if (busyLogin) return;
    setErrMsg(null);
    setBusyLogin(true);
    HapticFeedback.medium();
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      HapticFeedback.success();
      router.replace('/(tabs)');
    } catch (e: unknown) {
      HapticFeedback.error();
      
      const code = extractErrorCode(e);
      const msg = getErrorMessage(code);
      
      logger.error('Login failed', e, { code, email: email.trim() });
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
    } catch (e: unknown) {
      const error = e as { code?: string; message?: string };
      logger.error('Password reset failed', e, { code: error?.code, message: error?.message, email: mail });
      const code = error?.code ?? '';
      if (
        code === 'auth/unauthorized-continue-uri' ||
        code === 'auth/invalid-continue-uri' ||
        code === 'auth/missing-continue-uri'
      ) {
        // Fallback sem settings (página padrão Firebase)
        try {
          await sendPasswordResetEmail(auth, mail);
          notify('Verifique seu e-mail', 'Enviamos um link de redefinição. Veja também a caixa de spam.');
        } catch (e2: unknown) {
          const error2 = e2 as { message?: string };
          const msg = error2?.message ?? 'Tente novamente mais tarde.';
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
      style={{ flex: 1, backgroundColor: colors.bg.secondary }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24 }}>
          <ThemedText type="large-title" style={{ marginBottom: 32, textAlign: 'center' }}>
            Entrar
          </ThemedText>

          <View style={{ gap: 16, marginBottom: 24 }}>
            <LiquidGlassView intensity="subtle" cornerRadius={16}>
              <TextInput
                placeholder="E-mail"
                placeholderTextColor={placeholderColor}
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={setEmail}
                value={email}
                style={[inputStyle, { backgroundColor: 'transparent' }]}
              />
            </LiquidGlassView>
            <LiquidGlassView intensity="subtle" cornerRadius={16}>
              <TextInput
                placeholder="Senha"
                placeholderTextColor={placeholderColor}
                secureTextEntry
                onChangeText={setPassword}
                value={password}
                style={[inputStyle, { backgroundColor: 'transparent' }]}
              />
            </LiquidGlassView>
          </View>

          <Button
            variant="primary"
            onPress={onLogin}
            disabled={busyLogin}
            loading={busyLogin}
            fullWidth
            style={{ marginBottom: 12 }}
          >
            Entrar
          </Button>

          <Button
            variant="ghost"
            onPress={onForgot}
            disabled={busyReset}
            loading={busyReset}
            fullWidth
          >
            Esqueci a senha
          </Button>

          {!!errMsg && (
            <ThemedText 
              type="callout" 
              style={{ color: colors.semantic.error, marginTop: 16, textAlign: 'center' }}
            >
              {errMsg}
            </ThemedText>
          )}

          <View style={{ marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border.default }}>
            <Link href="/(auth)/register" asChild>
              <TouchableOpacity>
                <ThemedText type="body" style={{ textAlign: 'center', color: colors.icon.selected }}>
                  Não tem conta? <ThemedText type="headline" style={{ color: colors.icon.selected }}>Criar conta</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </LiquidGlassView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
