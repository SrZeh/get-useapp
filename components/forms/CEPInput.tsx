/**
 * CEPInput - CEP input field with ViaCEP integration and auto-fetch
 * 
 * Features:
 * - Auto-formatting (00000-000)
 * - Debounced API calls (300ms) to reduce unnecessary requests
 * - Loading state indicator
 * - Error handling
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator } from 'react-native';
import { Input } from '@/components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/utils';
import { cepSchema } from '@/utils/validation';
import { formatCEP } from '@/utils/formatters';
import { API_CONFIG } from '@/constants/api';
import { debounce } from 'lodash';

const DEBOUNCE_DELAY = 300; // 300ms delay as recommended in analysis

type CEPInputProps = {
  value: string;
  onChange: (cep: string) => void;
  onAddressFetched?: (address: {
    street?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  }) => void;
  error?: string;
};

export const CEPInput = React.memo(function CEPInput({
  value,
  onChange,
  onAddressFetched,
  error,
}: CEPInputProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);
  const debouncedFetchRef = useRef<ReturnType<typeof debounce> | null>(null);

  const fetchAddress = useCallback(async (cepValue: string) => {
    const cleanCEP = cepValue.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setLoading(true);
    setCepError(null);

    try {
      const response = await fetch(`${API_CONFIG.VIACEP_API}/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }

      // Notify parent of fetched address data
      if (onAddressFetched) {
        onAddressFetched({
          street: data.logradouro,
          complement: data.complemento,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf?.toUpperCase(),
        });
      }
    } catch (err) {
      setCepError('Erro ao buscar CEP. Verifique sua conexão.');
      console.error('ViaCEP API error:', err);
    } finally {
      setLoading(false);
    }
  }, [onAddressFetched]);

  // Create debounced fetch function
  useEffect(() => {
    debouncedFetchRef.current = debounce((cepValue: string) => {
      fetchAddress(cepValue);
    }, DEBOUNCE_DELAY);

    // Cleanup on unmount
    return () => {
      if (debouncedFetchRef.current) {
        debouncedFetchRef.current.cancel();
      }
    };
  }, [fetchAddress]);

  const handleCepChange = useCallback((inputValue: string) => {
    const formatted = formatCEP(inputValue);
    onChange(formatted);
    
    // Clear previous errors
    setCepError(null);
    
    // Debounced fetch when CEP is complete (8 digits)
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8 && debouncedFetchRef.current) {
      debouncedFetchRef.current(formatted);
    } else if (debouncedFetchRef.current) {
      // Cancel pending fetch if CEP is incomplete
      debouncedFetchRef.current.cancel();
      setLoading(false);
    }
  }, [onChange]);

  return (
    <Input
      label="CEP"
      placeholder="00000-000"
      value={value}
      onChangeText={handleCepChange}
      keyboardType="number-pad"
      maxLength={9}
      error={cepError || error}
      helperText={
        loading 
          ? "Buscando endereço..." 
          : !cepError 
            ? "Digite o CEP para buscar o endereço automaticamente" 
            : undefined
      }
      rightElement={
        loading ? (
          <ActivityIndicator size="small" color={colors.brand.primary} />
        ) : (
          <Ionicons 
            name="search" 
            size={20} 
            color={value.length === 9 ? colors.brand.primary : colors.text.tertiary}
          />
        )
      }
      zodSchema={cepSchema}
      validateOnBlur={true}
    />
  );
});

