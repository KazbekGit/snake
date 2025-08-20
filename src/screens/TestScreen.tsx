import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";

interface TestScreenProps {
  navigation: NavigationProp<RootStackParamList, "Test">;
}

export const TestScreen: React.FC<TestScreenProps> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 Тестовый экран</Text>
        <Text style={styles.subtitle}>Personalization Engine работает!</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={styles.buttonText}>Перейти на главную</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate("Personalization")}
          >
            <Text style={styles.buttonText}>Персонализация</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>✅ Навигация работает</Text>
          <Text style={styles.infoText}>✅ Компоненты загружаются</Text>
          <Text style={styles.infoText}>✅ Personalization Engine готов</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 15,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  info: {
    marginTop: 40,
    alignItems: "center",
  },
  infoText: {
    fontSize: 14,
    color: "#28a745",
    marginBottom: 5,
  },
});


