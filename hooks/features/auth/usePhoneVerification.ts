/**
 * Hook for phone verification using Firebase Phone Authentication
 * Handles SMS verification flow for iOS, Android, and Web
 */

import { useState, useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { 
  sendPhoneVerification, 
  confirmPhoneVerification,
  type PhoneVerificationResult,
  type PhoneConfirmationResult,
} from '@/services/phoneVerification';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { auth } from '@/lib/firebase';
import Constants from 'expo-constants';
import type { ApplicationVerifier } from 'firebase/auth';
import { router } from 'expo-router';
import { logger } from '@/utils';

/**
 * Phone verification hook state
 */
export interface UsePhoneVerificationState {
  loading: boolean;
  sending: boolean;
  confirming: boolean;
  verificationId: string | null;
  error: string | null;
}

/**
 * Phone verification hook return type
 */
export interface UsePhoneVerificationReturn {
  state: UsePhoneVerificationState;
  sendVerification: (phone: string) => Promise<boolean>;
  confirmVerification: (code: string, phone: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
  recaptchaRef: React.RefObject<FirebaseRecaptchaVerifierModal>;
}

/**
 * Hook for managing phone verification flow
 */
export function usePhoneVerification(): UsePhoneVerificationReturn {
  const [state, setState] = useState<UsePhoneVerificationState>({
    loading: false,
    sending: false,
    confirming: false,
    verificationId: null,
    error: null,
  });

  const recaptchaRef = useRef<FirebaseRecaptchaVerifierModal>(null);

  /**
   * Get app verifier for reCAPTCHA
   * Required for web, optional for mobile
   */
  const getAppVerifier = useCallback((): ApplicationVerifier | null => {
    // For web, reCAPTCHA is required
    if (Platform.OS === 'web') {
      if (!recaptchaRef.current) {
        logger.warn('reCAPTCHA ref not available for web');
        return null;
      }
      return recaptchaRef.current;
    }

    // For mobile, reCAPTCHA is optional but recommended
    // If available, use it; otherwise, Firebase will handle it
    return recaptchaRef.current || null;
  }, []);

  /**
   * Send SMS verification code
   */
  const sendVerification = useCallback(async (phone: string): Promise<boolean> => {
    const user = auth.currentUser;
    if (!user) {
      setState((prev) => ({
        ...prev,
        error: 'Usuário não autenticado. Faça login novamente.',
      }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      sending: true,
      loading: true,
      error: null,
    }));

    try {
      const appVerifier = getAppVerifier();
      const result = await sendPhoneVerification(phone, appVerifier);

      if (result.success) {
        setState((prev) => ({
          ...prev,
          sending: false,
          loading: false,
          verificationId: result.verificationId,
          error: null,
        }));
        
        Alert.alert(
          'SMS enviado',
          'Digite o código de verificação recebido por SMS.',
          [{ text: 'OK' }]
        );
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          sending: false,
          loading: false,
          error: result.error,
        }));
        
        Alert.alert('Erro', result.error);
        return false;
      }
    } catch (error) {
      logger.error('Error sending phone verification', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      
      setState((prev) => ({
        ...prev,
        sending: false,
        loading: false,
        error: errorMessage,
      }));
      
      Alert.alert('Erro', errorMessage);
      return false;
    }
  }, [getAppVerifier]);

  /**
   * Confirm verification code
   */
  const confirmVerification = useCallback(async (
    code: string,
    phone: string
  ): Promise<boolean> => {
    if (!state.verificationId) {
      setState((prev) => ({
        ...prev,
        error: 'ID de verificação não encontrado. Solicite um novo código.',
      }));
      return false;
    }

    setState((prev) => ({
      ...prev,
      confirming: true,
      loading: true,
      error: null,
    }));

    try {
      const result = await confirmPhoneVerification(
        state.verificationId,
        code,
        phone
      );

      if (result.success) {
        setState((prev) => ({
          ...prev,
          confirming: false,
          loading: false,
          error: null,
        }));
        
        Alert.alert(
          'Telefone verificado!',
          'Seu número de telefone foi verificado com sucesso.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back or to home
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)');
                }
              },
            },
          ]
        );
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          confirming: false,
          loading: false,
          error: result.error,
        }));
        
        Alert.alert('Erro', result.error);
        return false;
      }
    } catch (error) {
      logger.error('Error confirming phone verification', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro inesperado';
      
      setState((prev) => ({
        ...prev,
        confirming: false,
        loading: false,
        error: errorMessage,
      }));
      
      Alert.alert('Erro', errorMessage);
      return false;
    }
  }, [state.verificationId]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Reset verification state
   */
  const reset = useCallback(() => {
    setState({
      loading: false,
      sending: false,
      confirming: false,
      verificationId: null,
      error: null,
    });
  }, []);

  return {
    state,
    sendVerification,
    confirmVerification,
    clearError,
    reset,
    recaptchaRef,
  };
}
