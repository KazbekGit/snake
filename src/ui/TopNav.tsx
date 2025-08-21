import React from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../constants/colors";
import { UserIcon } from "./icons/UserIcon";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  style?: ViewStyle;
  children?: React.ReactNode;
  onAchievementsPress?: () => void;
}

export const TopNav: React.FC<Props> = ({
  style,
  children,
  onAchievementsPress,
}) => {
  return (
    <View
      style={[
        {
          height: 72,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        },
        style,
      ]}
    >
      <Text style={{ color: colors.navy, fontSize: 18, fontWeight: "800" }}>
        Обществознание
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {children}
        {onAchievementsPress && (
          <TouchableOpacity
            onPress={onAchievementsPress}
            style={{ marginRight: 16 }}
          >
            <Ionicons name="trophy" size={24} color={colors.navy} />
          </TouchableOpacity>
        )}
        <ThemeToggle size={24} color={colors.navy} />
        <View style={{ marginLeft: 16 }}>
          <UserIcon size={28} color={colors.navy} />
        </View>
      </View>
    </View>
  );
};
