// app/(auth)/verify-email.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { sendEmailVerification } from 'firebase/auth';

export default function VerifyEmailScreen() {
  const user = auth.currentUser;
  const [checking, setChecking] = useState(false);

  // ✅ checa se já confirmou o e-mail e força refresh do ID token
  const checkNow = async () => {
    if (!user) return;
    setChecking(true);
    await user.reload();
    const fresh = auth.currentUser;
    if (fresh?.emailVerified) {
      try {
        // força um novo token com email_verified=true
        await fresh.getIdToken(true);
        await updateDoc(doc(db, 'users', fresh.uid), {
          emailVerified: true,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.warn('update emailVerified falhou:', e);
      }
      Alert.alert('E-mail verificado!', 'Obrigado.');
      router.replace('/(tabs)');
    } else {
      Alert.alert('Ainda não verificado', 'Confira sua caixa de entrada e spam.');
    }
    setChecking(false);
  };

  // ✅ reenvia o e-mail
  const resendEmail = async () => {
    const u = auth.currentUser;
    if (!u) return;
    try {
      await sendEmailVerification(u);
      Alert.alert('Enviado!', 'Reenviamos o e-mail de verificação.');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? String(e));
    }
  };

  useEffect(() => {
    if (!user) router.replace('/(auth)/login');
  }, [user]);

  return (
    <ThemedView style={{ flex:1, padding:16, gap:12, justifyContent:'center' }}>
      <ThemedText type="title">Verificar e-mail</ThemedText>
      <ThemedText>Enviamos um link de verificação para seu e-mail.</ThemedText>

      <View style={{ gap:10, marginTop: 8 }}>
        <TouchableOpacity onPress={checkNow} style={{ backgroundColor:'#00ce08', padding:12, borderRadius:10 }}>
          <ThemedText style={{ color:'#fff' }}>{checking ? 'Verificando…' : 'Já confirmei, atualizar'}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity onPress={resendEmail} style={{ padding:12 }}>
          <ThemedText>Reenviar e-mail</ThemedText>
        </TouchableOpacity>
        <Link href="/(auth)/login"><ThemedText>Trocar de conta</ThemedText></Link>
      </View>
    </ThemedView>
  );
}
