import React from 'react';
import { Svg, Path, Circle } from 'react-native-svg';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  stroke?: string;
};

export const ProfileIcon = ({ width = 24, height = 24, color = '#000', fill = 'none', stroke = color }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke}>
    <Circle cx="12" cy="8" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M6 21C6 17.6863 8.68629 15 12 15C15.3137 15 18 17.6863 18 21" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

