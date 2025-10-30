/**
 * SearchHeaderBranding - Logo and title section
 * 
 * Memoized to prevent unnecessary re-renders when filters change.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';

type SearchHeaderBrandingProps = {
  title?: string;
  prompt?: string;
};

// Static styles to prevent recreation on each render
const styles = StyleSheet.create({
  titleContainer: {
    textAlign: 'center',
    marginBottom: 8,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 300,
    height: 150,
  },
  promptContainer: {
    marginBottom: 12,
  },
});

// Static logo source to prevent recreation
const LOGO_SOURCE = require('../../assets/images/logo.png');

export const SearchHeaderBranding = React.memo(function SearchHeaderBranding({
  title = "Precisou?",
  prompt = "O que você quer alugar?",
}: SearchHeaderBrandingProps) {
  return (
    <>
      {/* Title */}
      <ThemedText
        type="large-title"
        style={styles.titleContainer}
        className="text-light-text-primary dark:text-dark-text-primary"
      >
        {title}
      </ThemedText>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={LOGO_SOURCE}
          style={styles.logo}
          contentFit="contain"
          transition={200}
          cachePolicy="memory-disk"
          recyclingKey="header-logo"
        />
      </View>

      {/* Prompt */}
      <ThemedText
        type="callout"
        style={styles.promptContainer}
        className="text-light-text-primary dark:text-dark-text-secondary"
      >
        {prompt}
      </ThemedText>
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if title or prompt actually changed
  return prevProps.title === nextProps.title && prevProps.prompt === nextProps.prompt;
});

