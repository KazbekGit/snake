import React from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../constants/colors";
import { UserIcon } from "./icons/UserIcon";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  style?: ViewStyle;
  children?: React.ReactNode;
}

export const TopNav: React.FC<Props> = ({ style, children }) => {
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
        <ThemeToggle size={24} color={colors.navy} />
        <View style={{ marginLeft: 16 }}>
          <UserIcon size={28} color={colors.navy} />
        </View>
      </View>
    </View>
  );
};
