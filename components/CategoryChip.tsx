import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { HapticFeedback, useChipColors } from '@/utils';
import { ThemedText } from './themed-text';
import { Spacing, BorderRadius } from '@/constants/spacing';

type IconComponent = React.ComponentType<{ 
  width?: number; 
  height?: number; 
  color?: string; 
  fill?: string;
  stroke?: string;
}>;

type CategoryChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  icon?: string | IconComponent; // Support both legacy string and new component
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
          typeof icon === 'function' ? (
            (() => {
              const IconComponent = icon;
              return (
                <IconComponent
                  width={16}
                  height={16}
                  color={chipColors.icon}
                  fill={chipColors.icon}
                  stroke={chipColors.icon}
                />
              );
            })()
          ) : null
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

