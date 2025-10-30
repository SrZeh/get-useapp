import React from 'react';
import { Platform, View, StyleSheet, TouchableOpacity, Linking, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { ThemedText } from './themed-text';
import { LiquidGlassView } from './liquid-glass/LiquidGlassView';
import { Spacing } from '@/constants/spacing';
import { useThemeColors } from '@/utils';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Footer component with Brazilian footer information
 * Displays legal links, contact info, and copyright in a single row layout
 * Uses green background with glass blur effect
 */
export function Footer() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const handleEmailPress = () => {
    Linking.openURL('mailto:contato@getuseapp.com');
  };

  const handlePhonePress = () => {
    Linking.openURL('tel:+5511999999999');
  };

  return (
    <View style={[styles.container, { marginTop: 0 }]}>
      <LiquidGlassView
        intensity="subtle"
        tint="system"
        cornerRadius={0}
        opacity={0}
        style={[
          styles.glassOverlay,
          {
            paddingBottom: Math.max(insets.bottom, Spacing.sm),
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            overflow: 'hidden',
          },
        ]}
      >
        {/* Light green translucent overlay for mint glass tint (no base opacity) */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(150, 255, 154, 0.14)',
          }}
          pointerEvents="none"
        />
        <View style={styles.content}>
          {/* Horizontal Row Layout */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rowContent}
          >
            {/* App Name */}
            <View style={styles.appInfo}>
              <ThemedText type="title" style={[styles.appName, { color: colors.text.primary }]}>
                Get & Use
              </ThemedText>
            </View>

            <View style={[styles.separator, { backgroundColor: 'rgba(150, 255, 154, 0.28)' }]} />

            {/* Links Section */}
            <View style={styles.linksContainer}>
              <Link href="/termosdeuso" asChild>
                <TouchableOpacity style={styles.linkItem}>
                  <ThemedText style={[styles.link, { color: colors.text.primary, opacity: 0.9 }]}>Termos de Uso</ThemedText>
                </TouchableOpacity>
              </Link>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={[styles.link, { color: colors.text.primary, opacity: 0.9 }]}>Política de Privacidade</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkItem}>
                <ThemedText style={[styles.link, { color: colors.text.primary, opacity: 0.9 }]}>Central de Ajuda</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={[styles.separator, { backgroundColor: 'rgba(150, 255, 154, 0.28)' }]} />

            {/* Contact Section */}
            <View style={styles.contactSection}>
              <TouchableOpacity onPress={handleEmailPress} style={styles.contactItem}>
                <ThemedText style={[styles.contactText, { color: colors.text.primary, opacity: 0.85 }]}>
                  contato@getuseapp.com
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handlePhonePress} style={styles.contactItem}>
                <ThemedText style={[styles.contactText, { color: colors.text.primary, opacity: 0.85 }]}>
                  (11) 99999-9999
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={[styles.separator, { backgroundColor: 'rgba(150, 255, 154, 0.28)' }]} />

            {/* Copyright */}
            <View style={styles.copyright}>
              <ThemedText style={[styles.copyrightText, { color: colors.text.secondary, opacity: 0.8 }]}>
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
    whiteSpace: 'nowrap' as any,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(127, 127, 127, 0.25)',
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
    whiteSpace: 'nowrap' as any,
  },
  copyright: {
    flexShrink: 0,
  },
  copyrightText: {
    fontSize: 12,
    whiteSpace: 'nowrap' as any,
  },
});

