import React from 'react';
import { Svg, Path } from 'react-native-svg';

type SurfIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function SurfIcon({ size = 96, ...rest }: SurfIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';

  return (
    <Svg viewBox="0 0 68 68" width={width} height={height} fill="none" {...rest}>
      <Path
        d="M64.0456 3.0498L4.87968 62.2157M64.0456 3.0498V9.14938C64.0975 18.3533 61.8343 27.4225 57.4643 35.523C53.0943 43.6235 46.7578 50.4952 39.0373 55.5062M64.0456 3.0498H57.946C27.7531 3.0498 3.0498 27.7531 3.0498 57.946C3.0498 59.5637 3.69244 61.1152 4.83633 62.2591C5.98022 63.403 7.53167 64.0456 9.14938 64.0456C17.2034 64.1484 25.1707 62.3733 32.4193 58.8609"
        stroke={strokeColor}
        strokeWidth={6.09958}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.2987 48.7955C26.5331 48.7955 33.2427 55.81 33.5477 64.0445C35.6276 62.1086 37.281 59.7601 38.4021 57.1491C39.5232 54.5382 40.0874 51.722 40.0587 48.8807C40.03 46.0394 39.409 43.2352 38.2354 40.6474C37.0618 38.0596 35.3613 35.7451 33.2427 33.8516"
        stroke={strokeColor}
        strokeWidth={6.09958}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

