import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ds } from "./theme";

interface Props {
  icon?: string;
  iconNode?: React.ReactNode;
  title: string;
  description: string;
  colorFrom: string;
  colorTo?: string;
  progress?: number;
  onPress?: () => void;
}

export const SectionCard: React.FC<Props> = ({
  icon,
  iconNode,
  title,
  description,
  colorFrom,
  colorTo,
  progress = 0,
  onPress,
}) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View
        style={{
          borderRadius: 8,
          overflow: "hidden",
          ...ds.shadow.card,
        }}
      >
        <LinearGradient
          colors={[colorFrom, colorTo ?? `${colorFrom}CC`]}
          style={{ borderRadius: 8, padding: ds.spacing.lg }}
        >
          {/* верхний блик */}
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              height: 20,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center" }}>
          {iconNode ? (
            <View style={{ marginRight: 12 }}>{iconNode}</View>
          ) : (
            <Text style={{ fontSize: 28, marginRight: 12 }}>{icon}</Text>
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: ds.colors.textLight,
                fontWeight: "800",
                fontSize: 16,
              }}
            >
              {title}
            </Text>
            <Text style={{ color: ds.colors.textLight, opacity: 0.9 }}>
              {description}
            </Text>
          </View>
          {progress >= 100 ? <Text style={{ color: "#fff" }}>✅</Text> : null}
        </View>
          <View
            style={{
              height: 6,
              backgroundColor: "rgba(255,255,255,0.35)",
              borderRadius: 3,
              marginTop: 12,
              overflow: "hidden",
            }}
          >
            <View
              style={{
                width: `${progress}%`,
                height: "100%",
                backgroundColor: ds.colors.textLight,
              }}
            />
          </View>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
};

