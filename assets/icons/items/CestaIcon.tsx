import React from 'react';
import { Svg, Path } from 'react-native-svg';

type CestaIconProps = React.ComponentProps<typeof Svg> & {
  size?: number;
};

export function CestaIcon({ size = 96, ...rest }: CestaIconProps) {
  const width = rest.width ?? size;
  const height = rest.height ?? size;
  const strokeColor = rest.stroke ?? '#96FF9A';

  return (
    <Svg viewBox="0 0 55 54" width={width} height={height} fill="none" {...rest}>
      <Path
        d="M35.8955 6.62469L16.7725 0.958802M6.8321 25.423L9.50662 5.65838M22.3222 33.4387L28.1967 42.521M36.8539 24.0395L42.7284 33.1218M29.5881 28.7391L35.4625 37.8214M7.89874 35.0386L44.228 11.5408L53.5189 33.8716L24.4555 52.6699L7.89874 35.0386ZM1.3827 28.9477L41.3449 3.1L46.0445 10.3659L6.08228 36.2135L1.3827 28.9477Z"
        stroke={strokeColor}
        strokeWidth={2}
      />
    </Svg>
  );
}

