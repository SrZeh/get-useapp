/**
 * SearchHeaderBranding - Logo and title section
 */

import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';

type SearchHeaderBrandingProps = {
  title?: string;
  prompt?: string;
};

export const SearchHeaderBranding = React.memo(function SearchHeaderBranding({
  title = "Precisou?",
  prompt = "O que você quer alugar?",
}: SearchHeaderBrandingProps) {
  return (
    <>
      {/* Title */}
      <ThemedText
        type="large-title"
        style={{ textAlign: 'center', marginBottom: 8 }}
        className="text-light-text-primary dark:text-dark-text-primary"
      >
        {title}
      </ThemedText>

      {/* Logo */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ width: 300, height: 150 }}
          contentFit="contain"
          transition={200}
        />
      </View>

      {/* Prompt */}
      <ThemedText
        type="callout"
        style={{ marginBottom: 12 }}
        className="text-light-text-primary dark:text-dark-text-secondary"
      >
        {prompt}
      </ThemedText>
    </>
  );
});

