import React from "react";
import { render } from "@testing-library/react-native";
import { AppThemeProvider, useAppTheme } from "../ThemeProvider";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("light"),
  setItem: jest.fn(),
}));

describe("ThemeProvider", () => {
  it("should render without crashing", () => {
    const { getByText } = render(
      <AppThemeProvider>
        <div>Test Content</div>
      </AppThemeProvider>
    );

    expect(getByText("Test Content")).toBeTruthy();
  });

  it("should provide theme context", () => {
    const TestComponent = () => {
      const { mode } = useAppTheme();
      return <div data-testid="theme-mode">{mode}</div>;
    };

    const { getByTestId } = render(
      <AppThemeProvider>
        <TestComponent />
      </AppThemeProvider>
    );

    expect(getByTestId("theme-mode")).toBeTruthy();
  });
});
