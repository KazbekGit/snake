import React from "react";
import Svg, { Circle, Rect, Path, Ellipse, Defs, LinearGradient, Stop } from "react-native-svg";

interface Props {
  width?: number;
  height?: number;
}

// Красивая векторная иллюстрация образовательного персонажа
export const Teacher: React.FC<Props> = ({ width = 280, height = 240 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 280 240" fill="none">
      <Defs>
        {/* Градиенты для более красивого вида */}
        <LinearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#F2C7A5" />
          <Stop offset="100%" stopColor="#E8B894" />
        </LinearGradient>
        
        <LinearGradient id="shirtGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#2A7F80" />
          <Stop offset="100%" stopColor="#1E5F60" />
        </LinearGradient>
        
        <LinearGradient id="hairGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#1E3B4E" />
          <Stop offset="100%" stopColor="#0F1F2E" />
        </LinearGradient>
        
        <LinearGradient id="bookGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#E35B46" />
          <Stop offset="100%" stopColor="#C94C3B" />
        </LinearGradient>
        
        <LinearGradient id="shadowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor="#000000" stopOpacity="0.1" />
          <Stop offset="100%" stopColor="#000000" stopOpacity="0.05" />
        </LinearGradient>
      </Defs>

      {/* Тень под персонажем */}
      <Ellipse cx="140" cy="230" rx="80" ry="10" fill="url(#shadowGradient)" />

      {/* Книги на заднем плане */}
      <Rect x="180" y="140" width="40" height="50" rx="4" fill="url(#bookGradient)" />
      <Rect x="185" y="145" width="30" height="2" fill="#FFFFFF" opacity="0.8" />
      <Rect x="185" y="150" width="25" height="2" fill="#FFFFFF" opacity="0.6" />
      <Rect x="185" y="155" width="28" height="2" fill="#FFFFFF" opacity="0.7" />
      
      <Rect x="190" y="160" width="35" height="45" rx="4" fill="#F2B544" />
      <Rect x="195" y="165" width="25" height="2" fill="#FFFFFF" opacity="0.8" />
      <Rect x="195" y="170" width="20" height="2" fill="#FFFFFF" opacity="0.6" />
      
      <Rect x="200" y="175" width="30" height="40" rx="4" fill="#16A34A" />
      <Rect x="205" y="180" width="20" height="2" fill="#FFFFFF" opacity="0.8" />
      <Rect x="205" y="185" width="15" height="2" fill="#FFFFFF" opacity="0.6" />

      {/* Тело */}
      <Rect x="90" y="110" width="100" height="90" rx="20" fill="url(#shirtGradient)" />
      
      {/* Рука, держащая книгу */}
      <Path
        d="M170 130c15 5 25 15 35 25"
        stroke="url(#skinGradient)"
        strokeWidth="12"
        strokeLinecap="round"
      />
      
      {/* Книга в руке */}
      <Rect x="200" y="150" width="25" height="35" rx="3" fill="url(#bookGradient)" />
      <Rect x="203" y="153" width="19" height="2" fill="#FFFFFF" opacity="0.9" />
      <Rect x="203" y="158" width="15" height="2" fill="#FFFFFF" opacity="0.7" />
      <Rect x="203" y="163" width="17" height="2" fill="#FFFFFF" opacity="0.8" />

      {/* Голова */}
      <Circle cx="140" cy="85" r="32" fill="url(#skinGradient)" />
      
      {/* Волосы */}
      <Path
        d="M108 82c8-20 28-30 48-25 15 4 22 16 25 28-12-8-22-10-35-10-15 0-28 3-38 7z"
        fill="url(#hairGradient)"
      />
      
      {/* Очки */}
      <Circle cx="130" cy="88" r="10" stroke="#1E3B4E" strokeWidth="3" fill="none" />
      <Circle cx="155" cy="88" r="10" stroke="#1E3B4E" strokeWidth="3" fill="none" />
      <Path d="M140 88h5" stroke="#1E3B4E" strokeWidth="3" />
      
      {/* Улыбка */}
      <Path
        d="M130 102c8 8 22 8 30 0"
        stroke="#E35B46"
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Глаза */}
      <Circle cx="132" cy="88" r="3" fill="#1E3B4E" />
      <Circle cx="157" cy="88" r="3" fill="#1E3B4E" />
      
      {/* Блики в глазах */}
      <Circle cx="133" cy="87" r="1" fill="#FFFFFF" />
      <Circle cx="158" cy="87" r="1" fill="#FFFFFF" />
      
      {/* Детали одежды */}
      <Rect x="100" y="140" width="80" height="8" rx="4" fill="#FFFFFF" opacity="0.3" />
      <Rect x="105" y="155" width="70" height="6" rx="3" fill="#FFFFFF" opacity="0.2" />
      
      {/* Карман */}
      <Path
        d="M110 160h20v15c0 3-2 5-5 5s-5-2-5-5v-15z"
        fill="#FFFFFF"
        opacity="0.4"
      />
      
      {/* Ручка в кармане */}
      <Rect x="115" y="165" width="2" height="8" rx="1" fill="#1E3B4E" />
      <Circle cx="116" cy="165" r="1.5" fill="#E35B46" />
      
      {/* Декоративные элементы */}
      <Circle cx="120" cy="125" r="2" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="160" cy="125" r="2" fill="#FFFFFF" opacity="0.6" />
      <Circle cx="140" cy="135" r="1.5" fill="#FFFFFF" opacity="0.4" />
    </Svg>
  );
};
