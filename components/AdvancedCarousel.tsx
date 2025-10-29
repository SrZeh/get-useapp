import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

type AdvancedCarouselProps<T> = {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  itemWidth?: number;
  spacing?: number;
  showIndicators?: boolean;
  pagination?: boolean;
};

export function AdvancedCarousel<T>({
  data,
  renderItem,
  keyExtractor,
  autoPlay = false,
  autoPlayInterval = 3000,
  itemWidth,
  spacing = 12,
  showIndicators = true,
  pagination = true,
}: AdvancedCarouselProps<T>) {
  const { width: screenWidth } = useResponsive();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollX = useSharedValue(0);

  const calculatedWidth = itemWidth || screenWidth * 0.9;

  // Auto-play functionality
  useEffect(() => {
    if (!autoPlay || data.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % data.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeIndex, autoPlay, autoPlayInterval, data.length]);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = event.nativeEvent.contentOffset.x;
    const index = Math.round(
      event.nativeEvent.contentOffset.x / (calculatedWidth + spacing)
    );
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
    setActiveIndex(index);
  };

  return (
    <View>
      <FlatList
        ref={flatListRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={({ item, index }) => (
          <View style={{ width: calculatedWidth, marginRight: spacing }}>
            {renderItem(item, index)}
          </View>
        )}
        contentContainerStyle={{ paddingHorizontal: spacing }}
        onScroll={onScroll}
        scrollEventThrottle={16}
        getItemLayout={(_, index) => ({
          length: calculatedWidth + spacing,
          offset: (calculatedWidth + spacing) * index,
          index,
        })}
      />

      {showIndicators && data.length > 1 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            marginTop: 16,
          }}
        >
          {data.map((_, index) => (
            <IndicatorDot
              key={index}
              index={index}
              activeIndex={activeIndex}
              scrollX={scrollX}
              itemWidth={calculatedWidth + spacing}
              onPress={() => scrollToIndex(index)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// Animated indicator dot
function IndicatorDot({
  index,
  activeIndex,
  scrollX,
  itemWidth,
  onPress,
}: {
  index: number;
  activeIndex: number;
  scrollX: Animated.SharedValue<number>;
  itemWidth: number;
  onPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * itemWidth,
      index * itemWidth,
      (index + 1) * itemWidth,
    ];

    const width = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      'clamp'
    );

    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.5, 1, 0.5],
      'clamp'
    );

    return {
      width: withTiming(width, { duration: 200 }),
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Animated.View
        style={[
          {
            height: 8,
            borderRadius: 4,
            backgroundColor: index === activeIndex ? '#96ff9a' : '#d1d5db',
          },
          animatedStyle,
        ]}
      />
    </TouchableOpacity>
  );
}

