/**
 * ProfileHeader - Displays user photo, name, and email
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTypes } from '@/utils';
import { Spacing } from '@/constants/spacing';
import type { UseThemeColorsReturn } from '@/utils/theme';
import type { UserProfile } from '@/types';

type ProfileHeaderProps = {
  user: UserProfile | null;
  colors: UseThemeColorsReturn;
};

export const ProfileHeader = React.memo(function ProfileHeader({
  user,
  colors,
}: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      {user?.photoURL ? (
        <Image 
          source={{ uri: user.photoURL }} 
          style={[styles.avatar, {
            borderColor: colors.isDark ? colors.brand.primary : colors.brand.dark,
          }]}
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey={user.photoURL}
        />
      ) : (
        <LinearGradient
          colors={GradientTypes.brand.colors}
          style={styles.avatarGradient}
        >
          <ThemedText style={[styles.avatarPlaceholder, {
            color: colors.isDark ? colors.text.primary : '#ffffff',
          }]}>
            👤
          </ThemedText>
        </LinearGradient>
      )}
      <ThemedText type="title" style={styles.name}>
        {user?.name ?? "(Sem nome)"}
      </ThemedText>
      <ThemedText className="text-light-text-secondary dark:text-dark-text-secondary">
        {user?.email}
      </ThemedText>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholder: {
    fontSize: 48,
  },
  name: {
    fontWeight: '700',
  },
});

