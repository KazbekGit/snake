import React from "react";
import { View, ViewProps } from "react-native";
import { ds } from "./theme";

export const Card: React.FC<ViewProps> = ({ style, children, ...rest }) => {
  return (
    <View
      {...rest}
      style={[
        {
          backgroundColor: ds.colors.card,
          borderRadius: 8,
          padding: ds.spacing.lg,
          // мягкая тень
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 3,
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 20,
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />
      {children}
    </View>
  );
};
