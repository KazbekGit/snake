import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

export const InlineStat: React.FC<{
  label: string;
  value: string | number;
}> = ({ label, value }) => {
  return (
    <View style={styles.stat}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  stat: { alignItems: "center" },
  value: { fontSize: 20, fontWeight: "800", color: colors.text },
  label: { fontSize: 12, color: colors.textSecondary },
});

