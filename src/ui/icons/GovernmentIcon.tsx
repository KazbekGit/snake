import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const GovernmentIcon: React.FC<Props> = ({ size = 28, color = "#FFFFFF", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 4l8 4H4l8-4z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M5 10h14v8H5z" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M3 20h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);


