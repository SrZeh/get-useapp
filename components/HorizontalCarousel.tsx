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
import { useThemeColors } from '@/utils/theme';
import { Spacing, BorderRadius } from '@/constants/spacing';

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
  spacing = Spacing.xs, // 12px
  showIndicators = true,
  useLiquidGlass = true,
  snapToInterval = true,
}: HorizontalCarouselProps) {
  const { width: screenWidth } = useResponsive();
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const colors = useThemeColors();

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
          style={{ marginBottom: Spacing.sm, paddingHorizontal: Spacing.sm }}
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
          paddingHorizontal: Spacing.sm,
          paddingRight: Spacing.lg,
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
            gap: Spacing['2xs'],
            marginTop: Spacing.xs,
            paddingHorizontal: Spacing.sm,
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
                  width: index === activeIndex ? Spacing.md : Spacing['2xs'],
                  height: Spacing['2xs'],
                  borderRadius: BorderRadius['2xs'],
                  backgroundColor:
                    index === activeIndex ? colors.brand.primary : colors.border.default,
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

