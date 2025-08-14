import React from "react";
import { View, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../constants/colors";
import { UserIcon } from "./icons/UserIcon";

interface Props {
  style?: ViewStyle;
}

export const TopNav: React.FC<Props> = ({ style }) => {
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
        {[
          { label: "Курсы" },
          { label: "Расписание" },
          { label: "О преподавателе" },
        ].map((item) => (
          <TouchableOpacity key={item.label} style={{ marginLeft: 24 }}>
            <Text
              style={{ color: colors.navy, fontSize: 16, fontWeight: "600" }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
        <View style={{ marginLeft: 24 }}>
          <UserIcon size={28} color={colors.navy} />
        </View>
      </View>
    </View>
  );
};
