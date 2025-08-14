import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const GroupIcon: React.FC<Props> = ({ size = 28, color = "#FFFFFF", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8" cy="8" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="16" cy="8" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M2 20c0-3.314 2.686-6 6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M22 20c0-3.314-2.686-6-6-6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);


