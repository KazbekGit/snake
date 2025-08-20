import React from "react";
import { Text, TextProps } from "react-native";
import { ds } from "./theme";
import { colors } from "../constants/colors";

type Variant = keyof typeof ds.typography;

interface Props extends TextProps {
  variant?: Variant;
  color?: string;
}

export const Typography: React.FC<Props> = ({
  variant = "body",
  color = ds.colors.text,
  style,
  children,
  ...rest
}) => {
  const v = ds.typography[variant] || ds.typography.body;
  return (
    <Text
      {...rest}
      style={[
        {
          color,
          fontSize: v.fontSize,
          lineHeight: v.lineHeight,
          fontWeight: v.fontWeight,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};
