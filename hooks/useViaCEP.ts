/**
 * useViaCEP - Hook for fetching address data from ViaCEP API
 * Simplified version that only returns neighborhood (bairro) and city (localidade)
 */

import { useState, useCallback } from 'react';
import type { ViaCEPResponse } from '@/types';
import { API_CONFIG } from '@/constants/api';
import { formatCEP } from '@/utils/formatters';

type UseViaCEPReturn = {
  loading: boolean;
  error: string | null;
  fetchAddress: (cep: string) => Promise<{ neighborhood: string; city: string } | null>;
};

/**
 * Hook for fetching neighborhood and city from ViaCEP
 */
export function useViaCEP(): UseViaCEPReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddress = useCallback(async (cep: string): Promise<{ neighborhood: string; city: string } | null> => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_CONFIG.VIACEP_API}/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        setError('CEP não encontrado');
        return null;
      }

      return {
        neighborhood: data.bairro || '',
        city: data.localidade || '',
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar CEP. Verifique sua conexão.';
      setError(errorMessage);
      console.error('ViaCEP API error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAddress,
  };
}

/**
 * Formats CEP value for display (convenience wrapper)
 * @deprecated Use formatCEP from @/utils/formatters directly
 */
export function formatCEPValue(value: string): string {
  return formatCEP(value);
}

