import React from 'react';
import { TouchableOpacity, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientTypes } from '@/utils/gradients';
import { HapticFeedback } from '@/utils/haptics';
import { ThemedText } from './themed-text';
import { useColorScheme } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'premium';

type ButtonProps = {
  variant?: ButtonVariant;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: ViewStyle;
  fullWidth?: boolean;
};

export function Button({
  variant = 'primary',
  children,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handlePress = () => {
    if (disabled || loading) return;
    HapticFeedback.medium();
    onPress?.();
  };

  const getButtonContent = () => {
    if (variant === 'premium') {
      return (
        <LinearGradient
          colors={GradientTypes.premium.colors}
          start={GradientTypes.premium.start}
          end={GradientTypes.premium.end}
          style={[
            {
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
            },
            fullWidth && { width: '100%' },
            (disabled || loading) && { opacity: 0.6 },
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={{ color: 'white', fontWeight: '600', ...textStyle }}>
              {children}
            </ThemedText>
          )}
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
            {
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
            },
            fullWidth && { width: '100%' },
            (disabled || loading) && { opacity: 0.6 },
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={{ color: 'white', fontWeight: '600', ...textStyle }}>
              {children}
            </ThemedText>
          )}
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
            {
              paddingVertical: 16,
              paddingHorizontal: 24,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              borderWidth: 2,
              borderColor: '#96ff9a',
              backgroundColor: 'transparent',
            },
            fullWidth && { width: '100%' },
            (disabled || loading) && { opacity: 0.6 },
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#96ff9a" />
          ) : (
            <ThemedText
              style={{
                color: '#96ff9a',
                fontWeight: '600',
                ...textStyle,
              }}
            >
              {children}
            </ThemedText>
          )}
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
          {
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 48,
            backgroundColor: 'transparent',
          },
          fullWidth && { width: '100%' },
          (disabled || loading) && { opacity: 0.6 },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={isDark ? '#96ff9a' : '#11181C'}
          />
        ) : (
          <ThemedText
            type="title-small"
            style={{
              fontWeight: '600',
              ...textStyle,
            }}
          >
            {children}
          </ThemedText>
        )}
      </TouchableOpacity>
    );
  };

  if (variant === 'premium' || variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {getButtonContent()}
      </TouchableOpacity>
    );
  }

  return getButtonContent();
}

