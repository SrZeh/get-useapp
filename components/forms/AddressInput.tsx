/**
 * AddressInput - Complete address form with ViaCEP integration
 * 
 * Refactored to use extracted components:
 * - CEPInput: CEP field with auto-fetch
 * - AddressFields: Street, Number, Complement, Neighborhood
 * - LocationFields: City and State
 */

import React, { useCallback } from 'react';
import { View } from 'react-native';
import { CEPInput } from './CEPInput';
import { AddressFields } from './AddressFields';
import { LocationFields } from './LocationFields';

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
  // Handle address data fetched from ViaCEP
  const handleAddressFetched = useCallback((address: {
    street?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
  }) => {
    if (address.street) onStreetChange(address.street);
    if (address.complement) onComplementChange(address.complement);
    if (address.neighborhood) onNeighborhoodChange(address.neighborhood);
    if (address.city) onCityChange(address.city);
    if (address.state) onStateChange(address.state);
  }, [onStreetChange, onComplementChange, onNeighborhoodChange, onCityChange, onStateChange]);

  return (
    <View style={{ gap: 16 }}>
      <CEPInput
        value={cep}
        onChange={onCepChange}
        onAddressFetched={handleAddressFetched}
        error={error}
      />

      <AddressFields
        street={street}
        number={number}
        complement={complement}
        neighborhood={neighborhood}
        onStreetChange={onStreetChange}
        onNumberChange={onNumberChange}
        onComplementChange={onComplementChange}
        onNeighborhoodChange={onNeighborhoodChange}
      />

      <LocationFields
        city={city}
        state={state}
        onCityChange={onCityChange}
        onStateChange={onStateChange}
      />
    </View>
  );
}

