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

export default function VerifyPhoneScreen() {
  const user = auth.currentUser;
  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);

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
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? String(e));
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
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ThemedView style={{ flex:1, padding:16, gap:12 }}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaRef}
        // Passe sua config do Firebase (veja Passo 4)
        firebaseConfig={Constants?.expoConfig?.extra?.firebase || (auth.app.options as any)}
      />

      <ThemedText type="title">Verificar telefone</ThemedText>

      <View style={{ gap:10 }}>
        <TextInput
          placeholder="+55DDDNNNNNNNN"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={{ borderWidth:1, borderRadius:10, padding:12 }}
        />

        <TouchableOpacity
          onPress={send}
          disabled={busy || !phone}
          style={{ backgroundColor:'#00ce08', padding:12, borderRadius:10, alignItems:'center', opacity:(busy||!phone)?0.6:1 }}
        >
          <ThemedText style={{ color:'#fff' }}>{busy ? 'Enviando…' : 'Enviar SMS'}</ThemedText>
        </TouchableOpacity>

        {verificationId && (
          <>
            <TextInput
              placeholder="Código do SMS"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              style={{ borderWidth:1, borderRadius:10, padding:12 }}
            />
            <TouchableOpacity
              onPress={confirm}
              disabled={busy || code.length < 4}
              style={{ backgroundColor:'#2563eb', padding:12, borderRadius:10, alignItems:'center', opacity:(busy||code.length<4)?0.6:1 }}
            >
              <ThemedText style={{ color:'#fff' }}>{busy ? 'Confirmando…' : 'Confirmar código'}</ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ThemedView>
  );
}
