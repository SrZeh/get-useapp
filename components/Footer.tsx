import React from 'react';
import { Platform, View, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from './themed-text';
import { LiquidGlassView } from './liquid-glass/LiquidGlassView';
import { ExtendedColors } from '@/constants/colors';
import { Spacing } from '@/constants/spacing';
import { useThemeColors } from '@/utils';

/**
 * Footer component with Brazilian footer information
 * Displays legal links, contact info, and copyright in a single row layout
 * Uses green background with glass blur effect
 */
export function Footer() {
  const colors = useThemeColors();

  const handleEmailPress = () => {
    Linking.openURL('mailto:contato@getuseapp.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+5511999999999');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: ExtendedColors.brand.primary, // Green background
          marginTop: Spacing.lg,
        },
      ]}
    >
      <LiquidGlassView
        intensity="strong"
        tint="light"
        cornerRadius={0}
        opacity={0.85}
        style={styles.glassOverlay}
      >
        <View style={styles.content}>
          {/* Horizontal Row Layout */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContent}
          >
            {/* App Name */}
            <View style={styles.appInfo}>
              <ThemedText type="title" style={styles.appName}>
                Get & Use
              </ThemedText>
            </View>

            <View style={styles.separator} />

            {/* Links Section */}
            <View style={styles.linksContainer}>
              <Link href="/termosdeuso" asChild>
                <TouchableOpacity style={styles.linkItem}>
                  <ThemedText style={styles.link}>Termos de Uso</ThemedText>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.link}>Política de Privacidade</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={styles.link}>Central de Ajuda</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            {/* Contact Section */}
            <View style={styles.contactSection}>
              <TouchableOpacity onPress={handleEmailPress} style={styles.contactItem}>
                <ThemedText style={styles.contactText}>
                  contato@getuseapp.com
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePhonePress} style={styles.contactItem}>
                <ThemedText style={styles.contactText}>
                  (11) 99999-9999
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.separator} />

            {/* Copyright */}
            <View style={styles.copyright}>
              <ThemedText style={styles.copyrightText}>
                © {new Date().getFullYear()} Get & Use
              </ThemedText>
            </View>
          </ScrollView>
        </View>
      </LiquidGlassView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  glassOverlay: {
    width: '100%',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  content: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  rowContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.md,
    flexWrap: 'wrap' as const,
  },
  appInfo: {
    flexShrink: 0,
  },
  appName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#000000', // Dark text on green background
    whiteSpace: 'nowrap' as any,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    flexShrink: 0,
  },
  linksContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
    flexShrink: 1,
    flexWrap: 'wrap' as const,
  },
  linkItem: {
    flexShrink: 0,
  },
  link: {
    fontSize: 13,
    textDecorationLine: 'underline' as const,
    color: '#000000',
    opacity: 0.9,
    whiteSpace: 'nowrap' as any,
  },
  contactSection: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.sm,
    flexShrink: 1,
    flexWrap: 'wrap' as const,
  },
  contactItem: {
    flexShrink: 0,
  },
  contactText: {
    fontSize: 13,
    color: '#000000',
    opacity: 0.85,
    whiteSpace: 'nowrap' as any,
  },
  copyright: {
    flexShrink: 0,
  },
  copyrightText: {
    fontSize: 12,
    color: '#000000',
    opacity: 0.75,
    whiteSpace: 'nowrap' as any,
  },
});

