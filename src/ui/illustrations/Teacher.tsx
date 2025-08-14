import React from "react";
import Svg, { Circle, Rect, Path, Ellipse } from "react-native-svg";

interface Props {
  width?: number;
  height?: number;
}

// Простая векторная иллюстрация персонажа без текстур
export const Teacher: React.FC<Props> = ({ width = 260, height = 220 }) => {
  const skin = "#F2C7A5"; // естественный цвет кожи
  const shirt = "#2A7F80"; // бирюзовый
  const accent = "#E35B46"; // красный
  const navy = "#1E3B4E";
  return (
    <Svg width={width} height={height} viewBox="0 0 260 220" fill="none">
      {/* Тень под персонажем */}
      <Ellipse cx="130" cy="208" rx="70" ry="8" fill="#000" opacity="0.08" />

      {/* Тело */}
      <Rect x="80" y="100" width="100" height="80" rx="16" fill={shirt} />
      {/* Рука, указывающая вправо */}
      <Path
        d="M160 120c20 6 34 16 48 26"
        stroke={skin}
        strokeWidth={10}
        strokeLinecap="round"
      />
      <Circle cx="210" cy="148" r="8" fill={skin} />

      {/* Голова */}
      <Circle cx="130" cy="78" r="28" fill={skin} />
      {/* Волосы */}
      <Path
        d="M102 76c6-18 24-26 40-22 12 4 18 14 20 24-9-6-18-8-28-8-12 0-22 2-32 6z"
        fill={navy}
      />
      {/* Очки */}
      <Circle cx="122" cy="80" r="8" stroke={navy} strokeWidth={2} />
      <Circle cx="142" cy="80" r="8" stroke={navy} strokeWidth={2} />
      <Path d="M130 80h4" stroke={navy} strokeWidth={2} />
      {/* Улыбка */}
      <Path
        d="M122 92c6 6 18 6 24 0"
        stroke={accent}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
};
