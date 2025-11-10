import React from 'react';
import { Circle, Path, Svg } from 'react-native-svg';

type TentIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function TentIcon({ size = 96, ...rest }: TentIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Path d="M20 70L48 26L76 70" stroke={strokeColor} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M32 70L48 42L64 70"
        fill="rgba(17, 17, 23, 0.45)"
        stroke={strokeColor}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M48 42V70" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Circle cx="26" cy="70" r="4" fill={fillAccent} stroke={strokeColor} strokeWidth={2} />
      <Circle cx="70" cy="70" r="4" fill={fillAccent} stroke={strokeColor} strokeWidth={2} />
      <Path d="M20 70H76" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="48" cy="52" r="3" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={2} />
    </Svg>
  );
}

