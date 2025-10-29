import { View, type ViewProps } from 'react-native';
import { ImageBackground } from 'expo-image';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  backgroundImage?: any;
};

export function ThemedView({ style, lightColor, darkColor, backgroundImage, children, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  // If background image is provided, wrap content in ImageBackground
  if (backgroundImage) {
    return (
      <ImageBackground
        source={backgroundImage}
        style={[{ flex: 1, backgroundColor }, style]}
        imageStyle={{ opacity: 0.15 }}
      >
        <View style={{ flex: 1 }} {...otherProps}>
          {children}
        </View>
      </ImageBackground>
    );
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps}>{children}</View>;
}
