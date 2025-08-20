import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppThemeProvider } from "./src/theme/ThemeProvider";
import AppNavigator from "./src/navigation/AppNavigator";
import { ErrorBoundary } from "./src/components/ErrorBoundary";

export default function App() {
  return (
    <AppThemeProvider>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <ErrorBoundary>
          <AppNavigator />
        </ErrorBoundary>
      </SafeAreaProvider>
    </AppThemeProvider>
  );
}
