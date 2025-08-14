import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const LayersIcon: React.FC<Props> = ({ size = 24, color = "#1E3B4E", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3l9 5-9 5-9-5 9-5z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    <Path d="M3 12l9 5 9-5" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
  </Svg>
);


