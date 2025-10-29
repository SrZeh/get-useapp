/**
 * Enhanced Image Component
 * 
 * Wrapper around expo-image with error handling, placeholders, and fallbacks.
 * Follows design system guidelines for image loading states and accessibility.
 */

import React, { useState, type ReactNode } from 'react';
import { View, ViewStyle, StyleSheet, ActivityIndicator } from 'react-native';
import { Image as ExpoImage, ImageContentFit, ImageTransition } from 'expo-image';
import { ThemedText } from './themed-text';
import { ShimmerLoader } from './ShimmerLoader';
import { useThemeColors } from '@/utils';
import { Ionicons } from '@expo/vector-icons';
import { Spacing, BorderRadius } from '@/constants/spacing';

type ImageVariant = 'default' | 'thumbnail' | 'avatar' | 'hero' | 'card';

type EnhancedImageProps = {
  /** Image source URI or require() */
  source: string | number | { uri: string };
  
  /** Image variant (determines default size and style) */
  variant?: ImageVariant;
  
  /** Custom width */
  width?: number | string;
  
  /** Custom height */
  height?: number | string;
  
  /** Content fit mode */
  contentFit?: ImageContentFit;
  
  /** Border radius */
  borderRadius?: number;
  
  /** Custom style */
  style?: ViewStyle;
  
  /** Custom container style */
  containerStyle?: ViewStyle;
  
  /** Transition duration in milliseconds */
  transition?: number;
  
  /** Loading placeholder (ShimmerLoader by default) */
  loadingPlaceholder?: ReactNode;
  
  /** Error fallback (icon + text by default) */
  errorFallback?: ReactNode;
  
  /** Alt text for accessibility */
  alt?: string;
  
  /** Accessibility label */
  accessibilityLabel?: string;
  
  /** Priority loading (higher priority images load first) */
  priority?: 'low' | 'normal' | 'high';
  
  /** Cache policy */
  cachePolicy?: 'none' | 'disk' | 'memory' | 'memory-disk';
  
  /** Blur hash for placeholder while loading */
  blurhash?: string;
  
  /** On error callback */
  onError?: (error: Error) => void;
  
  /** On load callback */
  onLoad?: () => void;
};

/**
 * Variant-specific defaults
 */
const variantConfigs: Record<
  ImageVariant,
  { width: number | string; height: number | string; borderRadius: number }
> = {
  default: { width: '100%', height: 200, borderRadius: BorderRadius.sm },
  thumbnail: { width: 80, height: 80, borderRadius: BorderRadius.xs },
  avatar: { width: 48, height: 48, borderRadius: BorderRadius.xl },
  hero: { width: '100%', height: 300, borderRadius: 0 },
  card: { width: '100%', height: 200, borderRadius: BorderRadius.md },
};

/**
 * Enhanced Image Component
 */
export function Image({
  source,
  variant = 'default',
  width,
  height,
  contentFit = 'cover',
  borderRadius,
  style,
  containerStyle,
  transition = 200,
  loadingPlaceholder,
  errorFallback,
  alt,
  accessibilityLabel,
  priority = 'normal',
  cachePolicy = 'memory-disk',
  blurhash,
  onError,
  onLoad,
}: EnhancedImageProps) {
  const colors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const variantConfig = variantConfigs[variant];
  const finalWidth = width ?? variantConfig.width;
  const finalHeight = height ?? variantConfig.height;
  const finalBorderRadius = borderRadius ?? variantConfig.borderRadius;

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    onLoad?.();
  };

  const handleError = (error: Error) => {
    setLoading(false);
    setError(error);
    onError?.(error);
  };

  const renderLoading = () => {
    if (loadingPlaceholder) {
      return loadingPlaceholder;
    }

    return (
      <ShimmerLoader
        width={finalWidth}
        height={typeof finalHeight === 'number' ? finalHeight : 200}
        borderRadius={finalBorderRadius}
        style={StyleSheet.absoluteFill}
      />
    );
  };

  const renderError = () => {
    if (errorFallback) {
      return errorFallback;
    }

    const errorWidth = typeof finalWidth === 'number' ? finalWidth : 200;
    const errorHeight = typeof finalHeight === 'number' ? finalHeight : 200;

    return (
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: colors.bg.tertiary,
            borderRadius: finalBorderRadius,
            alignItems: 'center',
            justifyContent: 'center',
            gap: Spacing['2xs'],
          },
        ]}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel || alt || 'Image failed to load'}
      >
        <Ionicons
          name="image-outline"
          size={Math.min(errorWidth * 0.2, 48)}
          color={colors.text.tertiary}
        />
        <ThemedText
          type="caption-2"
          style={{ color: colors.text.tertiary }}
        >
          Imagem não disponível
        </ThemedText>
      </View>
    );
  };

  if (error) {
    return (
      <View
        style={[
          {
            width: finalWidth,
            height: finalHeight,
            overflow: 'hidden',
          },
          containerStyle,
        ]}
      >
        {renderError()}
      </View>
    );
  }

  const imageSource = typeof source === 'string' 
    ? { uri: source }
    : typeof source === 'number'
    ? source
    : source;

  return (
    <View
      style={[
        {
          width: finalWidth,
          height: finalHeight,
          overflow: 'hidden',
          position: 'relative',
        },
        containerStyle,
      ]}
    >
      {loading && renderLoading()}
      
      <ExpoImage
        source={imageSource}
        style={[
          {
            width: '100%',
            height: '100%',
            borderRadius: finalBorderRadius,
          },
          style,
        ]}
        contentFit={contentFit}
        transition={transition as ImageTransition}
        onLoadStart={handleLoadStart}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
        priority={priority}
        cachePolicy={cachePolicy}
        blurhash={blurhash}
        accessibilityLabel={accessibilityLabel || alt || 'Image'}
        accessibilityRole="image"
        accessibilityHint={alt ? `Description: ${alt}` : undefined}
      />
    </View>
  );
}

/**
 * Image component with default exports
 */
export default Image;

