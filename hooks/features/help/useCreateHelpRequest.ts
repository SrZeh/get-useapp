/**
 * useCreateHelpRequest - Hook for creating help requests
 * 
 * Handles creation with loading and error states
 */

import { useState } from 'react';
import { createHelpRequest } from '@/services/helpRequest';
import type { CreateHelpRequestInput } from '@/types/helpRequest';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export function useCreateHelpRequest() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const create = async (input: CreateHelpRequestInput) => {
    try {
      console.log('[useCreateHelpRequest] Iniciando create...');
      setLoading(true);
      setError(null);

      // Validate input
      if (!input.message.trim()) {
        throw new Error('Por favor, descreva o que você precisa');
      }

      if (!input.neighborhood || input.neighborhood.length === 0) {
        throw new Error('Por favor, selecione pelo menos um bairro');
      }

      console.log('[useCreateHelpRequest] Chamando createHelpRequest...');
      const result = await createHelpRequest(input);
      console.log('[useCreateHelpRequest] createHelpRequest retornou:', result);
      
      // Navigate to the created request
      console.log('[useCreateHelpRequest] Navegando para:', `/help/${result.id}`);
      router.push(`/help/${result.id}`);
      
      return result;
    } catch (err) {
      console.error('[useCreateHelpRequest] Erro capturado:', err);
      const error = err instanceof Error ? err : new Error('Erro ao criar pedido de ajuda');
      setError(error);
      Alert.alert('Erro', error.message);
      throw error;
    } finally {
      console.log('[useCreateHelpRequest] Finalizando (setLoading false)');
      setLoading(false);
    }
  };

  return { create, loading, error };
}

