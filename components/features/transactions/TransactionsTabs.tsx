/**
 * TransactionsTabs - Tab switcher component for transactions screen
 * 
 * Handles tab switching between "Minhas reservas" (renter) and "Recebidas" (owner)
 * with animated sliding pill indicator.
 * 
 * Extracted from route file to follow thin route pattern.
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, LayoutChangeEvent } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { LiquidGlassView } from '@/components/liquid-glass';
import { useThemeColors } from '@/utils/theme';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { getSpringConfig } from '@/constants/animations';
import { HapticFeedback } from '@/utils';
import { OwnerInbox } from './OwnerInbox';
import { MyReservations } from './MyReservations';

type TransactionsTab = 'owner' | 'renter';

interface TransactionsTabsProps {
  defaultTab?: TransactionsTab;
}

/**
 * TransactionsTabs component with animated tab switching
 */
export function TransactionsTabs({ defaultTab = 'renter' }: TransactionsTabsProps) {
  const [tab, setTab] = useState<TransactionsTab>(defaultTab);
  const colors = useThemeColors();

  // Theme-aware brand color: use dark green in light mode for contrast, light green in dark mode
  const brandColor = colors.isDark ? colors.brand.primary : colors.brand.dark;

  // Animation for sliding pill - track position and width separately
  const slidePosition = useRef(new Animated.Value(0)).current;
  const slideWidth = useRef(new Animated.Value(0)).current;
  const tab0Layout = useRef({ width: 0, x: 0 });
  const tab1Layout = useRef({ width: 0, x: 0 });

  // Update animation when tab changes
  useEffect(() => {
    const target = tab === 'renter' ? tab0Layout.current : tab1Layout.current;

    Animated.parallel([
      Animated.spring(slidePosition, {
        toValue: target.x,
        useNativeDriver: false, // Can't use native driver for width animations
        ...getSpringConfig(20, 300),
      }),
      Animated.spring(slideWidth, {
        toValue: target.width,
        useNativeDriver: false,
        ...getSpringConfig(20, 300),
      }),
    ]).start();
  }, [tab, slidePosition, slideWidth]);

  const handleTabLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout;
    if (index === 0) {
      tab0Layout.current = { width, x };
      if (tab === 'renter') {
        slidePosition.setValue(x);
        slideWidth.setValue(width);
      }
    } else {
      tab1Layout.current = { width, x };
      if (tab === 'owner') {
        slidePosition.setValue(x);
        slideWidth.setValue(width);
      }
    }
  };

  const handleTabChange = (newTab: TransactionsTab) => {
    HapticFeedback.selection();
    setTab(newTab);
  };

  return (
    <>
      <View
        style={{
          padding: Spacing.sm,
          paddingBottom: Spacing['2xs'],
          marginTop: Spacing['2xl'],
        }}
      >
        <LiquidGlassView
          intensity="standard"
          cornerRadius={BorderRadius.xl}
          style={{
            padding: Spacing['3xs'],
            position: 'relative',
          }}
        >
          <View style={{ flexDirection: 'row', position: 'relative' }}>
            {/* Sliding Pill Indicator */}
            <Animated.View
              style={{
                position: 'absolute',
                left: slidePosition,
                top: 0,
                bottom: 0,
                height: '100%',
                width: slideWidth,
                backgroundColor: brandColor,
                borderRadius: BorderRadius.lg,
                opacity: 0.2,
              }}
            />

            {/* Tab Buttons */}
            <TouchableOpacity
              onPress={() => handleTabChange('renter')}
              onLayout={handleTabLayout(0)}
              style={{
                flex: 1,
                paddingVertical: Spacing.xs,
                paddingHorizontal: Spacing.sm,
                zIndex: 1,
              }}
            >
              <ThemedText
                type={tab === 'renter' ? 'defaultSemiBold' : 'default'}
                style={{
                  textAlign: 'center',
                  color: tab === 'renter' ? brandColor : colors.text.secondary,
                }}
              >
                Minhas reservas
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabChange('owner')}
              onLayout={handleTabLayout(1)}
              style={{
                flex: 1,
                paddingVertical: Spacing.xs,
                paddingHorizontal: Spacing.sm,
                zIndex: 1,
              }}
            >
              <ThemedText
                type={tab === 'owner' ? 'defaultSemiBold' : 'default'}
                style={{
                  textAlign: 'center',
                  color: tab === 'owner' ? brandColor : colors.text.secondary,
                }}
              >
                Recebidas
              </ThemedText>
            </TouchableOpacity>
          </View>
        </LiquidGlassView>
      </View>
      {tab === 'owner' ? <OwnerInbox /> : <MyReservations />}
    </>
  );
}

