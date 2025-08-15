import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ThemeToggle } from "../ThemeToggle";
import { AppThemeProvider } from "../../theme/ThemeProvider";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn().mockResolvedValue("light"),
  setItem: jest.fn(),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<AppThemeProvider>{component}</AppThemeProvider>);
};

describe("ThemeToggle", () => {
  it("should render moon icon in light theme", () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle />);

    expect(getByLabelText("Переключить на темную тему")).toBeTruthy();
  });

  it("should render sunny icon in dark theme", async () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle />);

    // Toggle to dark theme
    fireEvent.press(getByLabelText("Переключить на темную тему"));

    // Wait for theme to change
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(getByLabelText("Переключить на светлую тему")).toBeTruthy();
  });

  it("should call toggle function when pressed", () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle />);

    const toggleButton = getByLabelText("Переключить на темную тему");
    fireEvent.press(toggleButton);

    // The theme should have changed
    expect(getByLabelText("Переключить на светлую тему")).toBeTruthy();
  });

  it("should accept custom size prop", () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle size={32} />);

    const toggleButton = getByLabelText("Переключить на темную тему");
    expect(toggleButton).toBeTruthy();
  });

  it("should accept custom color prop", () => {
    const { getByLabelText } = renderWithTheme(<ThemeToggle color="#FF0000" />);

    const toggleButton = getByLabelText("Переключить на темную тему");
    expect(toggleButton).toBeTruthy();
  });
});
