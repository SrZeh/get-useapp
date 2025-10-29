/**
 * Loading Overlay Component
 * 
 * Full-screen or container overlay with loading spinner and optional message.
 * Uses glass effect for modern appearance.
 */

import React from 'react';
import { View, Modal, ViewStyle, StyleSheet, TouchableOpacity } from 'react-native';
import { useThemeColors } from '@/utils';
import { LoadingSpinner } from './LoadingSpinner';
import { ThemedText } from './themed-text';
import { LiquidGlassView } from './liquid-glass';
import { Spacing, BorderRadius } from '@/constants/spacing';

type LoadingOverlayProps = {
  /** Whether overlay is visible */
  visible: boolean;
  
  /** Loading message */
  message?: string;
  
  /** Full screen overlay or container-level */
  fullScreen?: boolean;
  
  /** Allow dismissing by tapping outside */
  dismissible?: boolean;
  
  /** On dismiss callback */
  onDismiss?: () => void;
  
  /** Custom style */
  style?: ViewStyle;
  
  /** Container style */
  containerStyle?: ViewStyle;
  
  /** Size of spinner */
  spinnerSize?: 'small' | 'medium' | 'large';
  
  /** Show glass effect */
  useGlassEffect?: boolean;
};

/**
 * Loading Overlay Component
 */
export function LoadingOverlay({
  visible,
  message,
  fullScreen = false,
  dismissible = false,
  onDismiss,
  style,
  containerStyle,
  spinnerSize = 'medium',
  useGlassEffect = true,
}: LoadingOverlayProps) {
  const colors = useThemeColors();

  const content = (
    <View
      style={[
        fullScreen ? styles.fullScreen : styles.container,
        {
          backgroundColor: fullScreen 
            ? 'rgba(0, 0, 0, 0.6)' 
            : 'rgba(0, 0, 0, 0.4)',
        },
        style,
      ]}
    >
      {useGlassEffect ? (
        <LiquidGlassView
          intensity="standard"
          cornerRadius={BorderRadius.xl}
          style={[
            styles.glassContent,
            containerStyle,
          ]}
        >
          <LoadingSpinner
            size={spinnerSize}
            label={message}
            accessibilityLabel={message || 'Carregando'}
          />
        </LiquidGlassView>
      ) : (
        <View
          style={[
            styles.content,
            {
              backgroundColor: colors.bg.secondary,
              borderRadius: BorderRadius.xl,
              padding: Spacing.lg,
            },
            containerStyle,
          ]}
        >
          <LoadingSpinner
            size={spinnerSize}
            label={message}
            accessibilityLabel={message || 'Carregando'}
          />
        </View>
      )}
    </View>
  );

  if (fullScreen) {
    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={dismissible ? onDismiss : undefined}
      >
        {dismissible ? (
          <TouchableOpacity
            activeOpacity={1}
            onPress={onDismiss}
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Fechar overlay de carregamento"
          >
            {content}
          </TouchableOpacity>
        ) : (
          content
        )}
      </Modal>
    );
  }

  if (!visible) {
    return null;
  }

  return dismissible ? (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onDismiss}
      style={StyleSheet.absoluteFill}
      accessibilityLabel="Fechar overlay de carregamento"
    >
      {content}
    </TouchableOpacity>
  ) : (
    content
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  glassContent: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 120,
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    minHeight: 120,
  },
});

/**
 * Loading Overlay with default export
 */
export default LoadingOverlay;

