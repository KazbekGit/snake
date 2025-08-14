import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const StarOutlineIcon: React.FC<Props> = ({ size = 24, color = "#F2B544", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M12 3l2.9 5.9 6.1.9-4.4 4.3 1 6.1-5.6-3-5.6 3 1-6.1L3 9.8l6.1-.9L12 3z" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
  </Svg>
);


