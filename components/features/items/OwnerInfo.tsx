/**
 * OwnerInfo - Simple link to owner's public profile
 * 
 * Displays a clickable link that navigates to the owner's public profile page
 */

import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { Ionicons } from '@expo/vector-icons';

type OwnerInfoProps = {
  ownerUid: string;
};

export function OwnerInfo({ ownerUid }: OwnerInfoProps) {
  const colors = useThemeColors();

  const handlePress = () => {
    if (ownerUid) {
      router.push(`/user/${ownerUid}`);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      style={{ marginBottom: Spacing.md }}
    >
      <LiquidGlassView intensity="standard" cornerRadius={BorderRadius.lg} style={{ padding: Spacing.md }}>
        <TouchableOpacity 
          onPress={handlePress}
          activeOpacity={0.8}
          style={styles.linkContainer}
        >
          <Ionicons 
            name="person-outline" 
            size={20} 
            color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
          />
          <ThemedText 
            type="title-3" 
            style={[styles.linkText, {
              color: colors.isDark ? colors.brand.primary : colors.brand.dark,
            }]}
          >
            Informações do dono
          </ThemedText>
          <Ionicons 
            name="chevron-forward-outline" 
            size={18} 
            color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
          />
        </TouchableOpacity>
      </LiquidGlassView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  linkText: {
    flex: 1,
    fontWeight: '600',
  },
});

