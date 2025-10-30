import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { ThemedText } from './themed-text';
import { LiquidGlassView } from './liquid-glass/LiquidGlassView';
import { Spacing } from '@/constants/spacing';
import { useThemeColors } from '@/utils';
import { useBrandColorsWithOpacity } from '@/utils/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsive } from '@/hooks/useResponsive';
import { SupportModal } from '@/components/features/profile';

/**
 * Footer component with responsive 3-column grid layout
 * Section 1: Logo
 * Section 2: Links
 * Section 3: Contact email (right)
 * Copyright row below the 3 columns
 * Uses green background with glass blur effect
 */
export function Footer() {
  const colors = useThemeColors();
  const brandOpacity = useBrandColorsWithOpacity();
  const insets = useSafeAreaInsets();
  const { isMobile, isTablet } = useResponsive();
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const handleEmailPress = () => {
    Linking.openURL('mailto:contato@getuseapp.com');
  };

  const handleSupportPress = () => {
    setSupportModalVisible(true);
  };

  // Responsive padding
  const horizontalPadding = isMobile ? Spacing.md : isTablet ? Spacing.lg : Spacing.xl;
  const verticalPadding = isMobile ? Spacing.md : Spacing.lg;

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
        {/* Light green translucent overlay for mint glass tint */}
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
        <View style={[styles.content, { paddingHorizontal: horizontalPadding, paddingTop: verticalPadding }]}>
          {/* Responsive Grid Layout */}
          <View style={[styles.grid, isMobile && styles.gridMobile]}>
            {/* Section 1: Logo */}
            <View style={[styles.gridItem, styles.logoSection]}>
              <Link href="/" asChild>
                <TouchableOpacity style={styles.logoContainer} accessibilityRole="link" accessibilityLabel="Get & Use">
                  <Image
                    source={require("@/assets/images/logo.png")}
                    style={styles.logo}
                    contentFit="contain"
                    transition={200}
                  />
                  <ThemedText type="title" style={[styles.appName, { color: colors.text.primary }]}>
                    Get & Use
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Section 2: Links */}
            <View style={[
              styles.gridItem,
              styles.linksSection,
              { alignItems: 'center' }
            ]}>
              <View style={[
                styles.linksContainer,
                { alignItems: 'center' }
              ]}>
                <Link href="/termosdeuso" asChild>
                  <TouchableOpacity style={{ alignSelf: 'center' }}>
                    <ThemedText style={[styles.link, { color: colors.text.primary, opacity: 0.9 }]}>
                      Termos de Uso
                    </ThemedText>
                  </TouchableOpacity>
                </Link>
                <Link href="/politica-de-privacidade" asChild>
                  <TouchableOpacity style={{ alignSelf: 'center' }}>
                    <ThemedText style={[styles.link, { color: colors.text.primary, opacity: 0.9 }]}>
                      Política de Privacidade
                    </ThemedText>
                  </TouchableOpacity>
                </Link>
                <TouchableOpacity onPress={handleSupportPress} style={{ alignSelf: 'center' }}>
                  <ThemedText style={[styles.link, { color: colors.text.primary, opacity: 0.9 }]}>
                    Central de Ajuda
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 3: Contact Email (Right) */}
            <View style={[
              styles.gridItem,
              styles.emailSection,
              { alignItems: isMobile ? 'center' : 'flex-end' }
            ]}>
              <TouchableOpacity onPress={handleEmailPress} style={{ alignSelf: isMobile ? 'center' : 'flex-end' }}>
                <ThemedText style={[styles.contactText, { color: colors.text.primary, opacity: 0.85 }]}>
                  contato@getuseapp.com
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Copyright Row Below */}
          <View style={[styles.copyrightRow, isMobile && styles.copyrightRowMobile]}>
            <ThemedText style={[styles.copyrightText, { color: colors.text.secondary, opacity: 0.8 }]}>
              © 2025 Get & Use
            </ThemedText>
          </View>
        </View>
      </LiquidGlassView>

      {/* Support Modal */}
      <SupportModal
        visible={supportModalVisible}
        onClose={() => setSupportModalVisible(false)}
        colors={colors}
        brandOpacity={brandOpacity}
      />
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
    width: '100%',
  },
  grid: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.lg,
    flexWrap: 'wrap',
  },
  gridMobile: {
    flexDirection: 'column',
    gap: Spacing.lg,
  },
  gridItem: {
    flex: 1,
    minWidth: 200, // Minimum width for desktop columns
  },
  logoSection: {
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 32,
    height: 32,
  },
  appName: {
    fontWeight: '700',
    fontSize: 18,
  },
  linksSection: {
    flex: 1,
    justifyContent: 'center',
  },
  linksContainer: {
    flexDirection: 'column',
    gap: Spacing.xs,
  },
  link: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  emailSection: {
    flexShrink: 0,
    justifyContent: 'center',
  },
  contactText: {
    fontSize: 14,
  },
  copyrightRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 255, 154, 0.2)',
  },
  copyrightRowMobile: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
  },
  copyrightText: {
    fontSize: 13,
    textAlign: 'center',
  },
});

