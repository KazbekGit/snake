import React from "react";
import { View } from "react-native";

interface Props {
  visible?: boolean;
  step?: number; // px baseline step
  color?: string;
}

export const BaselineGrid: React.FC<Props> = ({ visible = false, step = 8, color = "rgba(30,59,78,0.06)" }) => {
  if (!visible) return null as any;
  const lines = new Array(200).fill(0);
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
      {lines.map((_, i) => (
        <View key={i} style={{ position: "absolute", left: 0, right: 0, top: i * step, height: 1, backgroundColor: color }} />
      ))}
    </View>
  );
};


