import React from 'react';
import { Circle, Path, Rect, Svg } from 'react-native-svg';

type CameraIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function CameraIcon({ size = 96, ...rest }: CameraIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';

  return (
    <Svg viewBox="0 0 1024 1024" width={width} height={height} fill="none" {...rest}>
      <Path
        d="M845 166l-49-13 49-13 13-48 13 48 48 13-48 13-13 49-13-49zM892 219l-18-4 18-5 5-19 4 19 19 5-19 4-4 19-5-19z"
        fill="#FDCD60"
      />
      <Path
        d="M79 711l-20-5 20-5 5-20 5 20 21 5-21 5-5 21-5-21zM148 862l-33-8 33-7 7-33 8 33 33 7-33 8-8 33-7-33z"
        fill="#FDCD60"
      />
      <Circle cx="143" cy="169" r="9" fill="#5546CB" />
      <Path
        d="M889 854a25 25 0 1 1 25-25 25 25 0 0 1-25 25z m0-36a10 10 0 1 0 10 10 10 10 0 0 0-10-10z"
        fill="#5546CB"
      />
      <Path
        d="M166 400v347a31 31 0 0 0 31 31h629a31 31 0 0 0 31-31V400z m362 358c-92 0-168-75-168-168s75-168 168-168 168 75 168 168-76 168-168 168zM858 380v-63a31 31 0 0 0-31-31H198a31 31 0 0 0-31 31v63z m-140-58h71v20h-71z"
        fill="#FDCD60"
      />
      <Path
        d="M826 266h-40l-15-59H653l-15 59H198a51 51 0 0 0-51 51v430a51 51 0 0 0 51 51h628a51 51 0 0 0 51-51V317a51 51 0 0 0-51-51z m-157-39h86l10 37H660z m-471 59h628a31 31 0 0 1 31 31v63H166v-63a31 31 0 0 1 32-31z m628 492H198a31 31 0 0 1-31-31V400h691v347a31 31 0 0 1-32 31z"
        fill="#5546CB"
      />
      <Path
        d="M528 443c-81 0-148 66-148 148s66 148 148 148 148-66 148-148-67-148-148-148z m0 264a116 116 0 1 1 116-117 116 116 0 0 1-116 116z"
        fill="#FFFFFF"
      />
      <Path
        d="M528 423c-92 0-168 75-168 168s75 168 168 168 168-75 168-168-76-168-168-168z m0 315c-81 0-148-66-148-148s66-148 148-148 148 66 148 148-67 148-148 148z"
        fill="#5546CB"
      />
      <Path
        d="M528 494a96 96 0 1 0 96 96 96 96 0 0 0-96-96z m43 81a18 18 0 1 1 18-18 18 18 0 0 1-18 18z"
        fill="#FF8859"
      />
      <Path
        d="M528 474a116 116 0 1 0 116 116 116 116 0 0 0-116-116z m0 212a96 96 0 1 1 96-96 96 96 0 0 1-96 96z"
        fill="#5546CB"
      />
      <Circle cx="571" cy="558" r="18" fill="#FFFFFF" />
      <Path d="M755 227h-86l-9 37h105l-10-37z" fill="#AFBCF3" />
      <Rect x="718" y="322" width="71" height="20" fill="#5546CB" />
    </Svg>
  );
}

