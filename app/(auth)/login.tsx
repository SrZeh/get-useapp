// app/(auth)/login.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View, Dimensions, StyleSheet, Pressable } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useThemeColors, HapticFeedback } from '@/utils';
import { emailSchema } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { useFormKeyboardNavigation } from '@/utils/keyboardNavigation';
import { useLogin, useResetPassword } from '@/hooks';
import type { LoginInput, ResetPasswordInput } from '@/services/auth';
import { Spacing, BorderRadius } from '@/constants/spacing';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const colors = useThemeColors();
  const { login, loading: loadingLogin, errors: loginErrors, generalError } = useLogin();
  const { reset: resetPassword, loading: loadingReset } = useResetPassword();

  // Entrance animations
  const cardOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const cardTranslateY = useSharedValue(20);
  const titleOpacity = useSharedValue(0);
  const formOpacity = useSharedValue(0);
  const errorOpacity = useSharedValue(0);

  // Calculate responsive max width
  const { width } = Dimensions.get('window');
  const maxWidth = Math.min(width - Spacing.md * 2, 440); // Max 440px for better UX on tablets

  const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://upperreggae.web.app';
  const actionCodeSettings = {
    url: `${SITE_URL}/login?reset=1`,
    handleCodeInApp: false,
  };

  // Entrance animation on mount
  useEffect(() => {
    // Card animation
    cardOpacity.value = withDelay(50, withTiming(1, { duration: 300 }));
    cardScale.value = withDelay(50, withSpring(1, { damping: 20, stiffness: 300 }));
    cardTranslateY.value = withDelay(50, withSpring(0, { damping: 20, stiffness: 300 }));
    
    // Title animation
    titleOpacity.value = withDelay(150, withTiming(1, { duration: 250 }));
    
    // Form animation
    formOpacity.value = withDelay(250, withTiming(1, { duration: 300 }));
  }, []);

  // Error animation
  useEffect(() => {
    if (generalError) {
      errorOpacity.value = withTiming(1, { duration: 200 });
    } else {
      errorOpacity.value = withTiming(0, { duration: 150 });
    }
  }, [generalError]);

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
    HapticFeedback.light();
    
    const input: ResetPasswordInput = {
      email: email.trim(),
      actionCodeSettings,
    };

    await resetPassword(input);
  };

  const togglePasswordVisibility = () => {
    HapticFeedback.selection();
    setShowPassword(!showPassword);
  };

  // Keyboard navigation for web - must be called after handleLogin is defined
  useFormKeyboardNavigation({
    onSubmit: handleLogin,
    enabled: !loadingLogin,
  });

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value },
    ],
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const errorAnimatedStyle = useAnimatedStyle(() => ({
    opacity: errorOpacity.value,
  }));

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg.secondary }]}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={[styles.content, { padding: Spacing.sm }]}>
        <AnimatedView
          style={[
            { maxWidth, width: '100%', alignSelf: 'center' },
            cardAnimatedStyle,
          ]}
          entering={FadeInDown.duration(300).springify()}
        >
          <LiquidGlassView 
            intensity="standard" 
            cornerRadius={BorderRadius.xl} 
            style={styles.card}
          >
            <View
              accessibilityLabel="Formulário de login"
            >
              {/* Header Section */}
              <AnimatedView style={titleAnimatedStyle}>
                <ThemedText 
                  type="large-title" 
                  style={styles.title}
                  accessibilityRole="header"
                >
                  Bem-vindo de volta
                </ThemedText>
                <ThemedText 
                  type="body" 
                  style={[styles.subtitle, { color: colors.text.tertiary }]}
                >
                  Entre com sua conta para continuar
                </ThemedText>
              </AnimatedView>

              {/* Form Section */}
              <AnimatedView 
                style={[formAnimatedStyle, styles.formContainer]}
                entering={FadeInUp.delay(200).duration(300).springify()}
              >
                <View 
                  style={styles.inputsContainer}
                  accessibilityLabel="Credenciais de acesso"
                >
                  <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    error={loginErrors.email}
                    helperText={!loginErrors.email ? "Digite o e-mail da sua conta" : undefined}
                    zodSchema={emailSchema}
                    validateOnBlur={true}
                    leftElement={
                      <Ionicons 
                        name="mail-outline" 
                        size={20} 
                        color={loginErrors.email ? colors.semantic.error : colors.icon.default} 
                      />
                    }
                  />

                  <Input
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    textContentType="password"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                    error={loginErrors.password}
                    helperText={!loginErrors.password ? "Mínimo 6 caracteres" : undefined}
                    leftElement={
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={20} 
                        color={loginErrors.password ? colors.semantic.error : colors.icon.default} 
                      />
                    }
                    rightElement={
                      <TouchableOpacity
                        onPress={togglePasswordVisibility}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        accessibilityRole="button"
                      >
                        <Ionicons 
                          name={showPassword ? "eye-off-outline" : "eye-outline"} 
                          size={20} 
                          color={colors.text.tertiary} 
                        />
                      </TouchableOpacity>
                    }
                  />
                </View>

                {/* Remember Me Checkbox */}
                <Pressable
                  onPress={() => {
                    HapticFeedback.selection();
                    setRememberMe(!rememberMe);
                  }}
                  style={styles.checkboxContainer}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  accessibilityLabel="Lembrar-me"
                  accessibilityHint="Mantém você conectado mesmo após fechar o aplicativo"
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: rememberMe ? colors.semantic.info : colors.border.default,
                        backgroundColor: rememberMe ? colors.semantic.info : 'transparent',
                      },
                    ]}
                  >
                    {rememberMe && (
                      <Ionicons 
                        name="checkmark" 
                        size={14} 
                        color="white"
                      />
                    )}
                  </View>
                  <ThemedText 
                    type="body" 
                    style={[styles.checkboxLabel, { color: colors.text.secondary }]}
                  >
                    Lembrar-me
                  </ThemedText>
                </Pressable>

                {/* Error Message */}
                {!!generalError && (
                  <AnimatedView
                    style={[
                      styles.errorContainer,
                      errorAnimatedStyle,
                    ]}
                    entering={FadeInUp.duration(200)}
                  >
                    <View style={[styles.errorBox, { backgroundColor: colors.semantic.error + '15' }]}>
                      <Ionicons 
                        name="alert-circle" 
                        size={18} 
                        color={colors.semantic.error} 
                        style={styles.errorIcon}
                      />
                      <ThemedText 
                        type="caption-1" 
                        style={[styles.errorText, { color: colors.semantic.error }]}
                        numberOfLines={2}
                      >
                        {generalError}
                      </ThemedText>
                    </View>
                  </AnimatedView>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsContainer}>
                  <Button
                    variant="primary"
                    onPress={handleLogin}
                    disabled={loadingLogin || !email.trim() || !password.trim()}
                    loading={loadingLogin}
                    fullWidth
                    style={styles.primaryButton}
                    accessibilityLabel="Fazer login"
                    accessibilityHint="Fazer login com email e senha informados"
                  >
                    Entrar
                  </Button>

                  <Button
                    variant="ghost"
                    onPress={handleForgot}
                    disabled={loadingReset || !email.trim()}
                    loading={loadingReset}
                    fullWidth
                    style={styles.forgotButton}
                    textStyle={{ color: colors.semantic.info } as any}
                    accessibilityLabel="Recuperar senha"
                    accessibilityHint="Enviar email para redefinir senha"
                  >
                    Esqueci a senha
                  </Button>
                </View>
              </AnimatedView>

              {/* Footer Section */}
              <View 
                style={[
                  styles.footer,
                  { borderTopColor: colors.border.default }
                ]}
              >
                <Link href="/(auth)/register" asChild>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    accessibilityLabel="Criar nova conta"
                    accessibilityRole="button"
                  >
                    <ThemedText 
                      type="body" 
                      style={[styles.footerText, { color: colors.text.secondary }]}
                    >
                      Não tem conta?{' '}
                      <ThemedText 
                        type="headline" 
                        style={[styles.linkText, { color: colors.semantic.info }]}
                      >
                        Criar conta
                      </ThemedText>
                    </ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </LiquidGlassView>
        </AnimatedView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    padding: Spacing.lg,
    width: '100%',
  },
  title: {
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: Spacing.xl,
    fontSize: 15,
    lineHeight: 20,
  },
  formContainer: {
    gap: Spacing.md,
  },
  inputsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  errorContainer: {
    marginBottom: Spacing.xs,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    gap: Spacing['2xs'],
  },
  errorIcon: {
    marginRight: Spacing['2xs'],
  },
  errorText: {
    flex: 1,
    fontWeight: '500',
  },
  actionsContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  primaryButton: {
    marginBottom: 0,
  },
  forgotButton: {
    marginTop: 0,
  },
  footer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 20,
  },
  linkText: {
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
    marginTop: Spacing['2xs'],
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius['2xs'],
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 15,
    lineHeight: 20,
  },
});
