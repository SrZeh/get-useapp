import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { HapticFeedback } from '@/utils/haptics';
import type { ViewProps } from 'react-native';

type AnimatedCardProps = ViewProps & {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

export function AnimatedCard({
  children,
  onPress,
  disabled = false,
  style,
  ...rest
}: AnimatedCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    HapticFeedback.light();
    scale.value = withSpring(0.96, { damping: 15 });
    opacity.value = withTiming(0.9, { duration: 100 });
  };

  const handlePressOut = () => {
    if (disabled) return;
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  if (!onPress) {
    return (
      <Animated.View style={[animatedStyle, style]} {...rest}>
        {children}
      </Animated.View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={1}
    >
      <Animated.View style={[animatedStyle, style]} {...rest}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}

