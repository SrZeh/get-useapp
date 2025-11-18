import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import type { SvgProps } from 'react-native-svg';
import * as IconSet from '@/assets/icons/items';

type IconComponent = (props: SvgProps & { size?: number }) => JSX.Element;

type IconState = {
  key: string;
  Component: IconComponent;
  size: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  exitX: number;
  exitY: number;
  fromRotation: number;
  toRotation: number;
  exitRotation: number;
  fromScale: number;
  toScale: number;
  exitScale: number;
  peakOpacity: number;
  delayFraction: number;
};

const ICON_COMPONENTS: IconComponent[] = Object.values(IconSet);

type AnimatedItemsBackgroundProps = {
  seed: string;
  iconCount?: number;
  duration?: number;
  accentColor?: string;
};

const DEFAULT_DURATION = 4000;
const DEFAULT_ACCENT = 'rgba(150, 255, 154, 0.18)';

export function AnimatedItemsBackground({
  seed,
  iconCount = ICON_COMPONENTS.length,
  duration = DEFAULT_DURATION,
  accentColor = DEFAULT_ACCENT,
}: AnimatedItemsBackgroundProps) {
  const { width, height } = useWindowDimensions();
  const [states, setStates] = useState<IconState[]>([]);
  const [isActive, setIsActive] = useState(false);
  const progress = useSharedValue(0);

  const selectedIcons = useMemo(() => {
    if (iconCount >= ICON_COMPONENTS.length) {
      return ICON_COMPONENTS;
    }

    const hash = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const shuffled = [...ICON_COMPONENTS];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = (hash + i * 31) % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, iconCount);
  }, [iconCount, seed]);

  useEffect(() => {
    if (!width || !height) {
      return;
    }

    const goldenRatio = 1.618;
    const diagonal = Math.sqrt(width ** 2 + height ** 2);
    const iconArea = (width * height) / Math.max(iconCount, 1);
    const baseSize = Math.min(Math.sqrt(iconArea) * 1.05, diagonal / 3.2);
    const gridCols = Math.max(4, Math.ceil(Math.sqrt(iconCount * goldenRatio)));
    const gridRows = Math.max(4, Math.ceil(iconCount / (gridCols / goldenRatio)));
    const cellWidth = width / gridCols;
    const cellHeight = height / gridRows;
    const safePadding = Math.min(width, height) * 0.05;

    const createdStates = selectedIcons.map((Component, index) => {
      const random = Math.sin(hashSeed(seed, index)) * 10000;
      const normalized = random - Math.floor(random);

      const row = Math.floor(index / gridCols);
      const col = index % gridCols;

      const sizeVariation = 0.8 + ((normalized * 977) % 0.6);
      const iconSize = Math.min(baseSize * sizeVariation, safePadding + Math.min(cellWidth, cellHeight) * 1.1);

      const baseRotation = ((normalized * 1200) % 50) - 25;
      const fromRotation = baseRotation - (12 + ((normalized * 431) % 18));
      const exitRotation = baseRotation + (18 + ((normalized * 619) % 28));

      const jitterX = ((normalized * 1987) % (cellWidth * 0.3)) - cellWidth * 0.15;
      const jitterY = (((normalized * 2711) + index * 0.31) % (cellHeight * 0.3)) - cellHeight * 0.15;

      const cellCenterX = col * cellWidth + cellWidth / 2;
      const cellCenterY = row * cellHeight + cellHeight / 2;

      const targetX = clampToBounds(cellCenterX + jitterX, safePadding, width - safePadding) - iconSize / 2;
      const targetY = clampToBounds(cellCenterY + jitterY, safePadding, height - safePadding) - iconSize / 2;

      const fromOffsetX = ((normalized * 3313) % (width * 0.7)) - width * 0.35;
      const fromOffsetY = ((normalized * 4111) % (height * 0.7)) - height * 0.35;

      const exitOffsetX = ((normalized * 4999) % (width * 0.55)) - width * 0.275;
      const exitOffsetY = ((normalized * 5333) % (height * 0.55)) - height * 0.275;

      const fromX = targetX + fromOffsetX;
      const fromY = targetY + fromOffsetY;
      const exitX = targetX + exitOffsetX;
      const exitY = targetY + exitOffsetY;

      const fromScale = 0.45 + ((normalized * 811) % 0.25);
      const toScale = 0.95 + ((normalized * 463) % 0.25);
      const exitScale = 0.25 + ((normalized * 599) % 0.15);

      const peakOpacity = colorsByTheme(normalized);
      const delayFraction = ((normalized * 1571) % 0.22) + index * 0.006;

      return {
        key: `${Component.name}-${index}`,
        Component,
        size: iconSize,
        fromX,
        fromY,
        toX: targetX,
        toY: targetY,
        exitX,
        exitY,
        fromRotation,
        toRotation: baseRotation,
        exitRotation,
        fromScale,
        toScale,
        exitScale,
        peakOpacity,
        delayFraction: Math.min(delayFraction, 0.7),
      };
    });

    setStates(createdStates);
    setIsActive(true);
    progress.value = 0;
    progress.value = withTiming(1, {
      duration,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });

    const timeout = setTimeout(() => setIsActive(false), duration + 120);
    return () => {
      clearTimeout(timeout);
    };
  }, [duration, height, iconCount, progress, seed, selectedIcons, width]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.1, 0.6, 1], [0, 0.55, 0.55, 0], Extrapolation.CLAMP),
  }));

  if (!isActive || !width || !height) {
    return null;
  }

  return (
    <Animated.View pointerEvents="none" style={[styles.container, overlayStyle, { backgroundColor: accentColor }]}>
      {states.map((state) => (
        <AnimatedIcon key={state.key} state={state} progress={progress} />
      ))}
    </Animated.View>
  );
}

