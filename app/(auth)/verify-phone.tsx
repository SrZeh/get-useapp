// app/(auth)/verify-phone.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import React, { useRef, useState } from 'react';
import { Alert, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, linkWithCredential } from 'firebase/auth';
import Constants from 'expo-constants';
import { useThemeColors } from '@/utils';
import { Button } from '@/components/Button';
import { Spacing } from '@/constants/spacing';

export default function VerifyPhoneScreen() {
  const user = auth.currentUser;
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);
  const colors = useThemeColors();

  const [phone, setPhone] = useState('');   // ex: +55DDDNNNNNNNN
  const [code, setCode] = useState('');
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    if (!user) return;
    try {
      setBusy(true);
      const provider = new PhoneAuthProvider(auth);
      // O ref do modal funciona como AppVerifier
      const vId = await provider.verifyPhoneNumber(phone, recaptchaRef.current!);
      setVerificationId(vId);
      Alert.alert('SMS enviado', 'Digite o código recebido.');
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert('Erro', error?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    if (!user || !verificationId) return;
    try {
      setBusy(true);
      const cred = PhoneAuthProvider.credential(verificationId, code);
      await linkWithCredential(user, cred); // vincula ao usuário já logado

      await updateDoc(doc(db, 'users', user.uid), {
        phoneVerified: true,
        phone,
        updatedAt: new Date(),
      });

      Alert.alert('Telefone verificado!', 'Obrigado.');
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert('Erro', error?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={{ flex:1, padding:Spacing.sm, gap:Spacing.xs }}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        // Passe sua config do Firebase (veja Passo 4)
        firebaseConfig={Constants?.expoConfig?.extra?.firebase || auth.app.options}
      />

      <ThemedText type="title">Verificar telefone</ThemedText>

      <View style={{ gap:10 }}>
        <TextInput
          placeholder="+55DDDNNNNNNNN"
          placeholderTextColor={colors.input.placeholder}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={{ 
            borderWidth: 1, 
            borderRadius: 10, 
            padding: 12,
            backgroundColor: colors.input.bg,
            borderColor: colors.border.default,
            color: colors.text.primary,
          }}
        />

        <Button
          variant="primary"
          onPress={send}
          disabled={busy || !phone}
          loading={busy}
          fullWidth
        >
          Enviar SMS
        </Button>

        {verificationId && (
          <>
            <TextInput
              placeholder="Código do SMS"
              placeholderTextColor={colors.input.placeholder}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              style={{ 
                borderWidth: 1, 
                borderRadius: 10, 
                padding: 12,
                backgroundColor: colors.input.bg,
                borderColor: colors.border.default,
                color: colors.text.primary,
              }}
            />
            <Button
              variant="primary"
              onPress={confirm}
              disabled={busy || code.length < 4}
              loading={busy}
              fullWidth
            >
              Confirmar código
            </Button>
          </>
        )}
      </View>
    </ThemedView>
  );
}
