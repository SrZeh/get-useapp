/**
 * Price input filter component (number input for max price)
 */

import React from 'react';
import { View, TextInput, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useThemeColors } from '@/utils/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

type PriceInputFilterProps = {
  title: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  style?: ViewStyle;
};

/**
 * Price input filter component for entering max price
 */
export function PriceInputFilter({
  title,
  value,
  onChangeText,
  placeholder = 'Ex: 100',
  style,
}: PriceInputFilterProps) {
  const colors = useThemeColors();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View style={[{ marginBottom: 12 }, style]}>
      {/* Title */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
        <Ionicons
          name="cash"
          size={18}
          color={colors.text.primary}
        />
        <ThemedText
          type="caption-1"
          style={{ fontWeight: '600', color: colors.text.primary }}
        >
          {title}
        </ThemedText>
      </View>

      {/* Price Input */}
      <LiquidGlassView intensity="subtle" cornerRadius={16}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 8,
          }}
        >
          <ThemedText
            type="body"
            style={{ color: colors.text.primary, fontWeight: '600' }}
          >
            R$
          </ThemedText>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={palette.textTertiary}
            value={value}
            onChangeText={onChangeText}
            keyboardType="numeric"
            style={{
              flex: 1,
              color: palette.text,
              fontSize: 17,
              backgroundColor: 'transparent',
            }}
            accessibilityLabel={title}
            accessibilityHint="Digite o preço máximo em reais"
          />
        </View>
      </LiquidGlassView>
    </View>
  );
}