type AnimatedIconProps = {
  state: IconState;
  progress: SharedValue<number>;
};

const AnimatedIcon = React.memo(({ state, progress }: AnimatedIconProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const localProgress = normalizeProgress(progress.value, state.delayFraction);

    const translateX = interpolate(localProgress, [0, 0.5, 1], [state.fromX, state.toX, state.exitX], Extrapolation.CLAMP);
    const translateY = interpolate(localProgress, [0, 0.5, 1], [state.fromY, state.toY, state.exitY], Extrapolation.CLAMP);
    const rotation = interpolate(
      localProgress,
      [0, 0.5, 1],
      [state.fromRotation, state.toRotation, state.exitRotation],
      Extrapolation.CLAMP
    );
    const scale = interpolate(localProgress, [0, 0.45, 1], [state.fromScale, state.toScale, state.exitScale]);
    const opacity = interpolate(
      localProgress,
      [0, 0.18, 0.72, 1],
      [0, state.peakOpacity, state.peakOpacity, 0],
      Extrapolation.CLAMP
    );

    return {
      opacity,
      transform: [
        { translateX },
        { translateY },
        { rotate: `${rotation}deg` },
        { scale },
      ],
    };
  }, [progress, state]);

  const { Component, size } = state;

  return (
    <Animated.View style={[styles.icon, animatedStyle, { width: size, height: size }]}>
      <Component width={size} height={size} stroke="#96FF9A" fill="rgba(150, 255, 154, 0.25)" />
    </Animated.View>
  );
});

AnimatedIcon.displayName = 'AnimatedIcon';

function hashSeed(seed: string, index: number) {
  let hash = 0;
  const input = `${seed}-${index}`;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash || index + 1;
}

function clampToBounds(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeProgress(value: number, delayFraction: number) {
  'worklet';
  const clampedDelay = Math.min(Math.max(delayFraction, 0), 0.95);
  const span = 1 - clampedDelay || 0.0001;
  const normalized = (value - clampedDelay) / span;
  return Math.min(Math.max(normalized, 0), 1);
}

function colorsByTheme(seed: number) {
  const base = 0.38 + ((seed * 433) % 0.12);
  return Platform.OS === 'web' ? base + 0.08 : base;
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 3,
  },
  icon: {
    position: 'absolute',
  },
});

