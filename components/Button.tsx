import React, { useState } from 'react';
import { TouchableOpacity, ViewStyle, ActivityIndicator, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTypes, HapticFeedback, useThemeColors, useButtonColors, TEXT_ON_COLOR } from '@/utils';
import { ThemedText } from './themed-text';
import { AnimationConfigs, getSpringConfig } from '@/constants/animations';
import { Spacing, BorderRadius } from '@/constants/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'premium' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: ViewStyle;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  numberOfLines?: number;
};

const sizeMap: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; minHeight: number; fontSize: number }> = {
  sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.sm, minHeight: 44, fontSize: 15 }, // WCAG: Minimum 44x44px
  md: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, minHeight: 48, fontSize: 17 },
  lg: { paddingVertical: 20, paddingHorizontal: Spacing.lg, minHeight: 56, fontSize: 19 }, // 20px between sm (16) and md (24)
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  iconLeft,
  iconRight,
  accessibilityLabel,
  accessibilityHint,
  numberOfLines,
}: ButtonProps) {
  const colors = useThemeColors();
  // Get all button variant colors upfront (hooks must be called unconditionally)
  const primaryColors = useButtonColors('primary');
  const secondaryColors = useButtonColors('secondary');
  const ghostColors = useButtonColors('ghost');
  const outlineColors = useButtonColors('outline');
  const destructiveColors = useButtonColors('destructive');
  
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled || loading) return;
    HapticFeedback.light();
    const springConfig = getSpringConfig(
      AnimationConfigs.buttonPress.damping,
      AnimationConfigs.buttonPress.stiffness,
      0.5
    );
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    const springConfig = getSpringConfig(
      AnimationConfigs.buttonPress.damping,
      AnimationConfigs.buttonPress.stiffness,
      0.5
    );
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      ...springConfig,
    }).start();
  };

  const handlePress = () => {
    if (disabled || loading) return;
    HapticFeedback.medium();
    onPress?.();
  };

  const sizeStyles = sizeMap[size];

  const renderButtonContent = (textColor: string) => {
    if (loading) {
      return <ActivityIndicator color={textColor} />;
    }

    return (
      <>
        {iconLeft && <>{iconLeft}</>}
        <ThemedText
          style={{
            color: textColor,
            fontWeight: '600',
            fontSize: sizeStyles.fontSize,
            ...textStyle,
          }}
          numberOfLines={numberOfLines}
        >
          {children}
        </ThemedText>
        {iconRight && <>{iconRight}</>}
      </>
    );
  };

  const getButtonContent = () => {
    const baseStyle: ViewStyle = {
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      borderRadius: BorderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: sizeStyles.minHeight,
      flexDirection: 'row',
      gap: Spacing['2xs'],
    };

    if (variant === 'premium') {
      return (
        <LinearGradient
          colors={GradientTypes.premium.colors}
          start={GradientTypes.premium.start}
          end={GradientTypes.premium.end}
          style={[
            baseStyle,
            fullWidth && { width: '100%' },
            (disabled || loading) && { opacity: 0.6 },
            style,
          ]}
        >
          {renderButtonContent(TEXT_ON_COLOR.white)}
        </LinearGradient>
      );
    }

    if (variant === 'primary') {
      return (
        <LinearGradient
          colors={GradientTypes.brand.colors}
          start={GradientTypes.brand.start}
          end={GradientTypes.brand.end}
          style={[
            baseStyle,
            fullWidth && { width: '100%' },
            (disabled || loading) && { opacity: 0.6 },
            style,
          ]}
        >
          {renderButtonContent(TEXT_ON_COLOR.white)}
        </LinearGradient>
      );
    }

    if (variant === 'secondary') {
      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
              baseStyle,
              {
                borderWidth: 2,
                borderColor: secondaryColors.border,
                backgroundColor: secondaryColors.bg,
              },
              fullWidth && { width: '100%' },
              (disabled || loading) && { opacity: 0.6 },
              style,
            ]}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole="button"
            accessibilityState={{
              disabled: disabled || loading,
              busy: loading,
            }}
          >
            {renderButtonContent(secondaryColors.text)}
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (variant === 'outline') {
      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
              baseStyle,
              {
                borderWidth: 1,
                borderColor: outlineColors.border,
                backgroundColor: outlineColors.bg,
              },
              fullWidth && { width: '100%' },
              (disabled || loading) && { opacity: 0.6 },
              style,
            ]}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole="button"
            accessibilityState={{
              disabled: disabled || loading,
              busy: loading,
            }}
          >
            {renderButtonContent(outlineColors.text)}
          </TouchableOpacity>
        </Animated.View>
      );
    }

    if (variant === 'destructive') {
      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
              baseStyle,
              {
                backgroundColor: destructiveColors.bg,
              },
              fullWidth && { width: '100%' },
              (disabled || loading) && { opacity: 0.6 },
              style,
            ]}
            accessibilityLabel={accessibilityLabel}
            accessibilityHint={accessibilityHint}
            accessibilityRole="button"
            accessibilityState={{
              disabled: disabled || loading,
              busy: loading,
            }}
          >
            {renderButtonContent(destructiveColors.text)}
          </TouchableOpacity>
        </Animated.View>
      );
    }

    // Ghost variant
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
          style={[
            baseStyle,
            {
              backgroundColor: ghostColors.bg,
            },
            fullWidth && { width: '100%' },
            (disabled || loading) && { opacity: 0.6 },
            style,
          ]}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{
            disabled: disabled || loading,
            busy: loading,
          }}
        >
          {renderButtonContent(ghostColors.text)}
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (variant === 'premium' || variant === 'primary') {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          activeOpacity={0.8}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityRole="button"
          accessibilityState={{
            disabled: disabled || loading,
            busy: loading,
          }}
        >
          {getButtonContent()}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return getButtonContent();
}

