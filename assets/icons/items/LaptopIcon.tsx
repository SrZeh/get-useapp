import React from 'react';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

type LaptopIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function LaptopIcon({ size = 96, ...rest }: LaptopIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Rect x="28" y="28" width="40" height="28" rx={4} fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Rect x="20" y="60" width="56" height="12" rx={4} fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Rect x="34" y="64" width="28" height="4" rx={2} fill="#161622" stroke={strokeColor} strokeWidth={2} />
      <Circle cx="48" cy="32" r="2" fill="rgba(150, 255, 154, 0.3)" stroke={strokeColor} strokeWidth={1.5} />
      <Path d="M24 60L30 56H66L72 60" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

