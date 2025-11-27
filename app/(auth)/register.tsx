// app/(auth)/register.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React, { useState, useCallback } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useThemeColors } from '@/utils/theme';
import { formatPhone, phoneSchema, emailSchema, passwordSchema, cpfSchema } from '@/utils';
import { AddressInput } from '@/components/forms';
import { Ionicons } from '@expo/vector-icons';
import { useFormKeyboardNavigation } from '@/utils/keyboardNavigation';
import { useRegister } from '@/hooks';
import type { RegistrationInput } from '@/services/auth';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useResponsive } from '@/hooks/useResponsive';
import Animated, { FadeInDown } from 'react-native-reanimated';

const STRICT_CPF = true; // para testar rápido, mude para false

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  
  // Structured address fields
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const colors = useThemeColors();
  const { register, loading, errors, clearErrors } = useRegister();
  const { isMobile } = useResponsive();
  const insets = useSafeAreaInsets();
  
  // Max width for desktop
  const maxWidth = isMobile ? '100%' : 480;

  // Define handleRegister before using it in useFormKeyboardNavigation
  const handleRegister = useCallback(async () => {
    if (loading) return;
    
    clearErrors();
    
    const input: RegistrationInput = {
      name: name.trim(),
      email: email.trim(),
      password,
      cpf: cpf.trim() || undefined,
      phone: phone.trim() || undefined,
      address: (cep.trim() || street.trim() || city.trim()) ? {
        cep: cep.trim() || undefined,
        street: street.trim() || undefined,
        number: number.trim() || undefined,
        complement: complement.trim() || undefined,
        neighborhood: neighborhood.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim().toUpperCase() || undefined,
      } : undefined,
    };

    await register(input, { strictCPF: STRICT_CPF });
  }, [name, email, password, cpf, phone, cep, street, number, complement, neighborhood, city, state, loading, clearErrors, register]);

  // Keyboard navigation for web
  useFormKeyboardNavigation({
    onSubmit: handleRegister,
    enabled: !loading,
  });

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.bg.secondary }]}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={[styles.content, { backgroundColor: colors.bg.secondary }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top + 80, Spacing.lg), // Account for transparent header
              paddingBottom: Math.max(insets.bottom + Spacing.lg, Spacing.xl),
              paddingHorizontal: Spacing.sm,
            }
          ]}
        >
          <Animated.View
            style={[
              { maxWidth, width: '100%', alignSelf: 'center' },
            ]}
            entering={FadeInDown.duration(300).springify()}
          >
            <LiquidGlassView 
              intensity="standard" 
              cornerRadius={BorderRadius.xl} 
              style={styles.card}
            >
              <View
                accessibilityRole="form"
                accessibilityLabel="Formulário de registro"
              >
                {/* Header Section */}
                <Animated.View entering={FadeInDown.duration(300).delay(50)}>
                  <ThemedText 
                    type="large-title" 
                    style={styles.title}
                    accessibilityRole="header"
                  >
                    Criar conta
                  </ThemedText>
                  <ThemedText 
                    type="body" 
                    style={[styles.subtitle, { color: colors.text.tertiary }]}
                  >
                    Preencha seus dados para começar
                  </ThemedText>
                </Animated.View>

                {/* Form Section */}
                <Animated.View 
                  entering={FadeInDown.duration(300).delay(100)}
                  style={styles.formContainer}
                >
                  <View 
                    style={styles.inputsContainer}
                    accessibilityRole="group"
                    accessibilityLabel="Informações pessoais"
                  >
                    <Input
                      label="Nome completo"
                      placeholder="Digite seu nome completo"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      error={errors.name}
                      helperText={!errors.name ? "Como você gostaria de ser chamado" : undefined}
                      leftElement={<Ionicons name="person" size={20} color={colors.icon.default} />}
                    />

                    <Input
                      label="CPF"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChangeText={setCpf}
                      keyboardType="number-pad"
                      error={errors.cpf}
                      helperText={!errors.cpf ? STRICT_CPF ? "Apenas números" : "Opcional" : undefined}
                      zodSchema={STRICT_CPF ? cpfSchema : undefined}
                      validateOnBlur={true}
                      leftElement={<Ionicons name="card" size={20} color={colors.icon.default} />}
                    />

                    <Input
                      label="Telefone"
                      placeholder="(00) 00000-0000"
                      value={phone}
                      onChangeText={(value) => setPhone(formatPhone(value))}
                      keyboardType="phone-pad"
                      maxLength={15}
                      error={errors.phone}
                      helperText={!errors.phone ? (!phone.trim() ? "Inclua DDD. Exemplo: (11) 98765-4321" : undefined) : undefined}
                      zodSchema={phoneSchema}
                      validateOnBlur={true}
                      leftElement={<Ionicons name="call" size={20} color={colors.icon.default} />}
                    />
                  </View>

                  {/* Address Input with ViaCEP */}
                  <View 
                    style={{ marginTop: Spacing['2xs'] }}
                    accessibilityRole="group"
                    accessibilityLabel="Endereço"
                  >
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

                  <View
                    style={{ gap: Spacing.sm }}
                    accessibilityRole="group"
                    accessibilityLabel="Credenciais"
                  >
                    <Input
                      label="E-mail"
                      placeholder="seu@email.com"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      error={errors.email}
                      helperText={!errors.email ? "Usado para login e recuperação de senha" : undefined}
                      zodSchema={emailSchema}
                      validateOnBlur={true}
                      leftElement={<Ionicons name="mail" size={20} color={colors.icon.default} />}
                    />

                    <Input
                      label="Senha"
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      error={errors.password}
                      helperText={!errors.password ? "Use pelo menos 6 caracteres" : undefined}
                      zodSchema={passwordSchema}
                      validateOnBlur={true}
                      leftElement={<Ionicons name="lock-closed" size={20} color={colors.icon.default} />}
                    />
                  </View>

                  {/* Actions Section */}
                  <View style={styles.actionsContainer}>
                    <Button
                      variant="primary"
                      onPress={handleRegister}
                      disabled={loading}
                      loading={loading}
                      fullWidth
                      style={styles.primaryButton}
                    >
                      Criar conta
                    </Button>
                  </View>
                </Animated.View>

                {/* Footer Section */}
                <View 
                  style={[
                    styles.footer,
                    { borderTopColor: colors.border.default }
                  ]}
                >
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      accessibilityLabel="Fazer login"
                      accessibilityRole="button"
                    >
                      <ThemedText 
                        type="body" 
                        style={[styles.footerText, { color: colors.text.secondary }]}
                      >
                        Já tem conta?{' '}
                        <ThemedText 
                          type="headline" 
                          style={[styles.linkText, { color: colors.semantic.info }]}
                        >
                          Entrar
                        </ThemedText>
                      </ThemedText>
                    </TouchableOpacity>
                  </Link>
                </View>
              </View>
            </LiquidGlassView>
          </Animated.View>
        </ScrollView>
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
  },
  scrollContent: {
    flexGrow: 1,
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
  actionsContainer: {
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  primaryButton: {
    marginBottom: 0,
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
});
