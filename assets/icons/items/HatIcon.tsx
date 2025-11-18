import React from 'react';
import { Circle, Ellipse, Line, Path, Svg } from 'react-native-svg';

type HatIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function HatIcon({ size = 96, ...rest }: HatIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Ellipse cx="48" cy="64" rx="28" ry="10" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={3} />
      <Path
        d="M30 60L38 34H58L66 60"
        fill="rgba(17, 17, 23, 0.45)"
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Line x1="32" y1="52" x2="64" y2="52" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Ellipse cx="48" cy="34" rx="12" ry="6" fill={fillAccent} stroke={strokeColor} strokeWidth={3} />
      <Circle cx="42" cy="46" r="3" fill="rgba(150, 255, 154, 0.2)" stroke={strokeColor} strokeWidth={2} />
    </Svg>
  );
}

