import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColors } from '@/utils';

type ShimmerLoaderProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function ShimmerLoader({
  width = '100%',
  height = 100,
  borderRadius = 12,
  style,
}: ShimmerLoaderProps) {
  const colors = useThemeColors();
  const isDark = colors.isDark;

  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      false
    );
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            shimmer.value,
            [0, 1],
            [-200, 200]
          ),
        },
      ],
    };
  });

  const shimmerColors = isDark
    ? [
        'transparent',
        'rgba(150, 255, 154, 0.1)',
        'transparent',
      ]
    : [
        'transparent',
        'rgba(150, 255, 154, 0.3)',
        'transparent',
      ];

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.bg.tertiary,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '50%',
          },
          animatedStyle,
        ]}
      >
        <LinearGradient
          colors={shimmerColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

