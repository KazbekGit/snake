import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const SearchIcon: React.FC<Props> = ({ size = 24, color = "#1E3B4E", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="7" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M20 20l-3.5-3.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);


