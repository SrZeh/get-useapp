import React from 'react';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

type LawnMowerIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function LawnMowerIcon({ size = 96, ...rest }: LawnMowerIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Path d="M24 30H34L48 54H76" stroke={strokeColor} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="28" y="46" width="36" height="18" rx={6} fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Circle cx="34" cy="66" r="8" fill={fillAccent} stroke={strokeColor} strokeWidth={3} />
      <Circle cx="68" cy="66" r="10" fill={fillAccent} stroke={strokeColor} strokeWidth={3} />
      <Rect x="40" y="42" width="18" height="6" rx={2} fill="#161622" stroke={strokeColor} strokeWidth={2} />
      <Path d="M72 48L80 60" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Circle cx="52" cy="54" r="3" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={2} />
    </Svg>
  );
}

