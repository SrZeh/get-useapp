import React from 'react';
import { Svg, Path } from 'react-native-svg';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
};

export const CidadeIcon = ({ 
  width = 24, 
  height = 24,
  color = '#96FF9A',
}: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 289 333" fill="none">
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M144.083 188.308C155.837 188.308 167.11 183.64 175.424 175.331C183.737 167.022 188.411 155.751 188.417 143.997C188.417 132.239 183.746 120.963 175.432 112.649C167.118 104.334 155.841 99.6636 144.083 99.6636C132.325 99.6636 121.049 104.334 112.735 112.649C104.421 120.963 99.75 132.239 99.75 143.997C99.7559 155.751 104.429 167.022 112.743 175.331C121.056 183.64 132.329 188.308 144.083 188.308Z"
      stroke={color}
      strokeWidth="22.1667"
      strokeLinecap="square"
    />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M277.083 143.995C277.083 254.762 166.25 321.217 144.083 321.217C121.917 321.217 11.0834 254.762 11.0834 143.995C11.1069 108.736 25.1297 74.9301 50.0695 50.0069C75.0093 25.0838 108.825 11.0835 144.083 11.0835C217.522 11.0835 277.083 70.601 277.083 143.995Z"
      stroke={color}
      strokeWidth="22.1667"
      strokeLinecap="square"
    />
  </Svg>
);

