import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { useAppTheme } from "../theme/ThemeProvider";
import { generateExamQuestions } from "../utils/questionGenerator";
import { QuizQuestion } from "../content/schema";

const { width } = Dimensions.get("window");

interface ExamModeScreenParams {
  sectionId: string;
  examType: "oge" | "ege";
}

interface ExamState {
  currentQuestionIndex: number;
  answers: Record<number, string | string[]>;
  timeRemaining: number;
  isCompleted: boolean;
  score: number;
  totalQuestions: number;
}

export const ExamModeScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors } = useAppTheme();
  const { sectionId, examType } = route.params as ExamModeScreenParams;

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [examState, setExamState] = useState<ExamState>({
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: examType === "ege" ? 180 * 60 : 120 * 60, // 3 часа для ЕГЭ, 2 часа для ОГЭ
    isCompleted: false,
    score: 0,
    totalQuestions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем вопросы при монтировании
  useEffect(() => {
    const loadQuestions = () => {
      const examQuestions = generateExamQuestions(sectionId, examType);
      setQuestions(examQuestions);
      setExamState((prev) => ({
        ...prev,
        totalQuestions: examQuestions.length,
      }));
      setIsLoading(false);
    };

    loadQuestions();
  }, [sectionId, examType]);

  // Таймер экзамена
  useEffect(() => {
    if (examState.isCompleted || examState.timeRemaining <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setExamState((prev) => {
        const newTimeRemaining = prev.timeRemaining - 1;

        if (newTimeRemaining <= 0) {
          // Время вышло, завершаем экзамен
          completeExam();
          return { ...prev, timeRemaining: 0, isCompleted: true };
        }

        return { ...prev, timeRemaining: newTimeRemaining };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState.isCompleted, examState.timeRemaining]);

  // Форматирование времени
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Обработка ответа
  const handleAnswer = useCallback((answer: string | string[]) => {
    setExamState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [prev.currentQuestionIndex]: answer,
      },
    }));
  }, []);

  // Переход к следующему вопросу
  const nextQuestion = useCallback(() => {
    setExamState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.min(
        prev.currentQuestionIndex + 1,
        prev.totalQuestions - 1
      ),
    }));
  }, []);

  // Переход к предыдущему вопросу
  const prevQuestion = useCallback(() => {
    setExamState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
    }));
  }, []);

  // Завершение экзамена
  const completeExam = useCallback(() => {
    let correctAnswers = 0;

    questions.forEach((question, index) => {
      const userAnswer = examState.answers[index];
      if (!userAnswer) return;

      if (question.type === "single") {
        if (userAnswer === question.correctAnswer) {
          correctAnswers++;
        }
      } else if (question.type === "multiple") {
        const userAnswers = Array.isArray(userAnswer)
          ? userAnswer
          : [userAnswer];
        const correctAnswersArray = Array.isArray(question.correctAnswer)
          ? question.correctAnswer
          : [question.correctAnswer];

        if (
          userAnswers.length === correctAnswersArray.length &&
          userAnswers.every((ans) => correctAnswersArray.includes(ans))
        ) {
          correctAnswers++;
        }
      }
    });

    const score = Math.round((correctAnswers / questions.length) * 100);

    setExamState((prev) => ({
      ...prev,
      score,
      isCompleted: true,
    }));

    // Показываем результаты
    Alert.alert(
      "Экзамен завершен!",
      `Ваш результат: ${correctAnswers} из ${questions.length} (${score}%)`,
      [
        {
          text: "Посмотреть результаты",
          onPress: () =>
            navigation.navigate("ExamResults", {
              sectionId,
              examType,
              score,
              totalQuestions: questions.length,
              answers: examState.answers,
              questions,
            }),
        },
        {
          text: "Вернуться",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  }, [questions, examState.answers, navigation, sectionId, examType]);

  // Подтверждение завершения
  const confirmComplete = useCallback(() => {
    Alert.alert(
      "Завершить экзамен?",
      "Вы уверены, что хотите завершить экзамен? После завершения изменить ответы будет невозможно.",
      [
        { text: "Отмена", style: "cancel" },
        { text: "Завершить", onPress: completeExam, style: "destructive" },
      ]
    );
  }, [completeExam]);

  // Предупреждение о времени
  useEffect(() => {
    if (examState.timeRemaining === 300) {
      // 5 минут
      Alert.alert("Внимание!", "До окончания экзамена осталось 5 минут!");
    } else if (examState.timeRemaining === 60) {
      // 1 минута
      Alert.alert("Внимание!", "До окончания экзамена осталась 1 минута!");
    }
  }, [examState.timeRemaining]);

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Typography variant="body" style={styles.loadingText}>
            Загружаем экзамен...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  const currentQuestion = questions[examState.currentQuestionIndex];
  const userAnswer = examState.answers[examState.currentQuestionIndex];
  const isLastQuestion =
    examState.currentQuestionIndex === questions.length - 1;
  const isFirstQuestion = examState.currentQuestionIndex === 0;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Заголовок с таймером */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Typography variant="h3" style={styles.title}>
            {examType === "ege" ? "ЕГЭ" : "ОГЭ"}
          </Typography>
          <Typography variant="h4" style={styles.timer}>
            {formatTime(examState.timeRemaining)}
          </Typography>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((examState.currentQuestionIndex + 1) / questions.length) *
                    100
                  }%`,
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            {examState.currentQuestionIndex + 1} из {questions.length}
          </Typography>
        </View>
      </LinearGradient>

      {/* Контент вопроса */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Typography variant="h5" style={styles.questionNumber}>
            Вопрос {examState.currentQuestionIndex + 1}
          </Typography>

          <Typography variant="body" style={styles.questionText}>
            {currentQuestion.question}
          </Typography>

          {/* Варианты ответов */}
          {currentQuestion.type === "single" && currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    userAnswer === option && {
                      backgroundColor: colors.primaryLight,
                    },
                  ]}
                  onPress={() => handleAnswer(option)}
                >
                  <Typography variant="body" style={styles.optionText}>
                    {String.fromCharCode(65 + index)}. {option}
                  </Typography>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {currentQuestion.type === "multiple" && currentQuestion.options && (
            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
                const isSelected = userAnswers.includes(option);

                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      isSelected && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => {
                      const newAnswers = isSelected
                        ? userAnswers.filter((ans) => ans !== option)
                        : [...userAnswers, option];
                      handleAnswer(newAnswers);
                    }}
                  >
                    <Typography variant="body" style={styles.optionText}>
                      ☐ {option}
                    </Typography>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {currentQuestion.type === "flip_card" && (
            <View style={styles.flipCardContainer}>
              <Typography variant="body" style={styles.flipCardText}>
                {currentQuestion.front}
              </Typography>
              <Typography variant="caption" style={styles.flipCardHint}>
                Нажмите, чтобы увидеть ответ
              </Typography>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Навигация */}
      <View style={styles.navigation}>
        <View style={styles.navButtons}>
          <Button
            variant="outlined"
            onPress={prevQuestion}
            disabled={isFirstQuestion}
            style={styles.navButton}
          >
            Назад
          </Button>

          <Button
            variant="outlined"
            onPress={nextQuestion}
            disabled={isLastQuestion}
            style={styles.navButton}
          >
            Далее
          </Button>
        </View>

        <Button
          variant="contained"
          onPress={confirmComplete}
          style={styles.completeButton}
        >
          Завершить экзамен
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    color: "white",
    fontWeight: "bold",
  },
  timer: {
    color: "white",
    fontWeight: "bold",
  },
  progressContainer: {
    alignItems: "center",
  },
  progressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  progressText: {
    color: "white",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionNumber: {
    marginBottom: 12,
    fontWeight: "bold",
  },
  questionText: {
    marginBottom: 24,
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    backgroundColor: "white",
  },
  optionText: {
    lineHeight: 20,
  },
  flipCardContainer: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  flipCardText: {
    textAlign: "center",
    marginBottom: 12,
  },
  flipCardHint: {
    color: "#666",
    fontStyle: "italic",
  },
  navigation: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    backgroundColor: "white",
  },
  navButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  completeButton: {
    width: "100%",
  },
});
