/**
 * SearchBar - Search input field with glass effect
 */

import React from 'react';
import { View, TextInput } from 'react-native';
import { LiquidGlassView } from '@/components/liquid-glass';
import { SearchIcon } from '@/assets/icons/search-icon';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  style?: any;
};

export const SearchBar = React.memo(function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = "Buscar por título, descrição…",
  style,
}: SearchBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <LiquidGlassView intensity="subtle" cornerRadius={16} style={style}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
        }}
      >
        <SearchIcon
          width={20}
          height={20}
          color={palette.textTertiary}
          stroke={palette.textTertiary}
        />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor={palette.textTertiary}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            color: palette.text,
            fontSize: 17,
          }}
          accessibilityLabel="Buscar itens"
          accessibilityHint="Digite para buscar por título ou descrição e pressione Enter"
        />
      </View>
    </LiquidGlassView>
  );
});

