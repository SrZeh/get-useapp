/**
 * SupportModal - Support contact modal component
 */

import React from 'react';
import { View, StyleSheet, Modal, Pressable, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Platform , Linking , Alert } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { HapticFeedback } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { TERMS_URL } from '@/constants/terms';

import type { UseThemeColorsReturn } from '@/utils/theme';

type SupportModalProps = {
  visible: boolean;
  onClose: () => void;
  colors: UseThemeColorsReturn;
  brandOpacity: {
    primary: { low: string };
    dark: { low: string };
  };
};

export const SupportModal = React.memo(function SupportModal({
  visible,
  onClose,
  colors,
  brandOpacity,
}: SupportModalProps) {
  const handleEmailPress = () => {
    HapticFeedback.medium();
    const supportEmail = 'contato@getuseapp.com';
    Linking.openURL(`mailto:${supportEmail}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível abrir o cliente de e-mail');
    });
    onClose();
  };

  const handlePhonePress = () => {
    HapticFeedback.medium();
    const supportPhone = '+5511999999999';
    Linking.openURL(`tel:${supportPhone}`).catch(() => {
      Alert.alert('Erro', 'Não foi possível fazer a ligação');
    });
    onClose();
  };

  const handleTermsPress = () => {
    HapticFeedback.light();
    router.push(TERMS_URL);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
    >
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
          >
            <LiquidGlassView
              intensity="standard"
              cornerRadius={BorderRadius.xl}
              style={styles.modal}
            >
              {/* Header */}
              <View style={styles.header}>
                <Ionicons 
                  name="help-circle" 
                  size={48} 
                  color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
                  style={styles.headerIcon} 
                />
                <ThemedText type="title" style={styles.headerTitle}>
                  Suporte Get & Use
                </ThemedText>
                <ThemedText 
                  className="text-light-text-secondary dark:text-dark-text-secondary" 
                  style={styles.headerSubtitle}
                >
                  Entre em contato conosco através dos canais abaixo:
                </ThemedText>
              </View>

              {/* Contact Info */}
              <View style={[styles.contactInfo, {
                backgroundColor: colors.isDark ? brandOpacity.primary.low : brandOpacity.dark.low,
              }]}>
                <View style={styles.contactRow}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
                  />
                  <ThemedText style={styles.contactText}>
                    contato@getuseapp.com
                  </ThemedText>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons 
                    name="call-outline" 
                    size={20} 
                    color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
                  />
                  <ThemedText style={styles.contactText}>
                    (11) 99999-9999
                  </ThemedText>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                {/* Email Button */}
                <TouchableOpacity
                  onPress={handleEmailPress}
                  activeOpacity={0.8}
                  style={styles.emailButton}
                >
                  <Ionicons name="mail" size={20} color="#ffffff" />
                  <ThemedText style={styles.emailButtonText}>
                    Enviar E-mail
                  </ThemedText>
                </TouchableOpacity>

                {/* Phone Button - Only on mobile */}
                {Platform.OS !== 'web' && (
                  <Button
                    variant="secondary"
                    onPress={handlePhonePress}
                    fullWidth
                    iconLeft={
                      <Ionicons 
                        name="call" 
                        size={20} 
                        color={colors.isDark ? colors.brand.primary : colors.brand.dark} 
                      />
                    }
                  >
                    Ligar
                  </Button>
                )}

                {/* Terms Button */}
                <TouchableOpacity
                  onPress={handleTermsPress}
                  activeOpacity={0.8}
                  style={styles.termsButton}
                >
                  <Ionicons 
                    name="document-text-outline" 
                    size={20} 
                    color="#1f2937" 
                  />
                  <ThemedText style={styles.termsButtonText}>
                    Termos e Condições
                  </ThemedText>
                </TouchableOpacity>

                {/* Close Button */}
                <TouchableOpacity
                  onPress={() => {
                    HapticFeedback.light();
                    onClose();
                  }}
                  activeOpacity={0.7}
                  style={[styles.closeButton, {
                    backgroundColor: colors.isDark 
                      ? 'rgba(248, 113, 113, 0.2)'
                      : 'rgba(239, 68, 68, 0.15)',
                    borderColor: colors.isDark 
                      ? 'rgba(248, 113, 113, 0.4)'
                      : 'rgba(239, 68, 68, 0.3)',
                  }]}
                >
                  <ThemedText style={[styles.closeButtonText, {
                    color: colors.semantic.error,
                  }]}>
                    Fechar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </LiquidGlassView>
          </View>
        </TouchableWithoutFeedback>
      </Pressable>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
  },
  modalContent: {
    width: '100%',
    maxWidth: Math.min(Dimensions.get('window').width - 32, 480),
  },
  modal: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  headerIcon: {
    marginBottom: Spacing['2xs'],
  },
  headerTitle: {
    fontWeight: '700',
    marginBottom: Spacing['2xs'],
    textAlign: 'center',
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
  },
  contactInfo: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactText: {
    fontSize: 15,
    flex: 1,
  },
  actions: {
    gap: Spacing.sm,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2xs'],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#3b82f6',
    minHeight: 48,
  },
  emailButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 17,
  },
  termsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['2xs'],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#fbbf24',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#d97706',
  },
  termsButtonText: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: 17,
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing['2xs'],
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  closeButtonText: {
    fontWeight: '500',
    fontSize: 15,
  },
});

