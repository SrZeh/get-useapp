import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';
import { Fonts } from '@/constants/theme';

/**
 * Typography types aligned with iOS 26 Human Interface Guidelines
 * Uses SF Pro font family (system default on iOS)
 * Supports Dynamic Type and accessibility
 * 
 * iOS Font System:
 * - SF Pro Display (for large sizes, 34pt+)
 * - SF Pro Text (for body text, <34pt)
 * - Automatically uses system font on iOS, SF Pro on web
 */
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default' // Body (17pt)
    | 'title' // Large Title (34pt) - backwards compatibility
    | 'defaultSemiBold' // Headline (17pt, Semi-Bold) - backwards compatibility
    | 'subtitle' // Title 1 (28pt) - backwards compatibility
    | 'link' // Body link style
    // iOS 26 Typography Scale
    | 'large-title' // 34pt, Bold
    | 'title-1' // 28pt, Regular
    | 'title-2' // 22pt, Regular
    | 'title-3' // 20pt, Regular
    | 'headline' // 17pt, Semi-Bold
    | 'body' // 17pt, Regular
    | 'callout' // 16pt, Regular
    | 'subhead' // 15pt, Regular
    | 'footnote' // 13pt, Regular
    | 'caption-1' // 12pt, Regular
    | 'caption-2'; // 11pt, Regular
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  return (
    <Text
      style={[
        { color },
        // Legacy types (backwards compatibility)
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        // iOS 26 Typography Scale
        type === 'large-title' ? styles.largeTitle : undefined,
        type === 'title-1' ? styles.title1 : undefined,
        type === 'title-2' ? styles.title2 : undefined,
        type === 'title-3' ? styles.title3 : undefined,
        type === 'headline' ? styles.headline : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'callout' ? styles.callout : undefined,
        type === 'subhead' ? styles.subhead : undefined,
        type === 'footnote' ? styles.footnote : undefined,
        type === 'caption-1' ? styles.caption1 : undefined,
        type === 'caption-2' ? styles.caption2 : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

/**
 * Uses Fonts configuration from constants/theme.ts
 * SF Pro Display for headings and large text (19pt+)
 * SF Pro Text for body text (18pt and below)
 */
const SF_PRO_DISPLAY = Fonts?.sans || 'SF Pro Display';
const SF_PRO_TEXT = Fonts?.text || 'SF Pro Text';

const styles = StyleSheet.create({
  // Legacy styles (backwards compatibility)
  default: {
    fontSize: 17, // iOS Body default
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
  },
  defaultSemiBold: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: SF_PRO_TEXT,
  },
  title: {
    fontSize: 34, // Maps to Large Title
    fontWeight: '700',
    lineHeight: 41,
    fontFamily: SF_PRO_DISPLAY,
    letterSpacing: 0.37,
  },
  subtitle: {
    fontSize: 28, // Maps to Title 1
    fontWeight: '400',
    lineHeight: 34,
    fontFamily: SF_PRO_DISPLAY,
    letterSpacing: 0.36,
  },
  link: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    color: '#0a7ea4', // Keep as link blue - could use colors.semantic.info but link blue is standard
    fontFamily: SF_PRO_TEXT,
  },
  // iOS 26 Typography Scale (official Apple HIG)
  largeTitle: {
    fontSize: 34,
    lineHeight: 41,
    fontWeight: '700',
    fontFamily: SF_PRO_DISPLAY,
    letterSpacing: 0.37,
  },
  title1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '400',
    fontFamily: SF_PRO_DISPLAY,
    letterSpacing: 0.36,
  },
  title2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: 0.35,
  },
  title3: {
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: 0.38,
  },
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: -0.41,
  },
  body: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: -0.41,
  },
  callout: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: -0.32,
  },
  subhead: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: -0.24,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: -0.08,
  },
  caption1: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: 0,
  },
  caption2: {
    fontSize: 11,
    lineHeight: 13,
    fontWeight: '400',
    fontFamily: SF_PRO_TEXT,
    letterSpacing: 0.07,
  },
});
