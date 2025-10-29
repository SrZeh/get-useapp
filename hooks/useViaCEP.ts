/**
 * useViaCEP - Hook for fetching address data from ViaCEP API
 * Simplified version that only returns neighborhood (bairro) and city (localidade)
 */

import { useState, useCallback } from 'react';

const VIACEP_API = 'https://viacep.com.br/ws';

type ViaCEPResponse = {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
};

type UseViaCEPReturn = {
  loading: boolean;
  error: string | null;
  fetchAddress: (cep: string) => Promise<{ neighborhood: string; city: string } | null>;
};

/**
 * Formats CEP input: 00000-000
 */
function formatCEP(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 5) {
    return digits;
  }
  return `${digits.substring(0, 5)}-${digits.substring(5, 8)}`;
}

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
      const response = await fetch(`${VIACEP_API}/${cleanCEP}/json/`);
      
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
 * Formats CEP value for display
 */
export function formatCEPValue(value: string): string {
  return formatCEP(value);
}

