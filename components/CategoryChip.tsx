import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { HapticFeedback, useChipColors } from '@/utils';
import { ThemedText } from './themed-text';
import { Spacing, BorderRadius } from '@/constants/spacing';

type CategoryChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function CategoryChip({
  label,
  selected = false,
  onPress,
  style,
  icon,
}: CategoryChipProps) {
  const chipColors = useChipColors(selected);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  const handlePress = () => {
    HapticFeedback.selection();
    onPress();
  };

  const chipStyle: ViewStyle = {
    paddingVertical: Spacing['2xs'],
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing['2xs'],
    backgroundColor: chipColors.bg,
    borderColor: chipColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2xs'],
    minHeight: 44, // WCAG: Minimum touch target size
    minWidth: 44, // WCAG: Minimum touch target size
  };

  return (
    <Animated.View style={[animatedStyle]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[chipStyle, style]}
        accessibilityRole="button"
        accessibilityLabel={selected ? `${label}, selecionado` : label}
        accessibilityState={{ selected }}
        accessibilityHint="Toque duas vezes para selecionar ou desmarcar esta categoria"
      >
        {icon && (
          <Ionicons
            name={icon}
            size={16}
            color={chipColors.icon}
          />
        )}
        <ThemedText
          type="caption-1"
          style={{ color: chipColors.text }}
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

