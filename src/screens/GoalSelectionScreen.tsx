import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../ui/Typography";
import { ds } from "../ui/theme";
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
            <Typography variant="button" style={styles.backButtonText}>
              ← Назад
            </Typography>
          </TouchableOpacity>
          <Typography variant="heroTitle" style={styles.title}>
            Выберите цель обучения
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            {grade} класс • Мы адаптируем материал под ваши задачи
          </Typography>
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
                    <Typography variant="heroTitle" style={styles.goalIcon}>
                      {goal.icon}
                    </Typography>
                    <View style={styles.goalInfo}>
                      <Typography variant="title" style={styles.goalTitle}>
                        {goal.title}
                      </Typography>
                      <Typography variant="body" style={styles.goalDescription}>
                        {goal.description}
                      </Typography>
                    </View>
                  </View>

                  <View style={styles.featuresContainer}>
                    {goal.features.map((feature, index) => (
                      <View key={index} style={styles.featureItem}>
                        <Typography variant="body" style={styles.featureIcon}>
                          ✓
                        </Typography>
                        <Typography variant="body" style={styles.featureText}>
                          {feature}
                        </Typography>
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
          <Typography variant="caption" style={styles.footerText}>
            Вы всегда сможете изменить цель в настройках
          </Typography>
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
    paddingTop: ds.spacing.xl,
    paddingBottom: ds.spacing.lg,
    paddingHorizontal: ds.spacing.lg,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: ds.spacing.lg,
    top: ds.spacing.xl,
    paddingHorizontal: ds.spacing.md,
    paddingVertical: ds.spacing.sm,
    borderRadius: ds.radius.full,
    backgroundColor: colors.primary,
    ...ds.shadows.card,
  },
  backButtonText: {
    color: colors.textLight,
  },
  title: {
    color: colors.textLight,
    textAlign: "center",
    marginBottom: ds.spacing.sm,
  },
  subtitle: {
    color: colors.textLight,
    textAlign: "center",
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ds.spacing.lg,
    paddingBottom: ds.spacing.lg,
  },
  goalsContainer: {
    gap: ds.spacing.lg,
  },
  goalCard: {
    borderRadius: ds.radius.lg,
    overflow: "hidden",
    ...ds.shadows.card,
  },
  selectedCard: {
    transform: [{ scale: 1.02 }],
  },
  cardGradient: {
    padding: ds.spacing.lg,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ds.spacing.lg,
  },
  goalIcon: {
    marginRight: ds.spacing.md,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    color: colors.textLight,
    marginBottom: ds.spacing.xs,
  },
  goalDescription: {
    color: colors.textLight,
    opacity: 0.9,
  },
  featuresContainer: {
    gap: ds.spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    color: colors.textLight,
    marginRight: ds.spacing.sm,
  },
  featureText: {
    color: colors.textLight,
    opacity: 0.9,
    flex: 1,
  },
  footer: {
    paddingHorizontal: ds.spacing.lg,
    paddingBottom: ds.spacing.lg,
  },
  footerText: {
    color: colors.textLight,
    opacity: 0.7,
    textAlign: "center",
  },
});

export default GoalSelectionScreen;
