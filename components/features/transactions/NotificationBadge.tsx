/**
 * NotificationBadge - Red dot badge component for notifications
 * 
 * Displays a small red circular badge, typically used to indicate
 * unread or new items. Follows iOS design patterns.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeColors } from '@/utils';
import { Spacing } from '@/constants/spacing';

type NotificationBadgeProps = {
  /**
   * Whether to show the badge
   */
  visible?: boolean;

  /**
   * Size of the badge in pixels
   * @default 10
   */
  size?: number;
};

/**
 * NotificationBadge - Small red dot indicator
 */
export function NotificationBadge({ visible = true, size = 10 }: NotificationBadgeProps) {
  const colors = useThemeColors();

  if (!visible) return null;

  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.semantic.error,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    zIndex: 10,
  },
});

