import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const PersonIcon: React.FC<Props> = ({ size = 28, color = "#FFFFFF", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);


