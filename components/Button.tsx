import React, { useState } from 'react';
import { TouchableOpacity, ViewStyle, ActivityIndicator, Animated } from 'react-native';
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
  sm: { paddingVertical: 12, paddingHorizontal: 16, minHeight: 44, fontSize: 15 }, // WCAG: Minimum 44x44px
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
  
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    if (disabled || loading) return;
    HapticFeedback.light();
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
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

