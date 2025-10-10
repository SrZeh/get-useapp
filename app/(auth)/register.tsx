// app/(auth)/register.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, useColorScheme, View, ActivityIndicator } from 'react-native';

const STRICT_CPF = true; // para testar rápido, mude para false

function validarCPF(cpfRaw: string) {
  const cpf = cpfRaw.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0; for (let i=0;i<9;i++) soma += parseInt(cpf[i])*(10-i);
  let d1 = 11 - (soma % 11); if (d1 >= 10) d1 = 0; if (d1 !== parseInt(cpf[9])) return false;
  soma = 0; for (let i=0;i<10;i++) soma += parseInt(cpf[i])*(11-i);
  let d2 = 11 - (soma % 11); if (d2 >= 10) d2 = 0; return d2 === parseInt(cpf[10]);
}

function mapAuthError(e: any): string {
  const code = e?.code ?? '';
  if (code === 'auth/email-already-in-use') return 'E-mail já está em uso.';
  if (code === 'auth/invalid-email') return 'E-mail inválido.';
  if (code === 'auth/weak-password') return 'Senha muito fraca (mín. 6 caracteres).';
  if (code === 'auth/network-request-failed') return 'Falha de rede. Verifique sua conexão.';
  if (code === 'auth/invalid-api-key') return 'Chave de API inválida. Confira as variáveis EXPO_PUBLIC_FIREBASE_*';
  if (code === 'auth/configuration-not-found') return 'Configuração do Firebase ausente. Confira lib/firebase.ts';
  return e?.message ?? 'Não foi possível criar a conta. Tente novamente.';
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const isDark = useColorScheme() === 'dark';

  const inputStyle = useMemo(() => ({
    borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16,
    color: isDark ? '#fff' : '#111827',
    borderColor: isDark ? '#374151' : '#d1d5db',
    backgroundColor: isDark ? '#111827' : '#fff',
  }), [isDark]);
  const placeholderColor = isDark ? '#9aa0a6' : '#6b7280';

  const onRegister = async () => {
    if (busy) return;
    console.log('[REGISTER] click');
    setBusy(true);
    try {
      // validações
      if (!name.trim()) { Alert.alert('Nome obrigatório'); return; }
      if (STRICT_CPF && !validarCPF(cpf)) { Alert.alert('CPF inválido'); return; }
      if (!email.trim()) { Alert.alert('E-mail obrigatório'); return; }
      if ((password ?? '').length < 6) { Alert.alert('Senha deve ter pelo menos 6 caracteres'); return; }

      console.log('[REGISTER] creating user in Auth…');
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // displayName (útil p/ cabeçalho, avaliações etc.)
      try {
        await updateProfile(cred.user, { displayName: name.trim() });
      } catch (err) {
        console.warn('[REGISTER] updateProfile failed:', err);
      }

      console.log('[REGISTER] sending email verification…');
      try {
        await sendEmailVerification(cred.user);
      } catch (err) {
        console.warn('[REGISTER] sendEmailVerification failed:', err);
      }

      console.log('[REGISTER] writing Firestore profile…');
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
      }, { merge: true });

      console.log('[REGISTER] done → navigating');
      Alert.alert('Conta criada!', 'Enviamos um e-mail de verificação. Confirme para continuar.');
      router.replace('/(auth)/verify-email');
    } catch (e: any) {
      console.error('[REGISTER] error:', e);
      Alert.alert('Erro ao registrar', mapAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 80, android: 0 })}
    >
      <ThemedView style={{ flex: 1, padding: 16, justifyContent: 'center' }}>
        <ThemedText type="title">Criar conta</ThemedText>

        <View style={{ gap: 12, marginTop: 16 }}>
          <TextInput placeholder="Nome completo" placeholderTextColor={placeholderColor} onChangeText={setName} value={name} style={inputStyle} />
          <TextInput placeholder="CPF" placeholderTextColor={placeholderColor} keyboardType="number-pad" onChangeText={setCpf} value={cpf} style={inputStyle} />
          <TextInput placeholder="Telefone" placeholderTextColor={placeholderColor} keyboardType="phone-pad" onChangeText={setPhone} value={phone} style={inputStyle} />
          <TextInput placeholder="Endereço" placeholderTextColor={placeholderColor} onChangeText={setAddress} value={address} style={inputStyle} />
          <TextInput placeholder="E-mail" placeholderTextColor={placeholderColor} autoCapitalize="none" keyboardType="email-address" onChangeText={setEmail} value={email} style={inputStyle} />
          <TextInput placeholder="Senha" placeholderTextColor={placeholderColor} secureTextEntry onChangeText={setPassword} value={password} style={inputStyle} />
        </View>

        <TouchableOpacity
          style={{ marginTop: 16, backgroundColor: '#08af0e', paddingVertical: 14, borderRadius: 12, alignItems: 'center', opacity: busy ? 0.7 : 1 }}
          onPress={onRegister}
          disabled={busy}
        >
          {busy ? <ActivityIndicator color="#fff" /> : <ThemedText type="defaultSemiBold" style={{ color: '#fff' }}>Criar conta</ThemedText>}
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          <Link href="/(auth)/login"><ThemedText>Já tenho conta</ThemedText></Link>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
