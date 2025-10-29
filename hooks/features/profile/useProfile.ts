/**
 * Custom hook for profile operations
 * Separates business logic from UI components
 */

import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { HapticFeedback } from '@/utils';
import { 
  updateUserProfile, 
  getUserProfile,
  type ProfileUpdateInput,
} from '@/services/profile';
import type { UserProfile } from '@/types';

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = useCallback(async (
    input: ProfileUpdateInput,
    options?: { uploadAvatar?: string }
  ) => {
    setLoading(true);
    setErrors({});
    HapticFeedback.medium();

    try {
      const result = await updateUserProfile(input, options);
      
      if (result.success) {
        HapticFeedback.success();
        Alert.alert('Perfil atualizado!', 'Suas informações foram salvas com sucesso.');
        router.back();
        return { success: true } as const;
      } else {
        HapticFeedback.error();
        if (result.fieldErrors) {
          setErrors(result.fieldErrors);
        }
        Alert.alert('Erro ao salvar', result.error);
        return { success: false, error: result.error, fieldErrors: result.fieldErrors } as const;
      }
    } catch (error) {
      HapticFeedback.error();
      const errorMsg = 'Não foi possível atualizar o perfil. Tente novamente.';
      Alert.alert('Erro ao salvar', errorMsg);
      return { success: false, error: errorMsg } as const;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    update,
    loading,
    errors,
    clearErrors: useCallback(() => setErrors({}), []),
  };
}

/**
 * Hook for loading user profile
 */
export function useLoadProfile(uid: string | undefined) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (!uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const profileData = await getUserProfile(uid);
      setProfile(profileData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load profile');
      setError(error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [uid]);

  return {
    profile,
    loading,
    error,
    load,
    reload: load,
  };
}

