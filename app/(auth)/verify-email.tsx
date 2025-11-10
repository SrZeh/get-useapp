// app/(auth)/verify-email.tsx
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { auth, db } from '@/lib/firebase';
import { Link, router } from 'expo-router';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { sendEmailVerification } from 'firebase/auth';
import { logger, useThemeColors } from '@/utils';
import { Button } from '@/components/Button';
import { Spacing } from '@/constants/spacing';

export default function VerifyEmailScreen() {
  const user = auth.currentUser;
  const [checking, setChecking] = useState(false);
  const [hasPhone, setHasPhone] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const colors = useThemeColors();

  // Check if user has phone number
  useEffect(() => {
    async function checkPhone() {
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setHasPhone(!!data.phone);
          setPhoneVerified(!!data.phoneVerified);
        }
      } catch (error) {
        logger.error('Error checking phone', error);
      }
    }

    checkPhone();
  }, [user]);

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
      router.replace('/');
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
    <ThemedView style={{ flex:1, padding:Spacing.sm, gap:Spacing.xs, justifyContent:'center' }}>
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
        
        {hasPhone && !phoneVerified && (
          <View style={{ marginTop: Spacing.xs, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.default }}>
            <ThemedText 
              type="body" 
              style={{ marginBottom: Spacing.sm, textAlign: 'center', color: colors.text.secondary }}
            >
              Para maior segurança, verifique também seu telefone
            </ThemedText>
            <Button 
              variant="outline" 
              fullWidth
              onPress={() => router.push('/(auth)/verify-phone')}
            >
              Verificar telefone
            </Button>
          </View>
        )}
        
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
