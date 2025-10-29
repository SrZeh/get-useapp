// app/(auth)/login.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useThemeColors } from '@/utils/theme';
import { emailSchema } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { useFormKeyboardNavigation } from '@/utils/keyboardNavigation';
import { useLogin, useResetPassword } from '@/hooks';
import type { LoginInput, ResetPasswordInput } from '@/services/auth';
import { Spacing, BorderRadius } from '@/constants/spacing';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const colors = useThemeColors();
  const { login, loading: loadingLogin, errors: loginErrors, generalError } = useLogin();
  const { reset: resetPassword, loading: loadingReset } = useResetPassword();

  // Keyboard navigation for web
  useFormKeyboardNavigation({
    onSubmit: handleLogin,
    enabled: !loadingLogin,
  });

  const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://upperreggae.web.app';
  const actionCodeSettings = {
    url: `${SITE_URL}/login?reset=1`,
    handleCodeInApp: false,
  };

  const handleLogin = async () => {
    if (loadingLogin) return;

    const input: LoginInput = {
      email: email.trim(),
      password,
    };

    await login(input);
  };

  const handleForgot = async () => {
    if (loadingReset) return;
    
    const input: ResetPasswordInput = {
      email: email.trim(),
      actionCodeSettings,
    };

    await resetPassword(input);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg.secondary }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: 'center' }}>
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md }}>
          <View
            accessibilityRole="form"
            accessibilityLabel="Formulário de login"
          >
            <ThemedText 
              type="large-title" 
              style={{ marginBottom: Spacing.lg, textAlign: 'center' }}
              accessibilityRole="header"
            >
              Entrar
            </ThemedText>

            <View 
              style={{ gap: Spacing.sm, marginBottom: Spacing.md }}
              accessibilityRole="group"
              accessibilityLabel="Credenciais de acesso"
            >
            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              error={loginErrors.email}
              helperText={!loginErrors.email ? "Digite o e-mail da sua conta" : undefined}
              zodSchema={emailSchema}
              validateOnBlur={true}
              leftElement={<Ionicons name="mail" size={20} color={colors.icon.default} />}
            />

            <Input
              label="Senha"
              placeholder="Digite sua senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={loginErrors.password}
              helperText="Mínimo 6 caracteres"
              leftElement={<Ionicons name="lock-closed" size={20} color={colors.icon.default} />}
            />
          </View>
        </View>

          <Button
            variant="primary"
            onPress={handleLogin}
            disabled={loadingLogin}
            loading={loadingLogin}
            fullWidth
            style={{ marginBottom: Spacing.xs }}
          >
            Entrar
          </Button>

          <Button
            variant="ghost"
            onPress={handleForgot}
            disabled={loadingReset}
            loading={loadingReset}
            fullWidth
          >
            Esqueci a senha
          </Button>

          {!!generalError && (
            <ThemedText 
              type="callout" 
              style={{ color: colors.semantic.error, marginTop: Spacing.sm, textAlign: 'center' }}
            >
              {generalError}
            </ThemedText>
          )}

          <View style={{ marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default }}>
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
