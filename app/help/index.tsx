/**
 * Help Requests List Screen
 * 
 * Currently showing "Coming Soon" page while feature is in development
 */

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useThemeColors } from '@/utils';
import { EmptyState } from '@/components/states';
import { LiquidGlassView } from '@/components/liquid-glass';
import { MegaphoneIcon } from '@/assets/icons/megaphone-icon';

export default function HelpRequestsScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top + 80 }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="large-title" style={styles.title}>
            Socorro!
          </ThemedText>
          <ThemedText type="body" style={[styles.subtitle, { color: colors.text.secondary }]}>
            Em breve você poderá pedir ajuda à comunidade
          </ThemedText>
        </View>

        <LiquidGlassView
          intensity="standard"
          cornerRadius={BorderRadius.xl}
          style={styles.comingSoonCard}
        >
          <View style={styles.iconContainer}>
            <MegaphoneIcon
              width={80}
              height={80}
              color={colors.brand.primary}
              stroke={colors.brand.primary}
            />
          </View>

          <ThemedText type="title-1" style={styles.comingSoonTitle}>
            Em Produção
          </ThemedText>

          <ThemedText
            type="body"
            style={[styles.comingSoonMessage, { color: colors.text.secondary }]}
          >
            Estamos trabalhando para trazer essa funcionalidade em breve.
            {'\n\n'}
            Com o <ThemedText style={{ fontWeight: '600' }}>Socorro!</ThemedText>, você poderá:
          </ThemedText>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <ThemedText type="body" style={styles.featureIcon}>
                📢
              </ThemedText>
              <ThemedText type="body" style={[styles.featureText, { color: colors.text.secondary }]}>
                Pedir ajuda urgente à comunidade
              </ThemedText>
            </View>

            <View style={styles.featureItem}>
              <ThemedText type="body" style={styles.featureIcon}>
                ⏱️
              </ThemedText>
              <ThemedText type="body" style={[styles.featureText, { color: colors.text.secondary }]}>
                Pedidos aparecem por 1 hora na vitrine
              </ThemedText>
            </View>

            <View style={styles.featureItem}>
              <ThemedText type="body" style={styles.featureIcon}>
                🤝
              </ThemedText>
              <ThemedText type="body" style={[styles.featureText, { color: colors.text.secondary }]}>
                Outros usuários podem oferecer seus itens
              </ThemedText>
            </View>

            <View style={styles.featureItem}>
              <ThemedText type="body" style={styles.featureIcon}>
                📍
              </ThemedText>
              <ThemedText type="body" style={[styles.featureText, { color: colors.text.secondary }]}>
                Filtro por bairro para encontrar ajuda próxima
              </ThemedText>
            </View>
          </View>

          <ThemedText
            type="caption-1"
            style={[styles.footerNote, { color: colors.text.tertiary }]}
          >
            Fique de olho! Em breve essa funcionalidade estará disponível.
          </ThemedText>
        </LiquidGlassView>
      </ScrollView>
    </ThemedView>
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
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontWeight: '700',
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  comingSoonCard: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonTitle: {
    fontWeight: '700',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  comingSoonMessage: {
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 24,
  },
  featuresList: {
    width: '100%',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  featureIcon: {
    fontSize: 24,
    lineHeight: 24,
  },
  featureText: {
    flex: 1,
    lineHeight: 24,
  },
  footerNote: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.md,
  },
});

