import React from 'react';
import { View, TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { LiquidGlassView } from './liquid-glass';
import { useGlassColors, useGlassBorders } from '@/utils';
import type { BaseCardWithChildrenProps } from './types';
import { Spacing, BorderRadius } from '@/constants/spacing';

type CardVariant = 'standard' | 'hover' | 'flat';
type CardPadding = 'xs' | 'sm' | 'md' | 'lg';

type CardProps = BaseCardWithChildrenProps & {
  /**
   * Visual variant of the card
   */
  variant?: CardVariant;

  /**
   * Padding size
   */
  padding?: CardPadding;

  /**
   * Optional header content
   */
  header?: React.ReactNode;

  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
};

const paddingMap: Record<CardPadding, number> = {
  xs: Spacing.xs,
  sm: Spacing.sm,
  md: Spacing.md,
  lg: Spacing.lg,
};

export function Card({
  variant = 'standard',
  padding = 'md',
  children,
  onPress,
  header,
  footer,
  style,
  ...rest
}: CardProps) {
  const glassColors = useGlassColors();
  const glassBorders = useGlassBorders();
  const paddingValue = paddingMap[padding];

  const baseCardStyle: ViewStyle = {
    padding: paddingValue,
    borderRadius: BorderRadius.xl,
  };

  // Glass effect for standard variant
  if (variant === 'standard') {
    const content = (
      <>
        {header && <View style={styles.header}>{header}</View>}
        <View style={styles.content}>{children}</View>
        {footer && <View style={styles.footer}>{footer}</View>}
      </>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          style={[baseCardStyle, style]}
          accessibilityRole="button"
          accessibilityHint={rest.accessibilityHint || "Toque para interagir"}
          accessibilityLabel={rest.accessibilityLabel || "Cartão interativo"}
          accessibilityState={{
            disabled: rest.disabled === true,
          }}
          {...rest}
        >
          <LiquidGlassView
            intensity="standard"
            cornerRadius={BorderRadius.xl}
            style={StyleSheet.absoluteFill}
          >
            {content}
          </LiquidGlassView>
        </TouchableOpacity>
      );
    }

    return (
      <View
        style={[baseCardStyle, style]}
        accessibilityRole={rest.accessibilityRole}
        accessibilityLabel={rest.accessibilityLabel}
        accessibilityHint={rest.accessibilityHint}
        {...rest}
      >
        <LiquidGlassView
          intensity="standard"
          cornerRadius={24}
          style={StyleSheet.absoluteFill}
        >
          {content}
        </LiquidGlassView>
      </View>
    );
  }

  // Hover variant - interactive card with press effect
  if (variant === 'hover') {
    return (
        <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          baseCardStyle,
          {
            backgroundColor: glassColors.hover,
            borderWidth: 1,
            borderColor: glassBorders.subtle,
          },
          style,
        ]}
        accessibilityRole="button"
        accessibilityHint={rest.accessibilityHint || "Toque para interagir"}
        accessibilityLabel={rest.accessibilityLabel || "Cartão interativo"}
        accessibilityState={{
          disabled: rest.disabled === true,
        }}
        {...rest}
      >
        {header && <View style={styles.header}>{header}</View>}
        <View style={styles.content}>{children}</View>
        {footer && <View style={styles.footer}>{footer}</View>}
      </TouchableOpacity>
    );
  }

  // Flat variant - no glass effect, simple background
  return (
    <View
      style={[
        baseCardStyle,
        {
          backgroundColor: glassColors.flat,
        },
        style,
      ]}
      {...rest}
    >
      {header && <View style={styles.header}>{header}</View>}
      <View style={styles.content}>{children}</View>
      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: Spacing.sm,
  },
});

