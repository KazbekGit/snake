import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const CultureIcon: React.FC<Props> = ({ size = 28, color = "#FFFFFF", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M4 20h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M7 20V6l5-2 5 2v14" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M9 12h6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);


