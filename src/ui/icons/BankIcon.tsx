import React from "react";
import Svg, { Path } from "react-native-svg";

interface Props {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const BankIcon: React.FC<Props> = ({ size = 28, color = "#FFFFFF", strokeWidth = 2 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M3 10l9-6 9 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 10h16v9H4z" stroke={color} strokeWidth={strokeWidth} />
    <Path d="M2 20h20" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);


