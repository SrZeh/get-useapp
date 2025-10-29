/**
 * AddressInput component with ViaCEP integration
 * Automatically fetches address data when user enters a valid CEP
 */

import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Input } from '@/components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/utils';
import { cepSchema } from '@/utils/validation';

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

type AddressInputProps = {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  onCepChange: (cep: string) => void;
  onStreetChange: (street: string) => void;
  onNumberChange: (number: string) => void;
  onComplementChange: (complement: string) => void;
  onNeighborhoodChange: (neighborhood: string) => void;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
  error?: string;
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

export function AddressInput({
  cep,
  street,
  number,
  complement,
  neighborhood,
  city,
  state,
  onCepChange,
  onStreetChange,
  onNumberChange,
  onComplementChange,
  onNeighborhoodChange,
  onCityChange,
  onStateChange,
  error,
}: AddressInputProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const fetchAddress = useCallback(async (cepValue: string) => {
    const cleanCEP = cepValue.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setLoading(true);
    setCepError(null);

    try {
      const response = await fetch(`${VIACEP_API}/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: ViaCEPResponse = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado');
        return;
      }

      // Auto-fill address fields with ViaCEP data
      if (data.logradouro) onStreetChange(data.logradouro);
      if (data.complemento) onComplementChange(data.complemento);
      if (data.bairro) onNeighborhoodChange(data.bairro);
      if (data.localidade) onCityChange(data.localidade);
      if (data.uf) onStateChange(data.uf.toUpperCase());
    } catch (err) {
      setCepError('Erro ao buscar CEP. Verifique sua conexão.');
      console.error('ViaCEP API error:', err);
    } finally {
      setLoading(false);
    }
  }, [onStreetChange, onComplementChange, onNeighborhoodChange, onCityChange, onStateChange]);

  const handleCepChange = useCallback((value: string) => {
    const formatted = formatCEP(value);
    onCepChange(formatted);
    
    // Clear previous errors
    setCepError(null);
    
    // Auto-fetch when CEP is complete (8 digits)
    const clean = formatted.replace(/\D/g, '');
    if (clean.length === 8) {
      fetchAddress(formatted);
    }
  }, [onCepChange, fetchAddress]);

  // Validate CEP format
  const validateCEP = useCallback((value: string) => {
    if (!value) return { valid: true };
    
    const clean = value.replace(/\D/g, '');
    if (clean.length === 0) return { valid: true };
    if (clean.length < 8) return { valid: false, error: 'CEP incompleto' };
    if (clean.length > 8) return { valid: false, error: 'CEP inválido' };
    
    // Use Zod schema for final validation
    const result = cepSchema.safeParse(value);
    if (!result.success) {
      return { valid: false, error: result.error.errors[0]?.message ?? 'CEP inválido' };
    }
    
    return { valid: true };
  }, []);

  return (
    <View style={{ gap: 16 }}>
      {/* CEP Input */}
      <Input
        label="CEP"
        placeholder="00000-000"
        value={cep}
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
              color={cep.length === 9 ? colors.brand.primary : colors.text.tertiary}
            />
          )
        }
        zodSchema={cepSchema}
        validateOnBlur={true}
      />

      {/* Street */}
      <Input
        label="Logradouro"
        placeholder="Rua, Avenida, etc."
        value={street}
        onChangeText={onStreetChange}
        autoCapitalize="words"
        leftElement={
          <Ionicons name="location" size={20} color={colors.text.tertiary} />
        }
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* Number */}
        <View style={{ flex: 1 }}>
          <Input
            label="Número"
            placeholder="123"
            value={number}
            onChangeText={onNumberChange}
            keyboardType="number-pad"
          />
        </View>

        {/* Complement */}
        <View style={{ flex: 2 }}>
          <Input
            label="Complemento"
            placeholder="Apto, Bloco, etc. (opcional)"
            value={complement}
            onChangeText={onComplementChange}
            autoCapitalize="words"
            helperText="Opcional"
          />
        </View>
      </View>

      {/* Neighborhood */}
      <Input
        label="Bairro"
        placeholder="Nome do bairro"
        value={neighborhood}
        onChangeText={onNeighborhoodChange}
        autoCapitalize="words"
      />

      <View style={{ flexDirection: 'row', gap: 12 }}>
        {/* City */}
        <View style={{ flex: 3 }}>
          <Input
            label="Cidade"
            placeholder="Cidade"
            value={city}
            onChangeText={onCityChange}
            autoCapitalize="words"
          />
        </View>

        {/* State */}
        <View style={{ flex: 1 }}>
          <Input
            label="UF"
            placeholder="SP"
            value={state}
            onChangeText={(value) => onStateChange(value.toUpperCase())}
            autoCapitalize="characters"
            maxLength={2}
            helperText="Estado"
          />
        </View>
      </View>
    </View>
  );
}

