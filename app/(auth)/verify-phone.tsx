// app/(auth)/verify-phone.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { auth, db, firebaseConfig } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import Constants from 'expo-constants';
import { useThemeColors } from '@/utils';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Spacing } from '@/constants/spacing';
import { usePhoneVerification } from '@/hooks/features/auth';
import { formatPhone, phoneSchema } from '@/utils';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LiquidGlassView } from '@/components/liquid-glass';
import { BorderRadius } from '@/constants/spacing';

export default function VerifyPhoneScreen() {
  const user = auth.currentUser;
  const colors = useThemeColors();
  const { 
    state, 
    sendVerification, 
    confirmVerification, 
    recaptchaRef,
    clearError,
    reset,
  } = usePhoneVerification();

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // Load user's phone from Firestore if available
  useEffect(() => {
    async function loadUserPhone() {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.phone && !data.phoneVerified) {
            // Convert E.164 back to Brazilian format for display
            const e164Phone = data.phone;
            const withoutCountry = e164Phone.replace(/^\+55/, '');
            if (withoutCountry.length === 10 || withoutCountry.length === 11) {
              setPhone(formatPhone(withoutCountry));
              setUserPhone(data.phone);
            }
          }
        }
      } catch (error) {
        console.error('Error loading user phone:', error);
      }
    }

    loadUserPhone();
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user]);

  const handleSendVerification = async () => {
    if (!phone.trim()) {
      Alert.alert('Telefone obrigatório', 'Digite seu número de telefone');
      return;
    }

    // Validate phone format
    const validation = phoneSchema.safeParse(phone);
    if (!validation.success) {
      const error = validation.error.errors[0];
      Alert.alert('Telefone inválido', error?.message ?? 'Verifique o formato do telefone');
      return;
    }

    clearError();
    await sendVerification(phone);
  };

  const handleConfirmVerification = async () => {
    if (!code.trim()) {
      Alert.alert('Código obrigatório', 'Digite o código recebido por SMS');
      return;
    }

    if (code.length < 4) {
      Alert.alert('Código inválido', 'O código deve ter pelo menos 4 dígitos');
      return;
    }

    clearError();
    await confirmVerification(code, phone);
  };

  if (!user) {
    return null;
  }

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: colors.bg.secondary }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, padding: Spacing.sm, justifyContent: 'center' }}>
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaRef}
          firebaseConfig={
            Platform.OS === 'web' 
              ? firebaseConfig
              : (Constants?.expoConfig?.extra?.firebase || firebaseConfig)
          }
          attemptInvisibleVerification={Platform.OS === 'web'}
        />

        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
        >
          <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.xl} style={{ padding: Spacing.md }}>
            <View
              accessibilityRole="form"
              accessibilityLabel="Formulário de verificação de telefone"
            >
              <ThemedText 
                type="large-title" 
                style={{ marginBottom: Spacing.md, textAlign: 'center' }}
                accessibilityRole="header"
              >
                Verificar telefone
              </ThemedText>

              <ThemedText 
                type="body" 
                style={{ marginBottom: Spacing.lg, textAlign: 'center', color: colors.text.secondary }}
              >
                Para sua segurança, precisamos verificar seu número de telefone. 
                Você receberá um código por SMS.
              </ThemedText>

              <View style={{ gap: Spacing.sm, marginBottom: Spacing.md }}>
                <Input
                  label="Telefone"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChangeText={(value) => setPhone(formatPhone(value))}
                  keyboardType="phone-pad"
                  maxLength={15}
                  editable={!state.verificationId}
                  error={state.error && !state.verificationId ? state.error : undefined}
                  helperText={!state.verificationId ? "Inclua DDD. Exemplo: (11) 98765-4321" : undefined}
                  leftElement={<Ionicons name="call" size={20} color={colors.icon.default} />}
                  zodSchema={phoneSchema}
                  validateOnBlur={true}
                />

                {!state.verificationId && (
                  <Button
                    variant="primary"
                    onPress={handleSendVerification}
                    disabled={state.sending || !phone.trim()}
                    loading={state.sending}
                    fullWidth
                  >
                    Enviar código por SMS
                  </Button>
                )}

                {state.verificationId && (
                  <>
                    <ThemedText 
                      type="body" 
                      style={{ 
                        marginTop: Spacing.sm, 
                        marginBottom: Spacing.xs,
                        color: colors.text.secondary,
                        textAlign: 'center',
                      }}
                    >
                      Código enviado para {phone}
                    </ThemedText>

                    <Input
                      label="Código de verificação"
                      placeholder="000000"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      error={state.error && state.verificationId ? state.error : undefined}
                      helperText="Digite o código de 6 dígitos recebido por SMS"
                      leftElement={<Ionicons name="keypad" size={20} color={colors.icon.default} />}
                      autoFocus
                    />

                    <Button
                      variant="primary"
                      onPress={handleConfirmVerification}
                      disabled={state.confirming || code.length < 4}
                      loading={state.confirming}
                      fullWidth
                    >
                      Verificar código
                    </Button>

                    <Button
                      variant="ghost"
                      onPress={() => {
                        setCode('');
                        reset();
                        clearError();
                      }}
                      disabled={state.sending || state.confirming}
                      fullWidth
                    >
                      Solicitar novo código
                    </Button>
                  </>
                )}
              </View>

              <Button
                variant="ghost"
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace('/(tabs)');
                  }
                }}
                disabled={state.loading}
                fullWidth
              >
                Verificar depois
              </Button>
            </View>
          </LiquidGlassView>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}