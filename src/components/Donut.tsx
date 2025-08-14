import React from "react";
import Svg, { Circle } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

interface DonutProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..100
}

export const Donut: React.FC<DonutProps> = ({
  size = 96,
  strokeWidth = 10,
  progress,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, progress));
  const dashoffset = circumference - (circumference * clamped) / 100;

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.backgroundSecondary}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashoffset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.centerLabel}>
        <Text style={styles.percentText}>{Math.round(clamped)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
});

