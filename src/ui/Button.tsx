import React from "react";
import {
  Text,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ds } from "./theme";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface Props {
  label: string;
  onPress: () => void;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<Props> = ({
  label,
  onPress,
  iconLeft,
  iconRight,
  variant = "primary",
  disabled,
  style,
  textStyle,
}) => {
  const content = (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 56,
        paddingHorizontal: 20,
        borderRadius: 8,
      }}
    >
      {iconLeft ? <View style={{ marginRight: 8 }}>{iconLeft}</View> : null}
      <Text
        style={{
          color: variant === "ghost" ? ds.colors.primary : "#fff",
          fontWeight: "700",
          ...textStyle,
        }}
      >
        {label}
      </Text>
      {iconRight ? <View style={{ marginLeft: 8 }}>{iconRight}</View> : null}
    </View>
  );

  if (variant === "ghost") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[
          {
            borderRadius: 8,
            borderWidth: 2,
            borderColor: ds.colors.textLight,
            backgroundColor: "transparent",
            // мягкий объём
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
          style={{
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          {/* лёгкий верхний блик */}
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0)"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 28,
            }}
            pointerEvents="none"
          />
          {content}
        </View>
      </TouchableOpacity>
    );
  }

  const gradient =
    variant === "primary"
      ? ds.colors.gradients.success
      : variant === "secondary"
      ? ds.colors.gradients.warning
      : ds.colors.gradients.secondary;

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={style}>
      <View
        style={{
          borderRadius: 8,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        <LinearGradient colors={[...gradient]} style={{ borderRadius: 8 }}>
          {/* верхний блик */}
          <LinearGradient
            colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 28,
            }}
            pointerEvents="none"
          />
          {content}
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};
