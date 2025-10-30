/**
 * LocationFields - City and State fields
 */

import React from 'react';
import { View } from 'react-native';
import { Input } from '@/components/Input';

type LocationFieldsProps = {
  city: string;
  state: string;
  onCityChange: (city: string) => void;
  onStateChange: (state: string) => void;
};

export const LocationFields = React.memo(function LocationFields({
  city,
  state,
  onCityChange,
  onStateChange,
}: LocationFieldsProps) {
  return (
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
  );
});

