import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const JusticeIcon: React.FC<Props> = ({ size = 28, color = "#FFFFFF", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3v18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M4 7h16" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path d="M7 7l-3 6h6l-3-6z" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M17 7l-3 6h6l-3-6z" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);


