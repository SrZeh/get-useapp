# Centralized Theming System

This document describes the centralized theming system used throughout the application.

## Overview

All theme colors and styling utilities are centralized in `utils/theme.ts` to ensure consistency, maintainability, and proper dark mode support across the entire application.

## Core Principles

1. **Single Source of Truth**: All colors come from `constants/theme.ts` and `constants/colors.ts`
2. **Theme-Aware Hooks**: Components use hooks like `useThemeColors()` instead of hardcoded colors
3. **Consistent Dark Mode**: All components automatically adapt to light/dark mode
4. **Type Safety**: Full TypeScript support with typed color objects

## Usage

### Basic Usage

```tsx
import { useThemeColors } from '@/utils/theme';

function MyComponent() {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.bg.primary }}>
      <Text style={{ color: colors.text.primary }}>Hello</Text>
    </View>
  );
}
```

### Available Color Categories

The `useThemeColors()` hook returns an object with the following structure:

```typescript
{
  // Text colors
  text: {
    primary: string;      // Main text color
    secondary: string;    // Secondary text
    tertiary: string;      // Tertiary text
    quaternary: string;   // Quaternary text (hints, labels)
  },
  
  // Background colors
  bg: {
    primary: string;      // Main background
    secondary: string;     // Secondary background
    tertiary: string;      // Tertiary background
  },
  
  // UI elements
  border: {
    default: string;      // Default border color
    alt: string;          // Alternative border color
  },
  
  card: {
    bg: string;           // Card background
  },
  
  input: {
    bg: string;           // Input background
    placeholder: string;   // Placeholder text color
  },
  
  // Brand colors (theme-agnostic)
  brand: {
    primary: string;      // #96ff9a
    secondary: string;     // #80e685
    tertiary: string;     // #6acc6f
    dark: string;         // #08af0e
    light: string;         // #b3ffb5
    glow: string;         // #ccffe0
  },
  
  // Semantic colors (theme-agnostic)
  semantic: {
    success: string;      // #08af0e
    error: string;        // #ef4444
    warning: string;      // #f59e0b
    info: string;         // #2563eb
  },
  
  // Icon colors
  icon: {
    default: string;      // Default icon color
    selected: string;     // Selected icon color
  },
  
  // Convenience flag
  isDark: boolean;        // True if dark mode is active
}
```

## Specialized Hooks

### Glass Effects

For components using glassmorphism effects:

```tsx
import { useGlassColors, useGlassBorders } from '@/utils/theme';

function GlassCard() {
  const glassColors = useGlassColors();
  const glassBorders = useGlassBorders();
  
  return (
    <View style={{
      backgroundColor: glassColors.standard,
      borderColor: glassBorders.standard,
    }}>
      {/* Content */}
    </View>
  );
}
```

Available glass intensities:
- `subtle`: Lightest glass effect
- `standard`: Default glass effect
- `strong`: Strongest glass effect
- `hover`: For interactive hover states
- `flat`: Flat background without glass

### Button Colors

For button components:

```tsx
import { useButtonColors } from '@/utils/theme';

function MyButton({ variant }: { variant: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' }) {
  const buttonColors = useButtonColors(variant);
  
  return (
    <TouchableOpacity style={{
      backgroundColor: buttonColors.bg,
      borderColor: buttonColors.border,
    }}>
      <Text style={{ color: buttonColors.text }}>Button</Text>
    </TouchableOpacity>
  );
}
```

### Chip Colors

For category chips and similar components:

```tsx
import { useChipColors } from '@/utils/theme';

function CategoryChip({ selected }: { selected: boolean }) {
  const chipColors = useChipColors(selected);
  
  return (
    <TouchableOpacity style={{
      backgroundColor: chipColors.bg,
      borderColor: chipColors.border,
    }}>
      <Text style={{ color: chipColors.text }}>Category</Text>
    </TouchableOpacity>
  );
}
```

### Theme Value Helper

For simple light/dark value selection:

```tsx
import { useThemeValue } from '@/utils/theme';

function MyComponent() {
  const backgroundColor = useThemeValue({
    light: '#ffffff',
    dark: '#151718',
  });
  
  return <View style={{ backgroundColor }} />;
}
```

## Migration Guide

### Before (Incorrect)

```tsx
import { useColorScheme } from 'react-native';

function Component() {
  const isDark = useColorScheme() === 'dark';
  
  return (
    <View style={{
      backgroundColor: isDark ? '#151718' : '#ffffff',
    }}>
      <Text style={{ color: isDark ? '#96ff9a' : '#11181C' }}>
        Hello
      </Text>
    </View>
  );
}
```

### After (Correct)

```tsx
import { useThemeColors } from '@/utils/theme';

function Component() {
  const colors = useThemeColors();
  
  return (
    <View style={{ backgroundColor: colors.bg.primary }}>
      <Text style={{ color: colors.text.primary }}>
        Hello
      </Text>
    </View>
  );
}
```

## Benefits

1. **Maintainability**: Change colors in one place (`constants/theme.ts`) and they update everywhere
2. **Consistency**: All components use the same color system
3. **Dark Mode**: Automatic dark mode support without manual checks
4. **Type Safety**: TypeScript catches color-related errors at compile time
5. **Discoverability**: Easy to find what colors are available through autocomplete
6. **Testing**: Easier to test themes by swapping color constants

## Components Updated

The following components have been migrated to use the centralized theme system:

- ✅ `CategoryChip` - Uses `useChipColors()`
- ✅ `Button` - Uses `useButtonColors()` and `useThemeColors()`
- ✅ `Card` - Uses `useGlassColors()` and `useGlassBorders()`
- ✅ `Input` - Uses `useThemeColors()`
- ✅ `Badge` - Uses `useThemeColors()`
- ✅ `ScrollableCategories` - Uses `useThemeColors()` and `useGlassColors()`

## Future Components

When creating new components:

1. **Always** import colors from `@/utils/theme`
2. **Never** hardcode color values (even for brand colors)
3. **Use** specialized hooks when available (`useGlassColors`, `useButtonColors`, etc.)
4. **Test** in both light and dark modes

## Theme Provider

The app uses `ThemeProvider` from `providers/ThemeProvider.tsx` which:
- Manages theme mode (light, dark, system)
- Persists user preference to AsyncStorage
- Provides theme context throughout the app

Components should use `useColorScheme()` from `@/providers/ThemeProvider` (or the convenience hooks from `@/utils/theme`) instead of React Native's `useColorScheme()` directly.

