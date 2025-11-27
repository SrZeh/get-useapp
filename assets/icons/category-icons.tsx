/**
 * Category Icons - SVG components for category chips
 * Replaces Ionicons for better multiplatform consistency and static hosting compatibility
 */

import React from 'react';
import { View } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

type IconProps = {
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  stroke?: string;
};

// Category Icons
export function FlashIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path 
        d="M13 2L3 14H12L11 22L21 10H12L13 2Z" 
        fill={props.fill || color} 
        stroke={props.stroke || color} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function HammerIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M15 12L8 19L5 16M18 9L22 5L19 2L15 6" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M14 13L10 9" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function ConstructIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M3 21L21 3" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 3L18 9L15 12L9 6L12 3Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9 15L15 21L12 21L6 15L9 15Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function CutIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="6" cy="6" r="3" stroke={props.stroke || color} strokeWidth="2"/>
      <Circle cx="6" cy="18" r="3" stroke={props.stroke || color} strokeWidth="2"/>
      <Path d="M20 4L8.12 15.88" stroke={props.stroke || color} strokeWidth="2"/>
      <Path d="M14.47 14.48L20 20.01" stroke={props.stroke || color} strokeWidth="2"/>
      <Path d="M8.12 8.12L12 12" stroke={props.stroke || color} strokeWidth="2"/>
    </Svg>
  );
}

export function LeafIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M11 20C11 20 3 14 3 9C3 6 5 4 8 4C10 4 13 5 15 7C15 7 14 6 12 6C9 6 6 9 6 12C6 14 7 16 9 17" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M13 12C13 12 21 6 21 11C21 20 17 21 13 21C9 21 7 19 7 16" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function TrailSignIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M3 12H21" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M7 8L3 12L7 16" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M12 8H21" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function FootballIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="12" cy="12" r="10" stroke={props.stroke || color} strokeWidth="2"/>
      <Path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22" stroke={props.stroke || color} strokeWidth="2"/>
      <Path d="M2 12C2 17.52 6.48 22 12 22" stroke={props.stroke || color} strokeWidth="2"/>
    </Svg>
  );
}

export function BicycleIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Circle cx="5.5" cy="17.5" r="3.5" stroke={props.stroke || color} strokeWidth="2"/>
      <Circle cx="18.5" cy="17.5" r="3.5" stroke={props.stroke || color} strokeWidth="2"/>
      <Path d="M15 6L12 14L11 17" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M6 6L9 17M15 6L18 17" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function CameraIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="12" cy="13" r="4" stroke={props.stroke || color} strokeWidth="2"/>
    </Svg>
  );
}

export function MusicalNotesIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M9 18V5L21 3V16" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="6" cy="18" r="4" stroke={props.stroke || color} strokeWidth="2"/>
      <Circle cx="18" cy="16" r="4" stroke={props.stroke || color} strokeWidth="2"/>
    </Svg>
  );
}

export function LaptopIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M1 7L23 7L23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21L3 21C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19L1 7Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M7 3L17 3" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function TvIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M21 3H3C1.89543 3 1 3.89543 1 5V17C1 18.1046 1.89543 19 3 19H21C22.1046 19 23 18.1046 23 17V5C23 3.89543 22.1046 3 21 3Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M16 23L8 23" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function RestaurantIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M9 2V22M15 2V22M2 8H22M2 12H22M2 16H22" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function BalloonIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M21.59 11.59C21.9843 11.9867 22.1583 12.5453 22.0562 13.0906C21.9542 13.636 21.5876 14.0964 21.07 14.35C20.5524 14.6036 19.9404 14.6213 19.41 14.4C18.8796 14.1787 18.4909 13.7456 18.35 13.22L17 9L14.78 7.65C14.2544 7.50911 13.8213 7.12044 13.6 6.59C13.3787 6.05956 13.3964 5.4476 13.65 4.93C13.9036 4.4124 14.364 4.04584 14.9094 3.94379C15.4547 3.84173 16.0133 4.01567 16.41 4.41L21.59 11.59Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M2 2L10 10M10 14L14 18" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function CarIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M5 17H4C2.89543 17 2 16.1046 2 15V10H3M5 17H19M5 17L4.5 21H7.5M19 17H20C21.1046 17 22 16.1046 22 15V10H21M19 17L19.5 21H16.5M3 10L4.5 6.5C4.5 5.67157 5.17157 5 6 5H18C18.8284 5 19.5 5.67157 19.5 6.5L21 10M3 10H21" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="7" cy="17" r="2" stroke={props.stroke || color} strokeWidth="2"/>
      <Circle cx="17" cy="17" r="2" stroke={props.stroke || color} strokeWidth="2"/>
    </Svg>
  );
}

