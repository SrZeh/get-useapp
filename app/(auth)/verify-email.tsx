// app/(auth)/verify-email.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { sendEmailVerification } from 'firebase/auth';
import { logger, useThemeColors } from '@/utils';
import { Button } from '@/components/Button';

export default function VerifyEmailScreen() {
  const user = auth.currentUser;
  const [checking, setChecking] = useState(false);
  const colors = useThemeColors();

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
        logger.warn('Failed to update emailVerified', { error: e, uid: fresh.uid });
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
    } catch (e: unknown) {
      const error = e as { message?: string };
      Alert.alert('Erro', error?.message ?? String(e));
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
        <Button
          variant="primary"
          onPress={checkNow}
          loading={checking}
          fullWidth
        >
          {checking ? 'Verificando…' : 'Já confirmei, atualizar'}
        </Button>
        <Button
          variant="ghost"
          onPress={resendEmail}
          fullWidth
        >
          Reenviar e-mail
        </Button>
        <Link href="/(auth)/login" asChild>
          <TouchableOpacity>
            <ThemedText style={{ textAlign: 'center', color: colors.brand.primary }}>
              Trocar de conta
            </ThemedText>
          </TouchableOpacity>
        </Link>
      </View>
    </ThemedView>
  );
}
