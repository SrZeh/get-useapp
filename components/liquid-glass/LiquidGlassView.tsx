import React from 'react';
import { Platform, View, ViewStyle, StyleSheet } from 'react-native';
import { useColorScheme } from 'react-native';
import { BlurView } from 'expo-blur';
import type { ViewProps } from 'react-native';

// Try to import expo-liquid-glass-view, but handle if it's not available
let ExpoLiquidGlassView: any;
let LiquidGlassType: any;
let CornerStyle: any;

try {
  const module = require('expo-liquid-glass-view');
  ExpoLiquidGlassView = module.ExpoLiquidGlassView;
  LiquidGlassType = module.LiquidGlassType;
  CornerStyle = module.CornerStyle;
} catch (error) {
  // Module not available, will use fallback
  ExpoLiquidGlassView = null;
}

type LiquidGlassProps = ViewProps & {
  children: React.ReactNode;
  intensity?: 'subtle' | 'standard' | 'strong';
  tint?: 'light' | 'dark' | 'system';
  cornerRadius?: number;
  cornerStyle?: 'circular' | 'continuous';
  /** Additional glass styling */
  borderWidth?: number;
  borderOpacity?: number;
};

export function LiquidGlassView({
  children,
  style,
  intensity = 'standard',
  tint = 'system',
  cornerRadius = 24,
  cornerStyle = 'continuous',
  borderWidth = 1,
  borderOpacity = 0.2,
  ...rest
}: LiquidGlassProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // iOS: Use native liquid glass with iOS 26 materials (if available)
  if (Platform.OS === 'ios' && ExpoLiquidGlassView && LiquidGlassType && CornerStyle) {
    const blurTypeMap: Record<string, any> = {
      subtle: LiquidGlassType?.Clear || 0,
      standard: LiquidGlassType?.Regular || 1,
      strong: LiquidGlassType?.Interactive || 2,
    };

    const cornerStyleMap: Record<string, any> = {
      circular: CornerStyle?.Circular || 0,
      continuous: CornerStyle?.Continuous || 1,
    };

    const tintColor =
      tint === 'system'
        ? isDark
          ? '#000000'
          : '#ffffff'
        : tint === 'dark'
          ? '#000000'
          : '#ffffff';

    return (
      <ExpoLiquidGlassView
        type={blurTypeMap[intensity]}
        tint={tintColor}
        cornerRadius={cornerRadius}
        cornerStyle={cornerStyleMap[cornerStyle]}
        style={[
          {
            borderRadius: cornerRadius,
            overflow: 'hidden',
            borderWidth: borderWidth,
            borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </ExpoLiquidGlassView>
    );
  }

  // Android: Use expo-blur with enhanced glass styling
  if (Platform.OS === 'android') {
    const blurIntensity = {
      subtle: 30,
      standard: 50,
      strong: 80,
    }[intensity];

    const blurTint = tint === 'system' ? (isDark ? 'dark' : 'light') : tint;

    // Glass effect colors based on theme
    const glassBg = isDark
      ? `rgba(21, 23, 24, ${intensity === 'strong' ? 0.85 : intensity === 'standard' ? 0.75 : 0.65})`
      : `rgba(255, 255, 255, ${intensity === 'strong' ? 0.9 : intensity === 'standard' ? 0.8 : 0.7})`;

    return (
      <BlurView
        intensity={blurIntensity}
        tint={blurTint}
        style={[
          styles.androidGlass,
          {
            borderRadius: cornerRadius,
            backgroundColor: glassBg,
            borderWidth: borderWidth,
            borderColor: isDark
              ? `rgba(255, 255, 255, ${borderOpacity})`
              : `rgba(255, 255, 255, ${borderOpacity})`,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </BlurView>
    );
  }

  // Web: Use CSS backdrop-filter with enhanced styling
  const webStyle: ViewStyle = {
    borderRadius: cornerRadius,
    overflow: 'hidden',
    backgroundColor: isDark
      ? `rgba(21, 23, 24, ${intensity === 'strong' ? 0.85 : intensity === 'standard' ? 0.75 : 0.65})`
      : `rgba(255, 255, 255, ${intensity === 'strong' ? 0.9 : intensity === 'standard' ? 0.8 : 0.7})`,
    borderWidth: borderWidth,
    borderColor: isDark
      ? `rgba(255, 255, 255, ${borderOpacity})`
      : `rgba(255, 255, 255, ${borderOpacity})`,
    // @ts-ignore - CSS properties for web
    backdropFilter: `blur(${intensity === 'strong' ? 24 : intensity === 'standard' ? 16 : 12}px)`,
    WebkitBackdropFilter: `blur(${intensity === 'strong' ? 24 : intensity === 'standard' ? 16 : 12}px)`,
    boxShadow: isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  };

  // Use BlurView for web as well (better cross-platform support)
  return (
    <BlurView
      intensity={intensity === 'strong' ? 80 : intensity === 'standard' ? 50 : 30}
      tint={isDark ? 'dark' : 'light'}
      style={[webStyle, style]}
      {...rest}
    >
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  androidGlass: {
    overflow: 'hidden',
    // Additional Android-specific styling
    elevation: 8, // Material Design elevation
  },
});

