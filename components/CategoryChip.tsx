import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { HapticFeedback } from '@/utils/haptics';
import { ThemedText } from './themed-text';
import { useColorScheme } from 'react-native';

type CategoryChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function CategoryChip({
  label,
  selected = false,
  onPress,
  style,
}: CategoryChipProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9999,
    borderWidth: 1,
    marginRight: 8,
    backgroundColor: selected 
      ? (isDark ? '#96ff9a' : '#08af0e') // Darker green in light mode for better contrast
      : 'transparent',
    borderColor: selected
      ? 'transparent'
      : isDark
        ? '#374151'
        : '#e5e7eb',
  };

  return (
    <Animated.View style={[animatedStyle, { marginRight: 8 }]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={[chipStyle, style]}
      >
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

