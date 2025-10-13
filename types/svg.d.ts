// types/svg.d.ts
declare module "*.svg" {
  import * as React from "react";

  // Componente (o transformer exporta default como componente)
  const SvgComponent: React.FC<{
    width?: number | string;
    height?: number | string;
    color?: string;          // funciona se seu SVG usa fill/stroke="currentColor"
    style?: any;
  }>;

  export default SvgComponent;
}
