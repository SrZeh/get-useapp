/**
 * HeaderLogo Component
 * 
 * Reusable logo icon component for headers.
 * Used in root layout and tab layout.
 */

import React from 'react';
import { Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';

interface HeaderLogoProps {
  /**
   * Margin left spacing (for tab layout positioning)
   * @default 0
   */
  marginLeft?: number;
}

/**
 * Logo icon that links to home
 */
export function HeaderLogo({ marginLeft = 0 }: HeaderLogoProps) {
  return (
    <Link href="/" asChild>
      <Pressable
        accessibilityRole="link"
        style={{ 
          alignItems: "center", 
          justifyContent: "center",
          marginLeft: Platform.OS === 'web' ? 0 : marginLeft,
        }}
        android_ripple={{ borderless: true }}
        accessibilityLabel="Get & Use"
      >
        <Image
          source={require("@/assets/images/logo.png")}
          style={{ width: 28, height: 28 }}
          contentFit="contain"
          transition={200}
        />
      </Pressable>
    </Link>
  );
}

