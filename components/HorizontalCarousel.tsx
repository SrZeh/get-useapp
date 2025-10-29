import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useResponsive } from '@/hooks/useResponsive';
import { LiquidGlassView } from './liquid-glass';
import { ThemedText } from '@/components/themed-text';

type CarouselItem = {
  id: string;
  render: () => React.ReactNode;
};

type HorizontalCarouselProps = {
  items: CarouselItem[];
  title?: string;
  itemWidth?: number | 'auto';
  spacing?: number;
  showIndicators?: boolean;
  useLiquidGlass?: boolean;
  snapToInterval?: boolean;
};

export function HorizontalCarousel({
  items,
  title,
  itemWidth = 'auto',
  spacing = 12,
  showIndicators = true,
  useLiquidGlass = true,
  snapToInterval = true,
}: HorizontalCarouselProps) {
  const { width: screenWidth } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Calculate item width - for 'auto', don't constrain width (let content determine)
  const calculatedWidth = itemWidth === 'auto' ? undefined : itemWidth;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!snapToInterval || !calculatedWidth) return;

    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / (calculatedWidth + spacing));
    setActiveIndex(index);
  };

  const scrollToIndex = (index: number) => {
    if (!calculatedWidth) {
      // For auto-width items, scroll to approximate position
      scrollViewRef.current?.scrollTo({ x: index * 100, animated: true });
      return;
    }
    const offset = index * (calculatedWidth + spacing);
    scrollViewRef.current?.scrollTo({ x: offset, animated: true });
  };

  const content = (
    <>
      {title && (
        <ThemedText
          type="title"
          style={{ marginBottom: 16, paddingHorizontal: 16 }}
          className="text-light-text-primary dark:text-dark-text-primary"
        >
          {title}
        </ThemedText>
      )}

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={snapToInterval ? calculatedWidth + spacing : undefined}
        snapToAlignment="start"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingRight: 32,
          gap: spacing,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {items.map((item, index) => (
          <View
            key={item.id}
            style={{
              ...(calculatedWidth ? { width: calculatedWidth } : {}),
              marginRight: index === items.length - 1 ? 0 : spacing,
            }}
          >
            {item.render()}
          </View>
        ))}
      </ScrollView>

      {showIndicators && items.length > 1 && (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            gap: 8,
            marginTop: 12,
            paddingHorizontal: 16,
          }}
        >
          {items.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => scrollToIndex(index)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: index === activeIndex ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor:
                    index === activeIndex ? '#96ff9a' : '#d1d5db',
                  opacity: index === activeIndex ? 1 : 0.5,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </>
  );

  if (useLiquidGlass) {
    return (
      <LiquidGlassView intensity="subtle" cornerRadius={0}>
        {content}
      </LiquidGlassView>
    );
  }

  return <View>{content}</View>;
}

