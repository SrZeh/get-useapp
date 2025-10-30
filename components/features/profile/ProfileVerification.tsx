/**
 * ProfileVerification - Displays email and CPF verification status
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
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
        <Ionicons 
          name={user?.emailVerified ? "checkmark-circle" : "close-circle"} 
          size={20} 
          color={user?.emailVerified ? colors.brand.dark : colors.semantic.error} 
        />
        <ThemedText>
          E-mail: {user?.emailVerified ? "verificado ✅" : "não verificado ❌"}
        </ThemedText>
      </View>
      <View style={styles.row}>
        <Ionicons 
          name={user?.cpf ? "checkmark-circle" : "close-circle"} 
          size={20} 
          color={user?.cpf ? colors.brand.dark : colors.semantic.error} 
        />
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

