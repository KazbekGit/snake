import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/colors";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { LEARNING_GOALS } from "../constants/sections";

interface GoalSelectionScreenProps {
  navigation: NavigationProp<RootStackParamList, "GoalSelection">;
  route: RouteProp<RootStackParamList, "GoalSelection">;
}

const GOALS = [
  {
    id: "ege" as const,
    title: LEARNING_GOALS.ege.title,
    description: LEARNING_GOALS.ege.description,
    icon: LEARNING_GOALS.ege.icon,
    color: colors.sections.person,
    features: [
      "Глубокое изучение всех тем",
      "Задания в формате ЕГЭ",
      "Детальный разбор ошибок",
      "Персональная статистика",
    ],
  },
  {
    id: "school" as const,
    title: LEARNING_GOALS.school.title,
    description: LEARNING_GOALS.school.description,
    icon: LEARNING_GOALS.school.icon,
    color: colors.sections.economy,
    features: [
      "Соответствие школьной программе",
      "Пошаговое изучение тем",
      "Интерактивные уроки",
      "Подготовка к контрольным",
    ],
  },
  {
    id: "personal" as const,
    title: LEARNING_GOALS.personal.title,
    description: LEARNING_GOALS.personal.description,
    icon: LEARNING_GOALS.personal.icon,
    color: colors.sections.culture,
    features: [
      "Общее развитие",
      "Интересные факты",
      "Практические примеры",
      "Гибкий график обучения",
    ],
  },
];

export const GoalSelectionScreen: React.FC<GoalSelectionScreenProps> = ({
  navigation,
  route,
}) => {
  const { grade } = route.params;
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const handleGoalSelect = (goalId: string) => {
    setSelectedGoal(goalId);
    // Небольшая задержка для анимации
    setTimeout(() => {
      // TODO: Сохранить выбор пользователя и перейти к главному экрану
      console.log(`Выбран класс: ${grade}, цель: ${goalId}`);
      navigation.navigate("Home");
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[...colors.gradients.primary]}
        style={styles.gradient}
      >
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Назад</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Выберите цель обучения</Text>
          <Text style={styles.subtitle}>
            {grade} класс • Мы адаптируем материал под ваши задачи
          </Text>
        </View>

        {/* Карточки целей */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.goalsContainer}>
            {GOALS.map((goal) => (
              <TouchableOpacity
                key={goal.id}
                style={[
                  styles.goalCard,
                  selectedGoal === goal.id && styles.selectedCard,
                ]}
                onPress={() => handleGoalSelect(goal.id)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[goal.color, `${goal.color}CC`]}
                  style={styles.cardGradient}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.goalIcon}>{goal.icon}</Text>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalTitle}>{goal.title}</Text>
                      <Text style={styles.goalDescription}>
                        {goal.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.featuresContainer}>
                    {goal.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Text style={styles.featureIcon}>✓</Text>
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Дополнительная информация */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Вы всегда сможете изменить цель в настройках
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
    color: colors.textLight,
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.textLight,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
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
  goalsContainer: {
    gap: 20,
  },
  goalCard: {
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
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  goalIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.textLight,
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    lineHeight: 20,
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    fontSize: 16,
    color: colors.textLight,
    marginRight: 12,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.9,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 14,
    color: colors.textLight,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default GoalSelectionScreen;
