/**
 * ProfileVerification - Displays email and CPF verification status
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { CheckmarkCircleIcon, CloseCircleIcon } from '@/assets/icons/theme-icons';
import { Spacing } from '@/constants/spacing';
import type { UseThemeColorsReturn } from '@/utils/theme';
import type { UserProfile } from '@/types';

type ProfileVerificationProps = {
  user: UserProfile | null;
  colors: UseThemeColorsReturn;
};

export const ProfileVerification = React.memo(function ProfileVerification({
  user,
  colors,
}: ProfileVerificationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {user?.emailVerified ? (
          <CheckmarkCircleIcon 
            width={20} 
            height={20} 
            color={colors.brand.dark} 
            stroke={colors.brand.dark}
          />
        ) : (
          <CloseCircleIcon 
            width={20} 
            height={20} 
            color={colors.semantic.error} 
            stroke={colors.semantic.error}
          />
        )}
        <ThemedText>
          E-mail: {user?.emailVerified ? "verificado ✅" : "não verificado ❌"}
        </ThemedText>
      </View>
      <View style={styles.row}>
        {user?.cpf ? (
          <CheckmarkCircleIcon 
            width={20} 
            height={20} 
            color={colors.brand.dark} 
            stroke={colors.brand.dark}
          />
        ) : (
          <CloseCircleIcon 
            width={20} 
            height={20} 
            color={colors.semantic.error} 
            stroke={colors.semantic.error}
          />
        )}
        <ThemedText>
          {user?.cpf ? "CPF verificado" : "CPF não verificado"}
        </ThemedText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2xs'],
  },
});

