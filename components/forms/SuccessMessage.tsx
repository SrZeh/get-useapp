/**
 * Success message component
 * Displays success feedback with icon and message
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/utils';
import { Spacing, BorderRadius } from '@/constants/spacing';

type SuccessMessageProps = {
  message: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissAfter?: number;
};

/**
 * Success message component for form feedback
 */
export function SuccessMessage({
  message,
  onDismiss,
  autoDismiss = false,
  dismissAfter = 5000,
}: SuccessMessageProps) {
  const colors = useThemeColors();
  const [visible, setVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoDismiss && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, dismissAfter);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, visible, dismissAfter, onDismiss]);

  if (!visible) return null;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.semantic.success + '20',
          borderColor: colors.semantic.success,
        },
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons
        name="checkmark-circle"
        size={24}
        color={colors.semantic.success}
        style={styles.icon}
      />
      <ThemedText
        style={[
          styles.message,
          {
            color: colors.semantic.success,
          },
        ]}
      >
        {message}
      </ThemedText>
      {onDismiss && (
        <Ionicons
          name="close"
          size={20}
          color={colors.semantic.success}
          style={styles.closeIcon}
          onPress={() => {
            setVisible(false);
            onDismiss();
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  icon: {
    marginRight: Spacing['3xs'],
  },
  message: {
    flex: 1,
    fontWeight: '500',
  },
  closeIcon: {
    marginLeft: Spacing['3xs'],
  },
});

