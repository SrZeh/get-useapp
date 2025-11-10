import React from 'react';
import { Circle, Line, Path, Svg } from 'react-native-svg';

type BikeIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function BikeIcon({ size = 96, ...rest }: BikeIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Circle cx="28" cy="64" r="12" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={3} />
      <Circle cx="68" cy="64" r="14" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={3} />
      <Path
        d="M28 64L44 42L60 64L52 64"
        fill="rgba(17, 17, 23, 0.45)"
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinejoin="round"
      />
      <Path d="M44 42L60 42L68 64" stroke={strokeColor} strokeWidth={3} strokeLinejoin="round" />
      <Circle cx="44" cy="42" r="4" fill={fillAccent} stroke={strokeColor} strokeWidth={2} />
      <Path d="M44 42L34 32" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Path d="M60 42L58 32H50" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1="24" y1="64" x2="32" y2="64" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Line x1="60" y1="64" x2="76" y2="64" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
    </Svg>
  );
}

