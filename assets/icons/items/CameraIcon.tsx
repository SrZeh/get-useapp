import React from 'react';
import { Circle, Rect, Svg } from 'react-native-svg';

type CameraIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function CameraIcon({ size = 96, ...rest }: CameraIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';

  return (
    <Svg viewBox="0 0 96 96" width={width} height={height} fill="none" {...rest}>
      <Rect
        x="12"
        y="26"
        width="72"
        height="48"
        rx="12"
        fill="rgba(17, 17, 23, 0.45)"
        stroke={strokeColor}
        strokeWidth={3}
      />
      <Rect x="26" y="18" width="20" height="12" rx="4" fill="#161622" stroke={strokeColor} strokeWidth={3} />
      <Circle cx="48" cy="50" r="16" stroke={strokeColor} strokeWidth={4} />
      <Circle cx="48" cy="50" r="8" fill={rest.fill ?? 'rgba(150, 255, 154, 0.2)'} stroke={strokeColor} strokeWidth={3} />
      <Circle cx="72" cy="38" r="5" fill="rgba(150, 255, 154, 0.15)" stroke={strokeColor} strokeWidth={2} />
    </Svg>
  );
}

