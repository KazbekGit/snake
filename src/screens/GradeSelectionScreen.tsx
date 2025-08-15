import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { Typography } from "../ui/Typography";
import { ds } from "../ui/theme";
import { colors } from "../constants/colors";
import { NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useAppTheme } from "../theme/ThemeProvider";

const { width } = Dimensions.get("window");

interface GradeSelectionScreenProps {
  navigation: NavigationProp<RootStackParamList, "GradeSelection">;
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
  const { mode } = useAppTheme();
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
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
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
            Выберите ваш класс
          </Typography>
          <Typography variant="body" style={styles.subtitle}>
            Мы подберем материал специально для вас
          </Typography>
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
                    <Typography variant="heroTitle" style={styles.gradeIcon}>
                      {grade.icon}
                    </Typography>
                    <Typography variant="title" style={styles.gradeTitle}>
                      {grade.title}
                    </Typography>
                    <Typography variant="body" style={styles.gradeDescription}>
                      {grade.description}
                    </Typography>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Дополнительная информация */}
        <View style={styles.footer}>
          <Typography variant="caption" style={styles.footerText}>
            Материал адаптирован под программу каждого класса
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
    borderRadius: ds.radius.pill,
    backgroundColor: colors.primary,
    ...ds.shadow.card,
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
  gradesContainer: {
    gap: ds.spacing.md,
  },
  gradeCard: {
    borderRadius: ds.radius.lg,
    overflow: "hidden",
    ...ds.shadow.card,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
  },
  cardGradient: {
    padding: ds.spacing.xl,
  },
  cardContent: {
    alignItems: "center",
  },
  gradeIcon: {
    marginBottom: ds.spacing.md,
  },
  gradeTitle: {
    color: colors.textLight,
    marginBottom: ds.spacing.sm,
  },
  gradeDescription: {
    color: colors.textLight,
    opacity: 0.9,
    textAlign: "center",
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

export default GradeSelectionScreen;
