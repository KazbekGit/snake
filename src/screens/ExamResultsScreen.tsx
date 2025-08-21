import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { useAppTheme } from "../theme/ThemeProvider";
import { QuizQuestion } from "../content/schema";

interface ExamResultsScreenParams {
  sectionId: string;
  examType: "oge" | "ege";
  score: number;
  totalQuestions: number;
  answers: Record<number, string | string[]>;
  questions: QuizQuestion[];
}

interface QuestionResult {
  question: QuizQuestion;
  userAnswer: string | string[];
  isCorrect: boolean;
  correctAnswer: string | string[];
  explanation?: string;
}

export const ExamResultsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useAppTheme();
  const { sectionId, examType, score, totalQuestions, answers, questions } =
    route.params as ExamResultsScreenParams;

  const [showDetails, setShowDetails] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<
    number | null
  >(null);

  // Анализируем результаты
  const results: QuestionResult[] = questions.map((question, index) => {
    const userAnswer = answers[index];
    let isCorrect = false;
    let correctAnswer: string | string[] = "";

    if (question.type === "single") {
      correctAnswer = question.correctAnswer || "";
      isCorrect = userAnswer === correctAnswer;
    } else if (question.type === "multiple") {
      correctAnswer = Array.isArray(question.correctAnswer)
        ? question.correctAnswer
        : [question.correctAnswer || ""];
      const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
      isCorrect =
        userAnswers.length === correctAnswer.length &&
        userAnswers.every((ans) => correctAnswer.includes(ans));
    }

    return {
      question,
      userAnswer: userAnswer || "Не отвечено",
      isCorrect,
      correctAnswer,
      explanation: question.explanation,
    };
  });

  const correctAnswers = results.filter((r) => r.isCorrect).length;
  const incorrectAnswers = results.filter((r) => !r.isCorrect).length;
  const unansweredQuestions = results.filter(
    (r) => r.userAnswer === "Не отвечено"
  ).length;

  // Оценка результата
  const getGrade = (score: number): string => {
    if (score >= 90) return "Отлично";
    if (score >= 80) return "Хорошо";
    if (score >= 70) return "Удовлетворительно";
    if (score >= 60) return "Неудовлетворительно";
    return "Плохо";
  };

  const getRecommendation = (score: number): string => {
    if (score >= 90) {
      return "Отличный результат! Вы хорошо знаете материал. Можете переходить к более сложным темам.";
    } else if (score >= 80) {
      return "Хороший результат! Рекомендуем повторить темы, где были допущены ошибки.";
    } else if (score >= 70) {
      return "Удовлетворительный результат. Необходимо повторить материал и пройти тест еще раз.";
    } else {
      return "Результат требует улучшения. Рекомендуем внимательно изучить теорию и пройти тест повторно.";
    }
  };

  const handleRetakeExam = () => {
    Alert.alert(
      "Повторить экзамен?",
      "Вы уверены, что хотите пройти экзамен еще раз?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Повторить",
          onPress: () =>
            navigation.navigate("ExamMode", { sectionId, examType }),
        },
      ]
    );
  };

  const handleShowQuestionDetails = (index: number) => {
    setSelectedQuestionIndex(selectedQuestionIndex === index ? null : index);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Заголовок */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <Typography variant="h3" style={styles.title}>
          Результаты экзамена
        </Typography>
        <Typography variant="h4" style={styles.subtitle}>
          {examType === "ege" ? "ЕГЭ" : "ОГЭ"}
        </Typography>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Основная статистика */}
        <View style={styles.statsContainer}>
          <View style={styles.scoreCard}>
            <Typography variant="h2" style={styles.scoreText}>
              {score}%
            </Typography>
            <Typography variant="body" style={styles.scoreLabel}>
              {getGrade(score)}
            </Typography>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.statRow}>
              <Typography variant="body">Правильных ответов:</Typography>
              <Typography variant="body" style={styles.correctCount}>
                {correctAnswers} из {totalQuestions}
              </Typography>
            </View>
            <View style={styles.statRow}>
              <Typography variant="body">Неправильных ответов:</Typography>
              <Typography variant="body" style={styles.incorrectCount}>
                {incorrectAnswers}
              </Typography>
            </View>
            {unansweredQuestions > 0 && (
              <View style={styles.statRow}>
                <Typography variant="body">Не отвечено:</Typography>
                <Typography variant="body" style={styles.unansweredCount}>
                  {unansweredQuestions}
                </Typography>
              </View>
            )}
          </View>
        </View>

        {/* Рекомендации */}
        <View style={styles.recommendationContainer}>
          <Typography variant="h5" style={styles.recommendationTitle}>
            Рекомендации
          </Typography>
          <Typography variant="body" style={styles.recommendationText}>
            {getRecommendation(score)}
          </Typography>
        </View>

        {/* Детальный анализ */}
        <View style={styles.detailsSection}>
          <View style={styles.sectionHeader}>
            <Typography variant="h5" style={styles.sectionTitle}>
              Детальный анализ
            </Typography>
            <TouchableOpacity
              onPress={() => setShowDetails(!showDetails)}
              style={styles.toggleButton}
            >
              <Typography variant="body" style={styles.toggleText}>
                {showDetails ? "Скрыть" : "Показать"}
              </Typography>
            </TouchableOpacity>
          </View>

          {showDetails && (
            <View style={styles.questionsList}>
              {results.map((result, index) => (
                <View key={index} style={styles.questionItem}>
                  <TouchableOpacity
                    onPress={() => handleShowQuestionDetails(index)}
                    style={[
                      styles.questionHeader,
                      {
                        backgroundColor: result.isCorrect
                          ? colors.successLight
                          : colors.errorLight,
                      },
                    ]}
                  >
                    <View style={styles.questionInfo}>
                      <Typography variant="body" style={styles.questionNumber}>
                        Вопрос {index + 1}
                      </Typography>
                      <Typography variant="caption" style={styles.questionType}>
                        {result.question.type === "single"
                          ? "Один ответ"
                          : result.question.type === "multiple"
                          ? "Несколько ответов"
                          : "Карточка"}
                      </Typography>
                    </View>
                    <View style={styles.resultIndicator}>
                      {result.isCorrect ? (
                        <Typography variant="body" style={styles.correctIcon}>
                          ✓
                        </Typography>
                      ) : (
                        <Typography variant="body" style={styles.incorrectIcon}>
                          ✗
                        </Typography>
                      )}
                    </View>
                  </TouchableOpacity>

                  {selectedQuestionIndex === index && (
                    <View style={styles.questionDetails}>
                      <Typography variant="body" style={styles.questionText}>
                        {result.question.question}
                      </Typography>

                      <View style={styles.answerSection}>
                        <Typography variant="body" style={styles.answerLabel}>
                          Ваш ответ:
                        </Typography>
                        <Typography variant="body" style={styles.userAnswer}>
                          {Array.isArray(result.userAnswer)
                            ? result.userAnswer.join(", ")
                            : result.userAnswer}
                        </Typography>
                      </View>

                      <View style={styles.answerSection}>
                        <Typography variant="body" style={styles.answerLabel}>
                          Правильный ответ:
                        </Typography>
                        <Typography variant="body" style={styles.correctAnswer}>
                          {Array.isArray(result.correctAnswer)
                            ? result.correctAnswer.join(", ")
                            : result.correctAnswer}
                        </Typography>
                      </View>

                      {result.explanation && (
                        <View style={styles.explanationSection}>
                          <Typography
                            variant="body"
                            style={styles.explanationLabel}
                          >
                            Объяснение:
                          </Typography>
                          <Typography
                            variant="body"
                            style={styles.explanationText}
                          >
                            {result.explanation}
                          </Typography>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Кнопки действий */}
      <View style={styles.actions}>
        <Button
          variant="contained"
          onPress={handleRetakeExam}
          style={styles.retakeButton}
        >
          Повторить экзамен
        </Button>

        <Button
          variant="outlined"
          onPress={() => navigation.navigate("Home")}
          style={styles.homeButton}
        >
          Вернуться на главную
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: "center",
  },
  title: {
    color: "white",
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: "white",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreCard: {
    alignItems: "center",
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#2196F3",
  },
  scoreLabel: {
    fontSize: 18,
    color: "#666",
    marginTop: 8,
  },
  detailsContainer: {
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  correctCount: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  incorrectCount: {
    color: "#F44336",
    fontWeight: "bold",
  },
  unansweredCount: {
    color: "#FF9800",
    fontWeight: "bold",
  },
  recommendationContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationTitle: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  recommendationText: {
    lineHeight: 22,
  },
  detailsSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "bold",
  },
  toggleButton: {
    padding: 8,
  },
  toggleText: {
    color: "#2196F3",
  },
  questionsList: {
    gap: 12,
  },
  questionItem: {
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  questionInfo: {
    flex: 1,
  },
  questionNumber: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  questionType: {
    color: "#666",
  },
  resultIndicator: {
    marginLeft: 12,
  },
  correctIcon: {
    color: "#4CAF50",
    fontSize: 20,
    fontWeight: "bold",
  },
  incorrectIcon: {
    color: "#F44336",
    fontSize: 20,
    fontWeight: "bold",
  },
  questionDetails: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  questionText: {
    marginBottom: 16,
    lineHeight: 20,
  },
  answerSection: {
    marginBottom: 12,
  },
  answerLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  userAnswer: {
    color: "#666",
  },
  correctAnswer: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  explanationSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  explanationLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  explanationText: {
    lineHeight: 20,
    color: "#666",
  },
  actions: {
    padding: 20,
    gap: 12,
  },
  retakeButton: {
    width: "100%",
  },
  homeButton: {
    width: "100%",
  },
});
