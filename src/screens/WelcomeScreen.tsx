import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { NavigationProp } from "@react-navigation/native";
import { NavigationParams } from "../types";

const { width, height } = Dimensions.get("window");

interface WelcomeScreenProps {
  navigation: NavigationProp<NavigationParams, "Welcome">;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Анимация появления
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleStartLearning = () => {
    navigation.navigate("GradeSelection");
  };

  const handleLogin = () => {
    // TODO: Реализовать вход для существующих пользователей
    console.log("Вход в приложение");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.gradients.primary} style={styles.gradient}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Логотип и заголовок */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>📚</Text>
            </View>
            <Text style={styles.title}>Обществознание</Text>
            <Text style={styles.subtitle}>— это легко!</Text>
          </View>

          {/* Иллюстрация */}
          <View style={styles.illustrationContainer}>
            <View style={styles.illustration}>
              <Text style={styles.studentEmoji}>👨‍🎓</Text>
              <Text style={styles.phoneEmoji}>📱</Text>
              <Text style={styles.bookEmoji}>📖</Text>
            </View>
          </View>

          {/* Описание */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              Изучай обществознание с помощью интерактивных уроков, ярких
              иллюстраций и увлекательных тестов
            </Text>
          </View>

          {/* Кнопки */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartLearning}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={colors.gradients.success}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>Начать обучение</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Войти</Text>
            </TouchableOpacity>
          </View>

          {/* Дополнительная информация */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Соответствует ФГОС • Бесплатно • Для 8-11 классов
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginTop: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text.light,
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.text.light,
    textAlign: "center",
    opacity: 0.9,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  illustration: {
    position: "relative",
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  studentEmoji: {
    fontSize: 60,
    position: "absolute",
    top: 20,
  },
  phoneEmoji: {
    fontSize: 40,
    position: "absolute",
    right: 20,
    bottom: 40,
  },
  bookEmoji: {
    fontSize: 40,
    position: "absolute",
    left: 20,
    bottom: 40,
  },
  descriptionContainer: {
    marginBottom: 40,
  },
  description: {
    fontSize: 16,
    color: colors.text.light,
    textAlign: "center",
    lineHeight: 24,
    opacity: 0.9,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 40,
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.light,
  },
  secondaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.text.light,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.light,
  },
  footer: {
    alignItems: "center",
  },
  footerText: {
    fontSize: 14,
    color: colors.text.light,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default WelcomeScreen;
