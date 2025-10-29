import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Design system typography types aligned with iOS 26 Liquid Glass Design System
 */
export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | 'default' // body (16px)
    | 'title' // headline (32px)
    | 'defaultSemiBold' // body semibold (16px)
    | 'subtitle' // title-large (24px)
    | 'link' // body link style
    // Design system types
    | 'display-large' // 56px
    | 'display' // 48px
    | 'display-small' // 40px
    | 'headline' // 32px
    | 'title-large' // 24px
    | 'title-small' // 18px
    | 'body-large' // 18px
    | 'body' // 16px
    | 'body-small' // 14px
    | 'caption'; // 12px
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
        // Design system types
        type === 'display-large' ? styles.displayLarge : undefined,
        type === 'display' ? styles.display : undefined,
        type === 'display-small' ? styles.displaySmall : undefined,
        type === 'headline' ? styles.headline : undefined,
        type === 'title-large' ? styles.titleLarge : undefined,
        type === 'title-small' ? styles.titleSmall : undefined,
        type === 'body-large' ? styles.bodyLarge : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'body-small' ? styles.bodySmall : undefined,
        type === 'caption' ? styles.caption : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  // Legacy styles (backwards compatibility)
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    color: '#0a7ea4',
  },
  // Design system typography
  displayLarge: {
    fontSize: 56,
    lineHeight: 64,
    fontWeight: '700',
  },
  display: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
  },
  displaySmall: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '700',
  },
  headline: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
  },
  titleLarge: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
  },
  titleSmall: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
  },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
});
