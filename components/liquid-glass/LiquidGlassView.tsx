import React from 'react';
import { Platform, View, ViewStyle, StyleSheet } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/utils';
import { BlurView } from 'expo-blur';
import type { ViewProps } from 'react-native';

// Try to import expo-liquid-glass-view, but handle if it's not available
// Using proper types for conditional imports that may not exist
type ExpoLiquidGlassViewComponent = React.ComponentType<ViewProps>;
type LiquidGlassTypeEnum = { readonly [key: string]: string };
type CornerStyleEnum = { readonly [key: string]: string };

let ExpoLiquidGlassView: ExpoLiquidGlassViewComponent | null = null;
let LiquidGlassType: LiquidGlassTypeEnum | null = null;
let CornerStyle: CornerStyleEnum | null = null;

try {
  const module = require('expo-liquid-glass-view') as {
    ExpoLiquidGlassView?: ExpoLiquidGlassViewComponent;
    LiquidGlassType?: LiquidGlassTypeEnum;
    CornerStyle?: CornerStyleEnum;
  };
  ExpoLiquidGlassView = module.ExpoLiquidGlassView ?? null;
  LiquidGlassType = module.LiquidGlassType ?? null;
  CornerStyle = module.CornerStyle ?? null;
} catch {
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
  /** Custom opacity (0-1) for background. Overrides intensity-based opacity when provided. */
  opacity?: number;
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
  opacity,
  ...rest
}: LiquidGlassProps) {
  const colorScheme = useColorScheme();
  const colors = useThemeColors();
  const isDark = colors.isDark;

  // iOS: Use native liquid glass with iOS 26 materials (if available)
  if (Platform.OS === 'ios' && ExpoLiquidGlassView && LiquidGlassType && CornerStyle) {
    const blurTypeMap: Record<string, string | number> = {
      subtle: LiquidGlassType?.Clear || 0,
      standard: LiquidGlassType?.Regular || 1,
      strong: LiquidGlassType?.Interactive || 2,
    };

    const cornerStyleMap: Record<string, string | number> = {
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

    // Apply custom opacity if provided
    const iosBgColor = opacity !== undefined
      ? isDark
        ? `rgba(11, 18, 32, ${opacity})`
        : `rgba(255, 255, 255, ${opacity})`
      : undefined;

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
            ...(iosBgColor && { backgroundColor: iosBgColor }),
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
    // When custom opacity is very low, reduce blur intensity for better transparency
    const baseBlurIntensity = {
      subtle: 30,
      standard: 50,
      strong: 80,
    }[intensity];
    const blurIntensity = opacity !== undefined && opacity < 0.3 
      ? Math.max(15, baseBlurIntensity * (opacity / 0.3))
      : baseBlurIntensity;

    // For very low opacity, use 'light' tint to avoid dark overlay
    const blurTint = opacity !== undefined && opacity < 0.3
      ? 'light'
      : (tint === 'system' ? (isDark ? 'dark' : 'light') : tint);

    // Glass effect colors based on theme - use theme utilities
    const opacityValues = {
      subtle: 0.65,
      standard: 0.75,
      strong: 0.85,
    };
    const finalOpacity = opacity !== undefined ? opacity : opacityValues[intensity];
    const glassBg = isDark
      ? `rgba(11, 18, 32, ${finalOpacity})`
      : `rgba(255, 255, 255, ${opacity !== undefined ? opacity : (intensity === 'strong' ? 0.9 : intensity === 'standard' ? 0.8 : 0.7)})`;

    // For very low opacity (like 0.2), wrap BlurView in transparent container
    if (opacity !== undefined && opacity < 0.3) {
      return (
        <View
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
          <BlurView
            intensity={blurIntensity}
            tint={blurTint}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: cornerRadius,
            }}
          />
          <View style={{ flex: 1 }}>{children}</View>
        </View>
      );
    }

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
  const opacityValues = {
    subtle: 0.65,
    standard: 0.75,
    strong: 0.85,
  };
  const finalOpacity = opacity !== undefined ? opacity : opacityValues[intensity];
  
  // Adjust blur intensity for low opacity
  const baseBlur = intensity === 'strong' ? 24 : intensity === 'standard' ? 16 : 12;
  const blurAmount = opacity !== undefined && opacity < 0.3
    ? Math.max(8, baseBlur * (opacity / 0.3))
    : baseBlur;
  
  const webStyle: ViewStyle = {
    borderRadius: cornerRadius,
    overflow: 'hidden',
    backgroundColor: isDark
      ? `rgba(11, 18, 32, ${finalOpacity})`
      : `rgba(255, 255, 255, ${opacity !== undefined ? opacity : (intensity === 'strong' ? 0.9 : intensity === 'standard' ? 0.8 : 0.7)})`,
    borderWidth: borderWidth,
    borderColor: isDark
      ? `rgba(255, 255, 255, ${borderOpacity})`
      : `rgba(255, 255, 255, ${borderOpacity})`,
    // @ts-ignore - CSS properties for web
    backdropFilter: `blur(${blurAmount}px)`,
    WebkitBackdropFilter: `blur(${blurAmount}px)`,
    boxShadow: isDark
      ? '0 8px 32px rgba(0, 0, 0, 0.4)'
      : '0 8px 32px rgba(0, 0, 0, 0.1)',
  };

  // Adjust blur intensity for low opacity
  const baseBlurIntensity = intensity === 'strong' ? 80 : intensity === 'standard' ? 50 : 30;
  const blurIntensity = opacity !== undefined && opacity < 0.3
    ? Math.max(15, baseBlurIntensity * (opacity / 0.3))
    : baseBlurIntensity;
  
  // Use 'light' tint for very transparent views
  const blurTint = opacity !== undefined && opacity < 0.3
    ? 'light'
    : (isDark ? 'dark' : 'light');

  // For very low opacity (like 0.2), use View with backdrop-filter directly
  if (opacity !== undefined && opacity < 0.3 && Platform.OS === 'web') {
    return (
      <View
        style={[webStyle, style]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  // Use BlurView for web as well (better cross-platform support)
  return (
    <BlurView
      intensity={blurIntensity}
      tint={blurTint}
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

