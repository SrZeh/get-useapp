/**
 * New Help Request Screen
 * 
 * Form to create a new help request
 */

import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useThemeColors } from '@/utils';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Ionicons } from '@expo/vector-icons';
import { HapticFeedback } from '@/utils';
import { useAuth } from '@/providers/AuthProvider';
import { useProfileData } from '@/hooks/features/profile/useProfileData';
import { canCreateHelpRequest, getMissingVerifications } from '@/utils/itemRequest';
import { useItemService } from '@/providers/ServicesProvider';
import { useNavigationService } from '@/providers/ServicesProvider';

export default function NewHelpRequestScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { user } = useAuth();
  const { user: userProfile } = useProfileData();
  const itemService = useItemService();
  const navigation = useNavigationService();

  const [message, setMessage] = useState('');
  const [urgencyType, setUrgencyType] = useState<'immediate' | 'planned'>('immediate');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);

  const canCreate = canCreateHelpRequest(userProfile);
  const missingVerifications = getMissingVerifications(userProfile);

  const handleSubmit = async () => {
    if (!canCreate) {
      Alert.alert(
        'Verificação necessária',
        `Para criar pedidos de ajuda, você precisa:\n\n${missingVerifications.map(v => `• ${v}`).join('\n')}\n\n${missingVerifications.includes('E-mail verificado') ? 'Verifique seu e-mail e tente novamente.' : 'Complete seu perfil e tente novamente.'}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Verificar', onPress: () => router.push('/help/verify-required') }
        ]
      );
      return;
    }

    if (!message.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, informe o que você precisa.');
      return;
    }

    if (!city.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, descreva a situação.');
      return;
    }

    try {
      setLoading(true);
      HapticFeedback.medium();
      
      // Criar como item do tipo request
      // message = título (o que precisa)
      // city = descrição (situação)
      const result = await itemService.createItem({
        title: message.trim().slice(0, 100),
        description: city.trim() || message.trim(), // Usa city como descrição, fallback para message
        itemType: 'request',
        urgencyType,
        published: true,
        isFree: true,
        dailyRate: 0,
        termsAccepted: true,
      });
      
      HapticFeedback.success();
      Alert.alert('Pedido criado!', 'Seu pedido de ajuda foi publicado na vitrine.');
      router.back();
    } catch (error: any) {
      HapticFeedback.error();
      Alert.alert('Erro', error?.message || 'Não foi possível criar o pedido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: insets.top, android: 0 })}
    >
      <ThemedView style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: Spacing.md + insets.top + 90 } // Account for header height (approx 90px) + safe area
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <ThemedText type="large-title" style={styles.title}>
              Novo Pedido
            </ThemedText>
            <View style={{ width: 40 }} />
          </View>
          <LiquidGlassView
            intensity="standard"
            cornerRadius={BorderRadius.lg}
            style={styles.formCard}
          >
            {/* Urgency Type */}
            <View style={styles.section}>
              <ThemedText type="title-3" style={styles.sectionTitle}>
                Tipo de urgência
              </ThemedText>
              <View style={styles.urgencyButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setUrgencyType('immediate');
                    HapticFeedback.selection();
                  }}
                  style={[
                    styles.urgencyButton,
                    urgencyType === 'immediate' && {
                      backgroundColor: `${colors.semantic.warning}20`,
                      borderColor: colors.semantic.warning,
                    },
                  ]}
                >
                  <ThemedText
                    type="body"
                    style={[
                      styles.urgencyButtonText,
                      urgencyType === 'immediate' && { color: colors.semantic.warning, fontWeight: '600' },
                    ]}
                  >
                    ⚡ Urgente
                  </ThemedText>
                  <ThemedText type="caption-1" style={[styles.urgencyButtonSubtext, { color: colors.text.secondary }]}>
                    Expira em 1 hora
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setUrgencyType('planned');
                    HapticFeedback.selection();
                  }}
                  style={[
                    styles.urgencyButton,
                    urgencyType === 'planned' && {
                      backgroundColor: `${colors.brand.primary}20`,
                      borderColor: colors.brand.primary,
                    },
                  ]}
                >
                  <ThemedText
                    type="body"
                    style={[
                      styles.urgencyButtonText,
                      urgencyType === 'planned' && { color: colors.brand.primary, fontWeight: '600' },
                    ]}
                  >
                    📅 Planejado
                  </ThemedText>
                  <ThemedText type="caption-1" style={[styles.urgencyButtonSubtext, { color: colors.text.secondary }]}>
                    Expira em 7 dias
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>

            {/* Title - What you need */}
            <View style={styles.section}>
              <Input
                label="O que você precisa? *"
                value={message}
                onChangeText={setMessage}
                placeholder="Ex: Furadeira elétrica"
                maxLength={100}
              />
            </View>

            {/* Description - Describe the situation */}
            <View style={styles.section}>
              <Input
                label="Descreva a situação *"
                value={city}
                onChangeText={setCity}
                placeholder="Descreva para que você precisa e a situação..."
                multiline
                numberOfLines={4}
                style={styles.textArea}
                textAlignVertical="top"
              />
            </View>

            {/* Submit Button */}
            <Button
              variant="primary"
              onPress={handleSubmit}
              loading={loading}
              disabled={loading || !message.trim() || !city.trim()}
              fullWidth
              style={styles.submitButton}
            >
              Criar pedido de ajuda
            </Button>
          </LiquidGlassView>
        </ScrollView>
      </ThemedView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  title: {
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  formCard: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  urgencyButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  urgencyButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    gap: Spacing['2xs'],
  },
  urgencyButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  urgencyButtonSubtext: {
    fontSize: 12,
    textAlign: 'center',
  },
  textArea: {
    minHeight: 120,
    paddingTop: Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.md,
  },
});
