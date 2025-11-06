import React from 'react';
import { Svg, Path, Circle, Rect } from 'react-native-svg';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  stroke?: string;
};

export const SunnyIcon = ({ width = 24, height = 24, color = '#000', fill = color, stroke = color }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke}>
    <Circle cx="12" cy="12" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 2V4" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M12 20V22" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M4.93 4.93L6.34 6.34" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M17.66 17.66L19.07 19.07" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M2 12H4" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M20 12H22" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M6.34 17.66L4.93 19.07" strokeWidth="2" strokeLinecap="round"/>
    <Path d="M19.07 4.93L17.66 6.34" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const MoonIcon = ({ width = 24, height = 24, color = '#000', fill = color, stroke = color }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke}>
    <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const PhonePortraitIcon = ({ width = 24, height = 24, color = '#000', fill = 'none', stroke = color }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke}>
    <Rect x="5" y="2" width="14" height="20" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M12 18H12.01" strokeWidth="2" strokeLinecap="round"/>
  </Svg>
);

export const CheckmarkCircleIcon = ({ width = 24, height = 24, color = '#000', fill = 'none', stroke = color }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke}>
    <Circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 12L11 14L15 10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

export const CloseCircleIcon = ({ width = 24, height = 24, color = '#000', fill = 'none', stroke = color }: IconProps) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={fill} stroke={stroke}>
    <Circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M9 9L15 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <Path d="M15 9L9 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </Svg>
);

