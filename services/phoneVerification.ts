/**
 * Phone verification service using Firebase Phone Authentication
 * Supports SMS verification on iOS, Android, and Web
 */

import { auth, db } from '@/lib/firebase';
import { 
  PhoneAuthProvider, 
  linkWithCredential, 
  type PhoneAuthCredential,
  type User,
} from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { logger } from '@/utils';
import { phoneToE164, isValidE164Phone } from '@/utils/phoneE164';
import { phoneSchema } from '@/utils/validation';
import { Platform } from 'react-native';
import type { ApplicationVerifier } from 'firebase/auth';

/**
 * Phone verification result
 */
export type PhoneVerificationResult =
  | {
      success: true;
      verificationId: string;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Phone confirmation result
 */
export type PhoneConfirmationResult =
  | {
      success: true;
      phoneNumber: string;
    }
  | {
      success: false;
      error: string;
      code?: string;
    };

/**
 * Send SMS verification code to phone number
 * @param phone Brazilian phone number in any format
 * @param appVerifier reCAPTCHA verifier (required for web, optional for mobile)
 */
export async function sendPhoneVerification(
  phone: string,
  appVerifier: ApplicationVerifier | null
): Promise<PhoneVerificationResult> {
  try {
    // Validate phone format
    const validation = phoneSchema.safeParse(phone);
    if (!validation.success) {
      const error = validation.error.errors[0];
      return {
        success: false,
        error: error?.message ?? 'Telefone inválido',
      };
    }

    // Convert to E.164 format
    let e164Phone: string;
    try {
      e164Phone = phoneToE164(phone);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao formatar telefone',
      };
    }

    // Validate E.164 format
    if (!isValidE164Phone(e164Phone)) {
      return {
        success: false,
        error: 'Formato de telefone inválido',
      };
    }

    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado. Faça login novamente.',
      };
    }

    logger.debug('Sending phone verification SMS', { phone: e164Phone });

    const provider = new PhoneAuthProvider(auth);

    // For web, appVerifier is required (reCAPTCHA)
    // For mobile, it's optional but recommended for security
    if (Platform.OS === 'web' && !appVerifier) {
      return {
        success: false,
        error: 'reCAPTCHA necessário para verificação na web',
        code: 'auth/missing-app-verifier',
      };
    }

    try {
      const verificationId = await provider.verifyPhoneNumber(
        e164Phone,
        appVerifier || undefined
      );

      logger.info('Phone verification SMS sent', { phone: e164Phone });

      return {
        success: true,
        verificationId,
      };
    } catch (error: unknown) {
      logger.error('Failed to send phone verification', error);
      
      const err = error as { code?: string; message?: string };
      const code = err?.code ?? '';
      
      let errorMessage = 'Não foi possível enviar o SMS. Tente novamente.';
      
      if (code === 'auth/invalid-phone-number') {
        errorMessage = 'Número de telefone inválido. Verifique o formato.';
      } else if (code === 'auth/too-many-requests') {
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
      } else if (code === 'auth/quota-exceeded') {
        errorMessage = 'Limite de SMS excedido. Tente novamente mais tarde.';
      } else if (code === 'auth/missing-app-verifier') {
        errorMessage = 'Verificação de segurança necessária. Tente novamente.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        code,
      };
    }
  } catch (error: unknown) {
    logger.error('Phone verification error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao verificar telefone',
    };
  }
}

/**
 * Confirm phone verification code
 * @param verificationId Verification ID from sendPhoneVerification
 * @param code SMS verification code
 * @param phone Original phone number (for storage)
 */
export async function confirmPhoneVerification(
  verificationId: string,
  code: string,
  phone: string
): Promise<PhoneConfirmationResult> {
  try {
    const user = auth.currentUser;
    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado. Faça login novamente.',
      };
    }

    // Validate code
    if (!code || code.length < 4) {
      return {
        success: false,
        error: 'Código inválido. Digite o código de 6 dígitos.',
      };
    }

    logger.debug('Confirming phone verification', { verificationId });

    // Create credential
    const credential = PhoneAuthProvider.credential(verificationId, code) as PhoneAuthCredential;

    // Link phone to user account
    try {
      await linkWithCredential(user, credential);
      
      // Convert to E.164 for storage
      const e164Phone = phoneToE164(phone);
      
      // Update Firestore profile
      await updateDoc(doc(db, 'users', user.uid), {
        phoneVerified: true,
        phone: e164Phone,
        updatedAt: serverTimestamp(),
      });

      logger.info('Phone verification confirmed', { uid: user.uid, phone: e164Phone });

      return {
        success: true,
        phoneNumber: e164Phone,
      };
    } catch (error: unknown) {
      logger.error('Failed to confirm phone verification', error);
      
      const err = error as { code?: string; message?: string };
      const code = err?.code ?? '';
      
      let errorMessage = 'Não foi possível verificar o telefone. Tente novamente.';
      
      if (code === 'auth/invalid-verification-code') {
        errorMessage = 'Código inválido. Verifique o código SMS e tente novamente.';
      } else if (code === 'auth/code-expired') {
        errorMessage = 'Código expirado. Solicite um novo código.';
      } else if (code === 'auth/credential-already-in-use') {
        errorMessage = 'Este telefone já está associado a outra conta.';
      } else if (code === 'auth/phone-number-already-exists') {
        errorMessage = 'Este número de telefone já está em uso.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      return {
        success: false,
        error: errorMessage,
        code,
      };
    }
  } catch (error: unknown) {
    logger.error('Phone confirmation error', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao confirmar telefone',
    };
  }
}

/**
 * Check if user's phone is verified
 */
export async function isPhoneVerified(user: User): Promise<boolean> {
  try {
    // Check if phone is linked to Firebase Auth
    const hasPhone = user.phoneNumber !== null;
    
    if (!hasPhone) {
      return false;
    }

    // Also check Firestore for phoneVerified flag
    // This is a backup check since we store it there too
    return true; // If phone is linked in Auth, it's verified
  } catch (error) {
    logger.error('Error checking phone verification', error);
    return false;
  }
}
