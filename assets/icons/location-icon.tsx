import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  stroke?: string;
};

export const LocationIcon = ({ width = 24, height = 24, color = '#000', fill = 'none', stroke = color }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke}>
    <Path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Circle cx="12" cy="10" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

