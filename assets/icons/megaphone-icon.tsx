import React from 'react';
import { Path, Svg } from 'react-native-svg';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  stroke?: string;
};

/**
 * Megaphone icon for "Socorro!" feature
 * Similar style to other menu icons
 */
export function MegaphoneIcon({ 
  width = 24, 
  height = 24, 
  color = '#000', 
  stroke,
  ...props 
}: IconProps) {
  // Usar stroke se fornecido, senão usar color (TabIcon passa ambos)
  const strokeColor = stroke || color;
  
  return (
    <Svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 24" 
      fill="none" 
      {...props}
    >
      {/* Megaphone body - vazado (outline) */}
      <Path 
        d="M3 10V14C3 15.1046 3.89543 16 5 16H8L12 20V4L8 8H5C3.89543 8 3 8.89543 3 10Z" 
        fill="none"
        stroke={strokeColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Sound waves - vazado (outline) */}
      <Path 
        d="M12 8C14.2091 8 16 9.79086 16 12C16 14.2091 14.2091 16 12 16" 
        fill="none"
        stroke={strokeColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <Path 
        d="M12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20" 
        fill="none"
        stroke={strokeColor} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}

