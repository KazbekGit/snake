import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../theme/ThemeProvider";
import { colors } from "../constants/colors";

interface ThemeToggleProps {
  size?: number;
  color?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  size = 24,
  color = colors.text,
}) => {
  const { mode, toggle } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={toggle}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel={
        mode === "dark"
          ? "Переключить на светлую тему"
          : "Переключить на темную тему"
      }
      testID="theme-toggle"
    >
      <Ionicons
        name={mode === "dark" ? "sunny" : "moon"}
        size={size}
        color={color}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
  },
});
