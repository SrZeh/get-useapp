import React from 'react';
import { Path, Ellipse, Line, Polygon, Rect, Svg, G, Circle } from 'react-native-svg';

type LawnMowerIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function LawnMowerIcon({ size = 128, ...rest }: LawnMowerIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;

  return (
    <Svg viewBox="0 0 72 72" width={width} height={height} fill="none" {...rest}>
      <G id="color">
        <Path
          fill="#b1cc33"
          d="m34.04 34.84h20.66a1.833 1.833 0 0 1 1.833 1.833v6.16a1.833 1.833 0 0 1-1.833 1.833h-19.47a1.833 1.833 0 0 1-1.833-1.833v-7.342a0.6513 0.6513 0 0 1 0.6513-0.6513z"
        />
        <Path
          fill="#5c9e31"
          d="M35.91 49.79l0 5.2 18.6 0-0.07-1.63 2.01-4.33-1.94 0.1-3.05 0 0-5.13-12.28 0 0 5.13z"
        />
        <Circle cx="29.62" cy="52.29" r="7.618" fill="#d0cfce" />
        <Circle cx="59.08" cy="54.85" r="5.063" fill="#d0cfce" />
      </G>
      <G id="line">
        <Path
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m7.95 7.957s19.41 5.496 25.24 26.36"
        />
        <Path
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="m33.16 34.42h21.05a1.868 1.872 0 0 1 1.868 1.872v6.288a1.868 1.872 0 0 1-1.868 1.872h-19.84a1.868 1.872 0 0 1-1.868-1.872v-7.494a0.6638 0.6649 0 0 1 0.6638-0.6649z"
        />
        <Line x1="53.32" x2="35.89" y1="55.03" y2="55.03" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <Path
          fill="none"
          stroke="#000000"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.29}
          d="M36.04 49.66l2.15 0 0-5.22 12.74 0 0 5.22 3.34 0 2.09-0.01 0 0.1"
        />
        <Ellipse cx="28.65" cy="52.23" rx="7.764" ry="7.776" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <Ellipse cx="58.68" cy="54.63" rx="5.37" ry="5.379" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        <Rect x="45.58" y="30.7" rx="1.201" ry="1.201" width="6.725" height="3.728" />
      </G>
    </Svg>
  );
}
