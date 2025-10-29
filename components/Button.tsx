import React from 'react';
import { TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTypes, HapticFeedback, useThemeColors, useButtonColors } from '@/utils';
import { ThemedText } from './themed-text';

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
};

const sizeMap: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; minHeight: number; fontSize: number }> = {
  sm: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 40, fontSize: 15 },
  md: { paddingVertical: 16, paddingHorizontal: 24, minHeight: 48, fontSize: 17 },
  lg: { paddingVertical: 20, paddingHorizontal: 32, minHeight: 56, fontSize: 19 },
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
}: ButtonProps) {
  const colors = useThemeColors();
  // Get all button variant colors upfront (hooks must be called unconditionally)
  const primaryColors = useButtonColors('primary');
  const secondaryColors = useButtonColors('secondary');
  const ghostColors = useButtonColors('ghost');
  const outlineColors = useButtonColors('outline');
  const destructiveColors = useButtonColors('destructive');

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
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: sizeStyles.minHeight,
      flexDirection: 'row',
      gap: 8,
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
          {renderButtonContent('white')}
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
          {renderButtonContent('white')}
        </LinearGradient>
      );
    }

    if (variant === 'secondary') {
      return (
        <TouchableOpacity
          onPress={handlePress}
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
        >
          {renderButtonContent(secondaryColors.text)}
        </TouchableOpacity>
      );
    }

    if (variant === 'outline') {
      return (
        <TouchableOpacity
          onPress={handlePress}
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
        >
          {renderButtonContent(outlineColors.text)}
        </TouchableOpacity>
      );
    }

    if (variant === 'destructive') {
      return (
        <TouchableOpacity
          onPress={handlePress}
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
        >
          {renderButtonContent(destructiveColors.text)}
        </TouchableOpacity>
      );
    }

    // Ghost variant
    return (
      <TouchableOpacity
        onPress={handlePress}
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
      >
        {renderButtonContent(ghostColors.text)}
      </TouchableOpacity>
    );
  };

  if (variant === 'premium' || variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
      >
        {getButtonContent()}
      </TouchableOpacity>
    );
  }

  return getButtonContent();
}

