import React from 'react';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

type ToolboxIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function ToolboxIcon({ size = 96, ...rest }: ToolboxIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Rect x="20" y="38" width="56" height="32" rx={8} fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Path d="M20 48H76" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Rect x="36" y="30" width="24" height="10" rx={4} fill="#161622" stroke={strokeColor} strokeWidth={3} />
      <Path d="M40 48V66M56 48V66" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Path d="M28 54H36M60 54H68" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Circle cx="30" cy="44" r="3" fill={fillAccent} stroke={strokeColor} strokeWidth={2} />
      <Circle cx="66" cy="44" r="3" fill={fillAccent} stroke={strokeColor} strokeWidth={2} />
    </Svg>
  );
}

