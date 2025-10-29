// app/(auth)/register.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, View } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { HapticFeedback } from '@/utils/haptics';
import { logger } from '@/utils/logger';

const STRICT_CPF = true; // para testar rápido, mude para false

function validarCPF(cpfRaw: string) {
  const cpf = cpfRaw.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0; for (let i=0;i<9;i++) soma += parseInt(cpf[i])*(10-i);
  let d1 = 11 - (soma % 11); if (d1 >= 10) d1 = 0; if (d1 !== parseInt(cpf[9])) return false;
  soma = 0; for (let i=0;i<10;i++) soma += parseInt(cpf[i])*(11-i);
  let d2 = 11 - (soma % 11); if (d2 >= 10) d2 = 0; return d2 === parseInt(cpf[10]);
}

function mapAuthError(e: unknown): string {
  const error = e as { code?: string; message?: string };
  const code = error?.code ?? '';
  if (code === 'auth/email-already-in-use') return 'E-mail já está em uso.';
  if (code === 'auth/invalid-email') return 'E-mail inválido.';
  if (code === 'auth/weak-password') return 'Senha muito fraca (mín. 6 caracteres).';
  if (code === 'auth/network-request-failed') return 'Falha de rede. Verifique sua conexão.';
  if (code === 'auth/invalid-api-key') return 'Chave de API inválida. Confira as variáveis EXPO_PUBLIC_FIREBASE_*';
  if (code === 'auth/configuration-not-found') return 'Configuração do Firebase ausente. Confira lib/firebase.ts';
  return error?.message ?? 'Não foi possível criar a conta. Tente novamente.';
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const palette = Colors[colorScheme];

  const inputStyle = useMemo(() => ({
    borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 17,
    color: palette.text,
    borderColor: palette.border,
    backgroundColor: palette.inputBg,
  }), [palette]);
  const placeholderColor = palette.textTertiary;

  const onRegister = async () => {
    if (busy) return;
    logger.debug('Register button clicked');
    setBusy(true);
    HapticFeedback.medium();
    try {
      // validações
      if (!name.trim()) { Alert.alert('Nome obrigatório'); return; }
      if (STRICT_CPF && !validarCPF(cpf)) { Alert.alert('CPF inválido'); return; }
      if (!email.trim()) { Alert.alert('E-mail obrigatório'); return; }
      if ((password ?? '').length < 6) { Alert.alert('Senha deve ter pelo menos 6 caracteres'); return; }

      logger.debug('Creating user in Auth');
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // displayName (útil p/ cabeçalho, avaliações etc.)
      try {
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch (err) {
        logger.warn('Failed to update profile', { error: err });
      }

      logger.debug('Sending email verification');
      try {
        await sendEmailVerification(cred.user);
      } catch (err) {
        logger.warn('Failed to send email verification', { error: err });
      }

      logger.debug('Writing Firestore profile');
      const cpfNum = cpf.replace(/\D/g, '');
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name: name.trim(),
        cpf: STRICT_CPF ? cpfNum : (cpfNum || null),
        phone: phone.trim() || null,
        address: address.trim() || null,
        email: email.trim(),
        photoURL: cred.user.photoURL ?? null,
        role: 'free',
        emailVerified: cred.user.emailVerified ?? false,
        phoneVerified: false,
        ratingAvg: 5, ratingCount: 0,
        strikes: 0, blockedAt: null,
        publicItemsCount: 0,
        dailyLoanCount: 0, dailyLoanDate: null,
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        onboardingSeenAt: null,
        termsAcceptedAt: null,
      }, { merge: true });

      logger.info('Registration completed successfully', { uid: cred.user.uid });
      HapticFeedback.success();
      Alert.alert('Conta criada!', 'Enviamos um e-mail de verificação. Confirme para continuar.');
      router.replace('/(auth)/verify-email');
    } catch (e: unknown) {
      HapticFeedback.error();
      logger.error('Registration failed', e);
      Alert.alert('Erro ao registrar', mapAuthError(e as { code?: string; message?: string }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: palette.background }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <LiquidGlassView intensity="standard" cornerRadius={24} style={{ padding: 24 }}>
          <ThemedText type="large-title" style={{ marginBottom: 32, textAlign: 'center' }}>
            Criar conta
          </ThemedText>

          <View style={{ gap: 16, marginBottom: 24 }}>
            <LiquidGlassView intensity="subtle" cornerRadius={16}>
              <TextInput 
                placeholder="Nome completo" 
                placeholderTextColor={placeholderColor} 
                onChangeText={setName} 
                value={name} 
                style={[inputStyle, { backgroundColor: 'transparent' }]} 
              />
            </LiquidGlassView>
            <LiquidGlassView intensity="subtle" cornerRadius={16}>
              <TextInput 
                placeholder="CPF" 
                placeholderTextColor={placeholderColor} 
                keyboardType="number-pad" 
                onChangeText={setCpf} 
                value={cpf} 
                style={[inputStyle, { backgroundColor: 'transparent' }]} 
              />
            </LiquidGlassView>
            <LiquidGlassView intensity="subtle" cornerRadius={16}>
              <TextInput 
                placeholder="Telefone" 
                placeholderTextColor={placeholderColor} 
                keyboardType="phone-pad" 
                onChangeText={setPhone} 
                value={phone} 
                style={[inputStyle, { backgroundColor: 'transparent' }]} 
              />
            </LiquidGlassView>
            <LiquidGlassView intensity="subtle" cornerRadius={16}>
              <TextInput 
                placeholder="Endereço" 
                placeholderTextColor={placeholderColor} 
                onChangeText={setAddress} 
                value={address} 
                style={[inputStyle, { backgroundColor: 'transparent' }]} 
              />
            </LiquidGlassView>
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
            onPress={onRegister}
            disabled={busy}
            loading={busy}
            fullWidth
            style={{ marginBottom: 16 }}
          >
            Criar conta
          </Button>

          <View style={{ paddingTop: 16, borderTopWidth: 1, borderTopColor: palette.border }}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <ThemedText type="body" style={{ textAlign: 'center', color: palette.tint }}>
                  Já tenho conta? <ThemedText type="headline" style={{ color: palette.tint }}>Entrar</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </Link>
          </View>
        </LiquidGlassView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
