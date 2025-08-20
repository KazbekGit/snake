import React, { Component, ErrorInfo, ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../constants/colors";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Что-то пошло не так</Text>
          <Text style={styles.message}>
            Произошла ошибка в приложении. Попробуйте перезапустить.
          </Text>
          {__DEV__ && this.state.error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Ошибка (только в dev):</Text>
              <Text style={styles.errorText}>{this.state.error.message}</Text>
              <Text style={styles.errorStack}>{this.state.error.stack}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
    width: "100%",
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: "white",
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: "white",
    opacity: 0.8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

