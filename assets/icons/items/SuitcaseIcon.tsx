import React from 'react';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

type SuitcaseIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function SuitcaseIcon({ size = 96, ...rest }: SuitcaseIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Rect x="26" y="32" width="44" height="40" rx={10} fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Rect x="38" y="24" width="20" height="10" rx={3} fill="#161622" stroke={strokeColor} strokeWidth={3} />
      <Path d="M30 44H66" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Path d="M46 32V28M50 32V28" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx="34" cy="50" r="3" fill={fillAccent} stroke={strokeColor} strokeWidth={2} />
      <Circle cx="62" cy="50" r="3" fill={fillAccent} stroke={strokeColor} strokeWidth={2} />
      <Rect x="32" y="56" width="6" height="12" rx={2} fill="#161622" stroke={strokeColor} strokeWidth={2} />
      <Rect x="58" y="56" width="6" height="12" rx={2} fill="#161622" stroke={strokeColor} strokeWidth={2} />
    </Svg>
  );
}

