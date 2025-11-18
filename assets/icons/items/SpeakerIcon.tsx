import React from 'react';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

type SpeakerIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function SpeakerIcon({ size = 96, ...rest }: SpeakerIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Rect x="34" y="20" width="28" height="56" rx={8} fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Circle cx="48" cy="56" r="12" fill={fillAccent} stroke={strokeColor} strokeWidth={3} />
      <Circle cx="48" cy="32" r="6" fill={fillAccent} stroke={strokeColor} strokeWidth={3} />
      <Circle cx="48" cy="56" r="6" stroke={strokeColor} strokeWidth={2} />
      <Path d="M66 34C70 38 70 44 66 48" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M70 30C76 36 76 46 70 52" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
      <Path d="M30 34C26 38 26 44 30 48" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />
      <Path d="M26 30C20 36 20 46 26 52" stroke={strokeColor} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

