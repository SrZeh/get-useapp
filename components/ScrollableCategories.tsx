import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ViewStyle,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { HapticFeedback } from '@/utils/haptics';

type ScrollableCategoriesProps = {
  children: React.ReactNode;
  style?: ViewStyle;
};

export function ScrollableCategories({
  children,
  style,
}: ScrollableCategoriesProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const scrollViewRef = useRef<ScrollView>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currentScrollX, setCurrentScrollX] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    
    const scrollable = contentSize.width > layoutMeasurement.width;
    const scrollX = contentOffset.x;
    const scrollWidth = layoutMeasurement.width;
    const totalWidth = contentSize.width;
    
    const atStart = scrollX <= 5; // 5px tolerance
    const atEnd = scrollX >= totalWidth - scrollWidth - 5; // 5px tolerance

    setCurrentScrollX(scrollX);
    setCanScrollLeft(scrollable && !atStart);
    setCanScrollRight(scrollable && !atEnd);
  };

  const handleContentSizeChange = (width: number) => {
    setContentWidth(width);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  // Update scroll buttons when dimensions or scroll position change
  useEffect(() => {
    if (contentWidth > 0 && containerWidth > 0) {
      const scrollable = contentWidth > containerWidth;
      const atStart = currentScrollX <= 5;
      const atEnd = currentScrollX >= contentWidth - containerWidth - 5;
      
      setCanScrollLeft(scrollable && !atStart);
      setCanScrollRight(scrollable && !atEnd);
    }
  }, [contentWidth, containerWidth, currentScrollX]);

  const scrollIncrementally = (direction: 'left' | 'right') => {
    HapticFeedback.selection();
    const scrollAmount = containerWidth * 0.75; // Scroll by 75% of visible width
    
    scrollViewRef.current?.scrollTo({
      x:
        direction === 'left'
          ? Math.max(0, currentScrollX - scrollAmount)
          : Math.min(
              contentWidth - containerWidth,
              currentScrollX + scrollAmount
            ),
      animated: true,
    });
  };

  return (
    <View style={{ position: 'relative', marginBottom: 12, ...style }}>
      {/* Left Arrow */}
      {canScrollLeft && (
        <TouchableOpacity
          onPress={() => scrollIncrementally('left')}
          activeOpacity={0.7}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: 40,
            zIndex: 10,
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 8,
            backgroundColor: isDark
              ? 'rgba(21, 23, 24, 0.95)'
              : 'rgba(255, 255, 255, 0.98)',
            shadowColor: '#000',
            shadowOffset: { width: 2, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={isDark ? '#96ff9a' : '#08af0e'}
          />
        </TouchableOpacity>
      )}

      {/* Scrollable Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        onLayout={handleLayout}
        contentContainerStyle={{
          paddingRight: 16,
          paddingLeft: 0,
        }}
        style={{
          marginHorizontal: 0,
        }}
      >
        {children}
      </ScrollView>

      {/* Right Arrow */}
      {canScrollRight && (
        <TouchableOpacity
          onPress={() => scrollIncrementally('right')}
          activeOpacity={0.7}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: 40,
            zIndex: 10,
            justifyContent: 'center',
            alignItems: 'flex-end',
            paddingRight: 8,
            backgroundColor: isDark
              ? 'rgba(21, 23, 24, 0.95)'
              : 'rgba(255, 255, 255, 0.98)',
            shadowColor: '#000',
            shadowOffset: { width: -2, height: 0 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={isDark ? '#96ff9a' : '#08af0e'}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

