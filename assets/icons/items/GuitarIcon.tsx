import React from 'react';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

type GuitarIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function GuitarIcon({ size = 96, ...rest }: GuitarIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Circle cx="38" cy="56" r="18" fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Circle cx="54" cy="44" r="12" fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Circle cx="45" cy="50" r="5" fill={fillAccent} stroke={strokeColor} strokeWidth={2} />
      <Rect x="58" y="27" width="20" height="8" rx={3} fill="#161622" stroke={strokeColor} strokeWidth={2} />
      <Rect x="60" y="18" width="16" height="12" rx={3} fill="#161622" stroke={strokeColor} strokeWidth={2} />
      <Path d="M64 30L52 46" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Circle cx="68" cy="22" r="4" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={2} />
    </Svg>
  );
}

