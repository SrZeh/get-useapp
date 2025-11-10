import React from 'react';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

type DroneIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function DroneIcon({ size = 96, ...rest }: DroneIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';
  const fillAccent = rest.fill ?? 'rgba(150, 255, 154, 0.2)';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Rect x="36" y="40" width="24" height="16" rx={8} fill="rgba(17, 17, 23, 0.45)" stroke={strokeColor} strokeWidth={3} />
      <Circle cx="48" cy="48" r="6" fill={fillAccent} stroke={strokeColor} strokeWidth={3} />
      <Path d="M36 48H28M68 48H60" stroke={strokeColor} strokeWidth={3} strokeLinecap="round" />
      <Circle cx="24" cy="32" r="6" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={2} />
      <Circle cx="24" cy="32" r="3" stroke={strokeColor} strokeWidth={2} />
      <Circle cx="72" cy="32" r="6" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={2} />
      <Circle cx="72" cy="32" r="3" stroke={strokeColor} strokeWidth={2} />
      <Circle cx="24" cy="64" r="6" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={2} />
      <Circle cx="24" cy="64" r="3" stroke={strokeColor} strokeWidth={2} />
      <Circle cx="72" cy="64" r="6" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={2} />
      <Circle cx="72" cy="64" r="3" stroke={strokeColor} strokeWidth={2} />
      <Path
        d="M30 38L36 42M30 58L36 54M66 38L60 42M66 58L60 54"
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

