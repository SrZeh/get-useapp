import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { Button } from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';

type EmptyStateVariant = 'default' | 'minimal' | 'detailed' | 'withAction';
type EmptyStateIconType = 'emoji' | 'ionicon';

type EmptyStateProps = {
  /** Empty state message */
  message: string;
  
  /** Optional secondary message */
  secondaryMessage?: string;
  
  /** Icon to display (emoji string or Ionicons name) */
  icon?: string;
  
  /** Icon type */
  iconType?: EmptyStateIconType;
  
  /** Action button label */
  actionLabel?: string;
  
  /** Action button callback */
  onAction?: () => void;
  
  /** Custom style */
  style?: ViewStyle;
  
  /** Glass effect intensity */
  intensity?: 'subtle' | 'standard' | 'strong';
  
  /** Variant style */
  variant?: EmptyStateVariant;
  
  /** Custom icon component */
  customIcon?: React.ReactNode;
  
  /** Accessibility label */
  accessibilityLabel?: string;
};

/**
 * EmptyState component - displays an empty state message
 * 
 * Features:
 * - Consistent empty state styling
 * - Multiple variants (default, minimal, detailed, withAction)
 * - Optional action button
 * - Supports light/dark mode
 * - Liquid glass effect
 * - Full accessibility support
 * 
 * @example
 * ```tsx
 * <EmptyState
 *   message="Nenhum item encontrado"
 *   icon="📦"
 *   variant="withAction"
 *   actionLabel="Criar item"
 *   onAction={() => router.push('/item/new')}
 * />
 * ```
 */
export function EmptyState({
  message,
  secondaryMessage,
  icon,
  iconType = 'emoji',
  actionLabel,
  onAction,
  style,
  intensity = 'subtle',
  variant = 'default',
  customIcon,
  accessibilityLabel,
}: EmptyStateProps) {
  const colors = useThemeColors();
  
  const renderIcon = () => {
    if (customIcon) {
      return customIcon;
    }

    if (!icon) {
      return null;
    }

    if (iconType === 'ionicon') {
      return (
        <Ionicons
          name={icon as any}
          size={64}
          color={colors.text.tertiary}
          style={styles.icon}
        />
      );
    }

    return (
      <ThemedText type="large-title" style={styles.icon}>
        {icon}
      </ThemedText>
    );
  };

  const content = (
    <View
      style={[
        styles.container,
        variant === 'minimal' && styles.minimalContainer,
        style,
      ]}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel || message}
    >
      {renderIcon()}
      
      <ThemedText 
        type={variant === 'minimal' ? 'body' : 'title'}
        style={[
          styles.message,
          variant === 'minimal' && styles.minimalMessage,
        ]}
        className="text-light-text-secondary dark:text-dark-text-secondary"
      >
        {message}
      </ThemedText>
      
      {secondaryMessage && variant !== 'minimal' && (
        <ThemedText 
          type="body-small"
          style={styles.secondaryMessage}
          className="text-light-text-tertiary dark:text-dark-text-tertiary"
        >
          {secondaryMessage}
        </ThemedText>
      )}
      
      {variant === 'withAction' && actionLabel && onAction && (
        <Button 
          variant="primary" 
          onPress={onAction}
          style={styles.actionButton}
          accessibilityLabel={actionLabel}
        >
          {actionLabel}
        </Button>
      )}
      
      {variant !== 'withAction' && actionLabel && onAction && (
        <Button 
          variant="outline" 
          size="sm"
          onPress={onAction}
          style={styles.actionButton}
          accessibilityLabel={actionLabel}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );

  if (variant === 'minimal') {
    return content;
  }

  return (
    <LiquidGlassView 
      intensity={intensity} 
      cornerRadius={BorderRadius.md} 
      style={styles.glassContainer}
    >
      {content}
    </LiquidGlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  minimalContainer: {
    padding: Spacing.sm,
    gap: Spacing['2xs'],
  },
  glassContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  icon: {
    marginBottom: Spacing['2xs'],
  },
  message: {
    textAlign: 'center',
  },
  minimalMessage: {
    fontSize: 16, // callout size - acceptable override for minimal variant
  },
  secondaryMessage: {
    textAlign: 'center',
    marginTop: Spacing['3xs'],
  },
  actionButton: {
    marginTop: Spacing['2xs'],
    minWidth: 120,
  },
});

