/**
 * Custom hook for authentication operations
 * Separates business logic from UI components
 */

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Alert, Platform } from 'react-native';
import { HapticFeedback } from '@/utils';
import { 
  registerUser, 
  loginUser, 
  resetPassword,
  type RegistrationInput,
  type LoginInput,
  type ResetPasswordInput,
} from '@/services/auth';

/**
 * Notification helper
 */
function notify(title: string, msg: string) {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${msg}`);
  } else {
    Alert.alert(title, msg);
  }
}

/**
 * Hook for user registration
 */
export function useRegister() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const register = useCallback(async (input: RegistrationInput, options?: { strictCPF?: boolean }) => {
    setLoading(true);
    setErrors({});
    HapticFeedback.medium();

    try {
      const result = await registerUser(input, options);
      
      if (result.success) {
        HapticFeedback.success();
        notify(
          'Conta criada com sucesso!',
          'Enviamos um e-mail de verificação. Confirme seu e-mail para continuar usando o app.'
        );
        router.replace('/(auth)/verify-email');
        return { success: true } as const;
      } else {
        HapticFeedback.error();
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        notify('Erro ao registrar', result.error);
        return { success: false, error: result.error, fieldErrors: result.fieldErrors } as const;
      }
    } catch (error) {
      HapticFeedback.error();
      const errorMsg = 'Não foi possível criar a conta. Tente novamente.';
      notify('Erro ao registrar', errorMsg);
      return { success: false, error: errorMsg } as const;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    register,
    loading,
    errors,
    clearErrors: useCallback(() => setErrors({}), []),
  };
}

/**
 * Hook for user login
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const login = useCallback(async (input: LoginInput) => {
    setLoading(true);
    setErrors({});
    setGeneralError(null);
    HapticFeedback.medium();

    try {
      const result = await loginUser(input);
      
      if (result.success) {
        HapticFeedback.success();
        router.replace('/(tabs)');
        return { success: true } as const;
      } else {
        HapticFeedback.error();
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        setGeneralError(result.error);
        notify('Erro ao entrar', result.error);
        return { success: false, error: result.error, fieldErrors: result.fieldErrors } as const;
      }
    } catch (error) {
      HapticFeedback.error();
      const errorMsg = 'Não foi possível entrar. Tente novamente.';
      setGeneralError(errorMsg);
      notify('Erro ao entrar', errorMsg);
      return { success: false, error: errorMsg } as const;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    login,
    loading,
    errors,
    generalError,
    clearErrors: useCallback(() => {
      setErrors({});
      setGeneralError(null);
    }, []),
  };
}

/**
 * Hook for password reset
 */
export function useResetPassword() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const reset = useCallback(async (input: ResetPasswordInput) => {
    setLoading(true);
    setErrors({});

    try {
      const result = await resetPassword(input);
      
      if (result.success) {
        notify(
          'Verifique seu e-mail',
          'Se o e-mail existir, enviamos um link de redefinição. Veja também a caixa de spam.'
        );
        return { success: true } as const;
      } else {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        notify('Não foi possível enviar', result.error);
        return { success: false, error: result.error, fieldErrors: result.fieldErrors } as const;
      }
    } catch (error) {
      const errorMsg = 'Não foi possível enviar. Tente novamente.';
      notify('Não foi possível enviar', errorMsg);
      return { success: false, error: errorMsg } as const;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    reset,
    loading,
    errors,
    clearErrors: useCallback(() => setErrors({}), []),
  };
}

