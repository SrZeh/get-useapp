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
    paddingVertical: 8, // py-2xs equivalent
    paddingHorizontal: 12, // px-xs equivalent
    borderRadius: 9999, // rounded-full equivalent
    borderWidth: 1,
    marginRight: 8, // mr-2xs equivalent
    backgroundColor: chipColors.bg,
    borderColor: chipColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
          lightColor={selected ? '#ffffff' : '#374151'} // White text on green for better contrast
          darkColor={selected ? '#11181C' : '#e5e7eb'} // Dark text on light green in dark mode
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    </Animated.View>
  );
}

