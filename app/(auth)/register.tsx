// app/(auth)/register.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
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

  // Keyboard navigation for web
  useFormKeyboardNavigation({
    onSubmit: handleRegister,
    enabled: !loading,
  });

  const handleRegister = async () => {
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
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg.secondary }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: 'center' }}>
        <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md }}>
          <View
            accessibilityRole="form"
            accessibilityLabel="Formulário de registro"
          >
            <ThemedText 
              type="large-title" 
              style={{ marginBottom: Spacing.lg, textAlign: 'center' }}
              accessibilityRole="header"
            >
              Criar conta
            </ThemedText>

            <View 
              style={{ gap: Spacing.sm, marginBottom: Spacing.md }}
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
          </View>

          <Button
            variant="primary"
            onPress={handleRegister}
            disabled={loading}
            loading={loading}
            fullWidth
            style={{ marginBottom: Spacing.sm }}
          >
            Criar conta
          </Button>

          <View style={{ paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.default }}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText type="body" style={{ textAlign: 'center', color: colors.brand.primary }}>
                  Já tenho conta? <ThemedText type="headline" style={{ color: colors.brand.primary }}>Entrar</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </LiquidGlassView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
