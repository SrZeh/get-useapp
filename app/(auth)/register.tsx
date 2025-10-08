// app/(auth)/register.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

function validarCPF(cpfRaw: string) {
  const cpf = cpfRaw.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0; for (let i=0;i<9;i++) soma += parseInt(cpf[i])*(10-i);
  let d1 = (soma*10)%11; if (d1===10) d1=0; if (d1!==parseInt(cpf[9])) return false;
  soma = 0; for (let i=0;i<10;i++) soma += parseInt(cpf[i])*(11-i);
  let d2 = (soma*10)%11; if (d2===10) d2=0; return d2===parseInt(cpf[10]);
}

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
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

  const onRegister = async () => {
    try {
      // validações rápidas
      if (!name.trim()) return Alert.alert('Nome obrigatório');
      if (!validarCPF(cpf)) return Alert.alert('CPF inválido');
      if (!email.trim()) return Alert.alert('E-mail obrigatório');
      if ((password ?? '').length < 6) return Alert.alert('Senha deve ter pelo menos 6 caracteres');

      // 1) cria usuário (agora você está autenticado)
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2) dispara e-mail de verificação
      try {
        await sendEmailVerification(cred.user);
      } catch (err) {
        console.warn('Falha ao enviar e-mail de verificação:', err);
      }

      // 3) grava o perfil no /users/{uid}
      const cpfNum = cpf.replace(/\D/g, '');
      await setDoc(doc(db, 'users', cred.user.uid), {
        name: name.trim(),
        cpf: cpfNum,
        phone: phone.trim(),
        address: address.trim(),
        email: email.trim(),
        photoURL: null,
        role: 'free',
        // flags de verificação
        emailVerified: false,
        phoneVerified: false,
        // reputação/limites
        ratingAvg: 5, ratingCount: 0,
        strikes: 0, blockedAt: null,
        publicItemsCount: 0,
        dailyLoanCount: 0, dailyLoanDate: null,
        points: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }, { merge: true });

      Alert.alert('Conta criada!', 'Enviamos um e-mail de verificação. Confirme para continuar.');
      router.replace('/(auth)/verify-email');
    } catch (e: any) {
      Alert.alert('Erro ao registrar', e?.message ?? String(e));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
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

        <TouchableOpacity style={{
          marginTop: 16, backgroundColor: isDark ? "#08af0e" : "#08af0e",
          paddingVertical: 14, borderRadius: 12, alignItems: "center"
        }} onPress={onRegister}>
          <ThemedText type="defaultSemiBold" style={{ color: "#fff" }}>Criar conta</ThemedText>
        </TouchableOpacity>

        <View style={{ marginTop: 16 }}>
          <Link href="/(auth)/login"><ThemedText>Já tenho conta</ThemedText></Link>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}
