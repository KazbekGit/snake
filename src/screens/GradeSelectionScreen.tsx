import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { NavigationProp } from "@react-navigation/native";
import { NavigationParams } from "../types";

const { width } = Dimensions.get("window");

interface GradeSelectionScreenProps {
  navigation: NavigationProp<NavigationParams, "GradeSelection">;
}

const GRADES = [
  {
    id: 8,
    title: "8 класс",
    description: "Основы обществознания",
    icon: "🎯",
    color: colors.sections.person,
  },
  {
    id: 9,
    title: "9 класс",
    description: "Подготовка к ОГЭ",
    icon: "📝",
    color: colors.sections.economy,
  },
  {
    id: 10,
    title: "10 класс",
    description: "Углубленное изучение",
    icon: "🎓",
    color: colors.sections.politics,
  },
  {
    id: 11,
    title: "11 класс",
    description: "Подготовка к ЕГЭ",
    icon: "🏆",
    color: colors.sections.law,
  },
];

export const GradeSelectionScreen: React.FC<GradeSelectionScreenProps> = ({
  navigation,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);

  const handleGradeSelect = (grade: number) => {
    setSelectedGrade(grade);
    // Небольшая задержка для анимации
    setTimeout(() => {
      navigation.navigate("GoalSelection", { grade });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={colors.gradients.primary} style={styles.gradient}>
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Выберите ваш класс</Text>
          <Text style={styles.subtitle}>
            Мы подберем материал специально для вас
          </Text>
        </View>

        {/* Карточки классов */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.gradesContainer}>
            {GRADES.map((grade) => (
              <TouchableOpacity
                key={grade.id}
                style={[
                  styles.gradeCard,
                  selectedGrade === grade.id && styles.selectedCard,
                ]}
                onPress={() => handleGradeSelect(grade.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[grade.color, `${grade.color}CC`]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardContent}>
                    <Text style={styles.gradeIcon}>{grade.icon}</Text>
                    <Text style={styles.gradeTitle}>{grade.title}</Text>
                    <Text style={styles.gradeDescription}>
                      {grade.description}
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Дополнительная информация */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Материал адаптирован под программу каждого класса
          </Text>
        </View>
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
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButtonText: {
    color: colors.text.light,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.light,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.light,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  gradesContainer: {
    gap: 16,
  },
  gradeCard: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
  },
  cardGradient: {
    padding: 24,
  },
  cardContent: {
    alignItems: "center",
  },
  gradeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  gradeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.light,
    marginBottom: 8,
  },
  gradeDescription: {
    fontSize: 16,
    color: colors.text.light,
    opacity: 0.9,
    textAlign: "center",
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.text.light,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default GradeSelectionScreen;
