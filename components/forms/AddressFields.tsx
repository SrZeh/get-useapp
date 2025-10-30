/**
 * AddressFields - Street, Number, Complement, and Neighborhood fields
 */

import React from 'react';
import { View } from 'react-native';
import { Input } from '@/components/Input';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/utils';

type AddressFieldsProps = {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  onStreetChange: (street: string) => void;
  onNumberChange: (number: string) => void;
  onComplementChange: (complement: string) => void;
  onNeighborhoodChange: (neighborhood: string) => void;
};

export const AddressFields = React.memo(function AddressFields({
  street,
  number,
  complement,
  neighborhood,
  onStreetChange,
  onNumberChange,
  onComplementChange,
  onNeighborhoodChange,
}: AddressFieldsProps) {
  const colors = useThemeColors();

  return (
    <>
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
    </>
  );
});