export function HeartIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M20.84 4.61C20.3292 4.099 19.7228 3.69364 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69364 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7564 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22248 22.4518 8.5C22.4518 7.77752 22.3095 7.0621 22.0329 6.39464C21.7564 5.72718 21.351 5.12075 20.84 4.61V4.61Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={props.fill || 'none'}/>
    </Svg>
  );
}

export function GameControllerIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M7.5 6H16.5C18.9853 6 21 8.01472 21 10.5V13.5C21 15.9853 18.9853 18 16.5 18H7.5C5.01472 18 3 15.9853 3 13.5V10.5C3 8.01472 5.01472 6 7.5 6Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="7.5" cy="12" r="1" fill={props.fill || color}/>
      <Circle cx="16.5" cy="12" r="1" fill={props.fill || color}/>
      <Path d="M12 9.5V14.5" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round"/>
    </Svg>
  );
}

export function PawIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M11.25 4.533C10.59 4.533 10.04 4.881 9.78 5.36C9.52 5.84 9.59 6.39 9.96 6.8C10.33 7.21 10.93 7.4 11.49 7.29C12.05 7.18 12.48 6.78 12.6 6.22C12.72 5.66 12.5 5.09 12.02 4.83C11.85 4.73 11.65 4.67 11.44 4.67H11.25V4.533Z" fill={props.fill || color}/>
      <Path d="M12.75 4.533C13.41 4.533 13.96 4.881 14.22 5.36C14.48 5.84 14.41 6.39 14.04 6.8C13.67 7.21 13.07 7.4 12.51 7.29C11.95 7.18 11.52 6.78 11.4 6.22C11.28 5.66 11.5 5.09 11.98 4.83C12.15 4.73 12.35 4.67 12.56 4.67H12.75V4.533Z" fill={props.fill || color}/>
      <Path d="M12 9C14.5 9 16.5 11.5 16.5 14.5C16.5 17 14.5 19 12 19C9.5 19 7.5 17 7.5 14.5C7.5 11.5 9.5 9 12 9Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M4.5 9.5C5.5 8.5 7 8.5 8 9.5" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M16 9.5C17 8.5 18.5 8.5 19.5 9.5" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function MedicalIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M22 4L12 14.01L9 11.01" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function AppsIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M10 4H4C2.89543 4 2 4.89543 2 6V12C2 13.1046 2.89543 14 4 14H10C11.1046 14 12 13.1046 12 12V6C12 4.89543 11.1046 4 10 4Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M20 4H14C12.8954 4 12 4.89543 12 6V12C12 13.1046 12.8954 14 14 14H20C21.1046 14 22 13.1046 22 12V6C22 4.89543 21.1046 4 20 4Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10 18H4C2.89543 18 2 18.8954 2 20V22C2 23.1046 2.89543 24 4 24H10C11.1046 24 12 23.1046 12 22V20C12 18.8954 11.1046 18 10 18Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M20 18H14C12.8954 18 12 18.8954 12 20V22C12 23.1046 12.8954 24 14 24H20C21.1046 24 22 23.1046 22 22V20C22 18.8954 21.1046 18 20 18Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function HomeIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M9 22V12H15V22" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function PersonIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <Circle cx="12" cy="7" r="4" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

// Price/Dollar icon
export function DollarIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

/**
 * Double Dollar Icon - Two overlapping dollar signs for max price
 * The second dollar sign is offset by 15% to create overlap effect
 */
export function DoubleDollarIcon({ width = 18, height = 13.5, color = '#000', ...props }: IconProps) {
  const overlapOffset = width * 0.15; // 15% overlap
  
  return (
    <View style={{ width: width + (width - overlapOffset), height, position: 'relative' }}>
      <View style={{ position: 'absolute', left: 0 }}>
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
          <Path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>
      <View style={{ position: 'absolute', left: width - overlapOffset }}>
        <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
          <Path d="M12 1V23M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6312 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6312 13.6815 18 14.5717 18 15.5C18 16.4283 17.6312 17.3185 16.9749 17.9749C16.3185 18.6312 15.4283 19 14.5 19H6" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>
    </View>
  );
}

// Chevron icons for ScrollableCategories
export function ChevronLeftIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M15 18L9 12L15 6" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

export function ChevronRightIcon({ width = 16, height = 16, color = '#000', ...props }: IconProps) {
  return (
    <Svg width={width} height={height} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M9 18L15 12L9 6" stroke={props.stroke || color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

