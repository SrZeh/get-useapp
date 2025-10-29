import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

type VerifiedBadgeProps = {
  size?: 'sm' | 'md' | 'lg';
};

export function VerifiedBadge({ size = 'sm' }: VerifiedBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const sizes = {
    sm: { icon: 12, padding: 4 },
    md: { icon: 16, padding: 6 },
    lg: { icon: 20, padding: 8 },
  };

  const { icon, padding } = sizes[size];

  return (
    <View
      style={[
        styles.badge,
        {
          padding,
          backgroundColor: '#08af0e', // success-primary
        },
      ]}
    >
      <Ionicons name="checkmark-circle" size={icon} color="white" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
  },
});

