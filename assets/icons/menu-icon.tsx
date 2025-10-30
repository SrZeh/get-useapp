import React from 'react';
import { Svg, Path } from 'react-native-svg';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  stroke?: string;
};

export function MenuIcon({ width = 28, height = 28, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M3 12H21" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 6H21" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M3 18H21" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

