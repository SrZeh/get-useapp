import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

type ScreenTransitionLayerProps = {
  transitionKey: string;
  duration?: number;
  delay?: number;
  backgroundColor?: string;
  children: React.ReactNode;
};

const DEFAULT_DURATION = 4000;

export function ScreenTransitionLayer({
  transitionKey,
  duration = DEFAULT_DURATION,
  delay = 0,
  backgroundColor = 'transparent',
  children,
}: ScreenTransitionLayerProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      Math.max(delay, 0),
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [delay, duration, progress, transitionKey]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: progress.value,
    transform: [
      {
        translateY: (1 - progress.value) * 24,
      },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, { backgroundColor }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 2,
  },
});

