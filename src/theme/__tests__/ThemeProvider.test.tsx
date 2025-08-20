import React from "react";
import { render } from "@testing-library/react-native";
import { AppThemeProvider, useAppTheme } from "../ThemeProvider";
import { View, Text } from "react-native";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("light"),
  setItem: jest.fn(),
}));

describe("ThemeProvider", () => {
  it("should render without crashing", () => {
    const { getByText } = render(
      <AppThemeProvider>
        <Text>Test Content</Text>
      </AppThemeProvider>
    );

    expect(getByText("Test Content")).toBeTruthy();
  });

  it("should provide theme context", () => {
    const TestComponent = () => {
      const { mode } = useAppTheme();
      return <Text testID="theme-mode">{mode}</Text>;
    };

    const { getByTestId } = render(
      <AppThemeProvider>
        <TestComponent />
      </AppThemeProvider>
    );

    expect(getByTestId("theme-mode")).toBeTruthy();
  });
});
