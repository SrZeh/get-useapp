import React from 'react';
import { Svg, Circle, Path } from 'react-native-svg';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  stroke?: string;
};

export function SearchIcon({ width = 20, height = 20, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="11" cy="11" r="8" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M21 21L16.65 16.65" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

