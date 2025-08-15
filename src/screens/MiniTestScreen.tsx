import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Typography } from "../ui/Typography";
import { ds } from "../ui/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
// import * as Haptics from "expo-haptics";

import { colors } from "../constants/colors";
import { Topic } from "../types";
import { RootStackParamList } from "../navigation/AppNavigator";
import { NavigationProp, RouteProp } from "@react-navigation/native";
import { moneyTopic } from "../data";
import { saveTestResult } from "../utils/progressStorage";
import { logEvent } from "../utils/analytics";
import { useAdvancedAnalytics } from "../hooks/useAdvancedAnalytics";
import { useThrottle } from "../hooks/useThrottle";

const { width, height } = Dimensions.get("window");

interface MiniTestScreenProps {
  navigation: NavigationProp<RootStackParamList, "MiniTest">;
  route: RouteProp<RootStackParamList, "MiniTest">;
}

export const MiniTestScreen: React.FC<MiniTestScreenProps> = ({
  navigation,
  route,
}) => {
  const { topic, blockId } = route.params;
  const { startTestAttempt, addQuestionAttempt, completeTestAttempt } = useAdvancedAnalytics();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);

  // Animation values
  const questionOpacity = useSharedValue(0);
  const questionTranslateY = useSharedValue(30);
  const optionScale = useSharedValue(1);
  const explanationOpacity = useSharedValue(0);
  const resultScale = useSharedValue(0.8);

  // Используем реальные вопросы из темы "Деньги" (t("contentTopics.money.title"))
  const questions = moneyTopic.quiz.questions;

  // Используем реальные вопросы из темы "Деньги"
  const currentQuestion = questions[currentQuestionIndex];
  const optionsSafe = currentQuestion.options ?? [];
  const totalQuestions = questions.length;

  useEffect(() => {
    // Start animations for new question
    questionOpacity.value = 0;
    questionTranslateY.value = 30;
    optionScale.value = 1;

    questionOpacity.value = withTiming(1, { duration: 600 });
    questionTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });

    // Инициализируем тестовую попытку при первом рендере
    if (currentQuestionIndex === 0) {
      (async () => {
        try {
          await startTestAttempt(topic.id);
        } catch (error) {
          console.error('Failed to start test attempt:', error);
        }
      })();
    }
  }, [currentQuestionIndex]);

  const handleAnswerSelectUnthrottled = async (answerIndex: number) => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Временно отключено для веб

    console.log(
      "Выбран ответ:",
      answerIndex,
      "для вопроса:",
      currentQuestionIndex
    );

    if (currentQuestion.type === "single") {
      setSelectedAnswers([answerIndex]);
      await checkAnswer([answerIndex]);
    } else if (currentQuestion.type === "multiple") {
      const newAnswers = selectedAnswers.includes(answerIndex)
        ? selectedAnswers.filter((i) => i !== answerIndex)
        : [...selectedAnswers, answerIndex];

      setSelectedAnswers(newAnswers);
      console.log("Множественный выбор:", newAnswers);

      // Auto-check if all correct answers are selected
      if (
        currentQuestion.correctAnswer &&
        Array.isArray(currentQuestion.correctAnswer) &&
        newAnswers.length === currentQuestion.correctAnswer.length &&
        currentQuestion.correctAnswer.every((answerId: string) => {
          const optionIndex = currentQuestion.options?.findIndex(
            (opt) => opt.id === answerId
          );
          return (
            optionIndex !== undefined &&
            optionIndex >= 0 &&
            newAnswers.includes(optionIndex)
          );
        })
      ) {
        await checkAnswer(newAnswers);
      }
    }
  };

  const handleAnswerSelect = useThrottle(handleAnswerSelectUnthrottled, 200);

  const checkAnswer = async (answers: number[]) => {
    let correct = false;

    if (currentQuestion.type === "single") {
      // Для single choice сравниваем с correctAnswer
      const selectedOptionId = currentQuestion.options?.[answers[0]]?.id;
      correct = selectedOptionId === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === "multiple") {
      // Для multiple choice проверяем все правильные ответы
      const selectedOptionIds = answers.map(
        (index) => currentQuestion.options?.[index]?.id
      );
      if (Array.isArray(currentQuestion.correctAnswer)) {
        correct =
          selectedOptionIds.length === currentQuestion.correctAnswer.length &&
          currentQuestion.correctAnswer.every((id) =>
            selectedOptionIds.includes(id)
          );
      }
    }

    console.log("Проверка ответа:", {
      correct,
      answers,
      correctAnswer: currentQuestion.correctAnswer,
    });

    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Временно отключено для веб
    } else {
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Временно отключено для веб
    }

    // Записываем попытку ответа в аналитику
    try {
      const selectedOptionId = currentQuestion.options?.[answers[0]]?.id;
      const correctAnswerId = currentQuestion.correctAnswer;
      const timeSpent = 5000; // TODO: Реальное время ответа
      
      await addQuestionAttempt(
        currentQuestion.id || `question_${currentQuestionIndex}`,
        selectedOptionId || '',
        Array.isArray(correctAnswerId) ? correctAnswerId[0] || '' : correctAnswerId || '',
        timeSpent,
        0 // hintsUsed
      );
    } catch (error) {
      console.error('Failed to add question attempt:', error);
    }

    setShowExplanation(true);
    explanationOpacity.value = withTiming(1, { duration: 500 });
  };

  const handleNext = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Временно отключено для веб

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
      setShowExplanation(false);
    } else {
      // Завершаем тест
      handleFinishTest();
    }
  };

  const handleBack = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Временно отключено для веб
    navigation.goBack();
  };

  const handleContinue = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Временно отключено для веб
    // Navigate to next theory block or control test
    logEvent("continue_after_test", { topicId: topic.id });
    navigation.navigate("TheoryBlock", {
      topic,
      blockIndex: 1,
    });
  };

  const handleFinishTest = async () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); // Временно отключено для веб

    // Сохраняем результат теста
    await saveTestResult(topic.id, score, totalQuestions);
    logEvent("finish_test", {
      topicId: topic.id,
      score,
      totalQuestions,
    });

    // Завершаем тестовую попытку в аналитике
    try {
      await completeTestAttempt();
    } catch (error) {
      console.error('Failed to complete test attempt:', error);
    }

    setTestCompleted(true);
    console.log(
      "Тест завершен. Правильных ответов:",
      score,
      "из",
      totalQuestions
    );
  };

  // Animated styles
  const questionAnimatedStyle = useAnimatedStyle(() => ({
    opacity: questionOpacity.value,
    transform: [{ translateY: questionTranslateY.value }],
  }));

  const explanationAnimatedStyle = useAnimatedStyle(() => ({
    opacity: explanationOpacity.value,
  }));

  const resultAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: resultScale.value }],
  }));

  const renderQuestion = () => {
    if (currentQuestion.type === "flipcard") {
      return (
        <View style={styles.flipCardContainer}>
          <TouchableOpacity
            style={styles.flipCard}
            onPress={() => {
              // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Временно отключено для веб
              setShowExplanation(!showExplanation);
            }}
          >
            <LinearGradient
              colors={[...colors.gradients.primary]}
              style={styles.flipCardGradient}
            >
              <Typography variant="body" style={styles.flipCardText}>
                {showExplanation
                  ? (currentQuestion as any).back
                  : (currentQuestion as any).front}
              </Typography>
              <Ionicons
                name="refresh"
                size={24}
                color="white"
                style={styles.flipIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
          {(currentQuestion as any).visualHint && (
            <Typography variant="caption" style={styles.flipHint}>
              {(currentQuestion as any).visualHint}
            </Typography>
          )}
        </View>
      );
    }

    return (
      <View style={styles.questionContainer}>
        <Typography variant="subtitle" style={styles.questionText}>
          {(currentQuestion as any).text}
        </Typography>

        <View style={styles.optionsContainer}>
          {optionsSafe.map((option: any, index: number) => {
            const isSelected = selectedAnswers.includes(index);
            const isCorrect = Array.isArray(currentQuestion.correctAnswer)
              ? (currentQuestion.correctAnswer as string[]).includes(option?.id)
              : option?.id === currentQuestion.correctAnswer;

            const optionStyle = [
              styles.option,
              showExplanation && isCorrect ? styles.correctOption : undefined,
              showExplanation && isSelected && !isCorrect
                ? styles.incorrectOption
                : undefined,
              !showExplanation && isSelected
                ? styles.selectedOption
                : undefined,
            ].filter(Boolean) as any;

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <View style={styles.optionContent}>
                  <Typography variant="body" style={styles.optionText}>
                    {String(option.text ?? option)}
                  </Typography>
                  {showExplanation && isCorrect && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={colors.success}
                    />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <Ionicons
                      name="close-circle"
                      size={24}
                      color={colors.error}
                    />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  const renderExplanation = () => {
    if (!showExplanation || !currentQuestion.explanation) return null;

    return (
      <Animated.View
        style={[styles.explanationContainer, explanationAnimatedStyle]}
      >
        <View style={styles.explanationHeader}>
          <Ionicons
            name={isCorrect ? "checkmark-circle" : "information-circle"}
            size={24}
            color={isCorrect ? colors.success : colors.warning}
          />
          <Typography variant="subtitle" style={styles.explanationTitle}>
            {isCorrect ? "Правильно!" : "Попробуй еще раз"}
          </Typography>
        </View>

        <Typography variant="body" style={styles.explanationText}>
          {currentQuestion.explanation}
        </Typography>

        {(currentQuestion as any).visualExample && (
          <View style={styles.visualExampleContainer}>
            <Image
              source={{ uri: (currentQuestion as any).visualExample.url }}
              style={styles.visualExampleImage}
              resizeMode="cover"
            />
            <Typography variant="caption" style={styles.visualExampleText}>
              {(currentQuestion as any).visualExample.altText}
            </Typography>
          </View>
        )}
      </Animated.View>
    );
  };

  const renderResult = () => {
    if (!testCompleted) return null;

    const percentage = Math.round((score / totalQuestions) * 100);
    const isExcellent = percentage >= 90;
    const isGood = percentage >= 70;
    const isSatisfactory = percentage >= 50;

    return (
      <Animated.View style={[styles.resultContainer, resultAnimatedStyle]}>
        <View style={styles.resultHeader}>
          <Ionicons
            name={isExcellent ? "trophy" : isGood ? "star" : "checkmark-circle"}
            size={48}
            color={
              isExcellent
                ? colors.premium
                : isGood
                ? colors.warning
                : colors.success
            }
          />
          <Typography variant="heroTitle" style={styles.resultTitle}>
            {isExcellent
              ? "Отлично!"
              : isGood
              ? "Хорошо!"
              : isSatisfactory
              ? "Удовлетворительно"
              : "Нужно подтянуть"}
          </Typography>
        </View>

        <View style={styles.scoreContainer}>
          <Typography variant="body" style={styles.scoreText}>
            {score} из {totalQuestions}
          </Typography>
          <Typography variant="heroTitle" style={styles.percentageText}>
            {percentage}%
          </Typography>
        </View>

        <View style={styles.resultProgressBar}>
          <View
            style={[
              styles.resultProgressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isExcellent
                  ? colors.premium
                  : isGood
                  ? colors.warning
                  : colors.success,
              },
            ]}
          />
        </View>

        <Typography variant="body" style={styles.resultMessage}>
          {isExcellent
            ? "Ты отлично усвоил материал! 🎉"
            : isGood
            ? "Ты хорошо понял основные моменты! 👍"
            : isSatisfactory
            ? "Есть что подтянуть, но основа понятна."
            : "Рекомендуем повторить материал еще раз."}
        </Typography>
      </Animated.View>
    );
  };

  if (testCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[...colors.gradients.primary]}
          style={styles.background}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Typography variant="title" style={styles.headerTitle}>
              Результаты теста
            </Typography>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {renderResult()}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[...colors.gradients.primary]}
                style={styles.continueButtonGradient}
              >
                <Typography variant="button" style={styles.continueButtonText}>
                  Продолжить изучение
                </Typography>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[...colors.gradients.primary]}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Назад"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Typography variant="title" style={styles.headerTitle}>
            Проверь понимание
          </Typography>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.headerProgressBar}>
          <View
            style={[
              styles.headerProgressFill,
              {
                width: `${
                  ((currentQuestionIndex + 1) / totalQuestions) * 100
                }%`,
              },
            ]}
          />
        </View>
        <Typography variant="caption" style={styles.progressText}>
          {currentQuestionIndex + 1} из {totalQuestions}
        </Typography>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, questionAnimatedStyle]}>
            {renderQuestion()}
            {renderExplanation()}
          </Animated.View>
        </ScrollView>

        {showExplanation && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={
                currentQuestionIndex < totalQuestions - 1
                  ? "Следующий вопрос"
                  : "Завершить тест"
              }
            >
              <LinearGradient
                colors={[...colors.gradients.primary]}
                style={styles.nextButtonGradient}
              >
                <Typography variant="button" style={styles.nextButtonText}>
                  {currentQuestionIndex < totalQuestions - 1
                    ? "Следующий вопрос"
                    : "Завершить тест"}
                </Typography>
                <Ionicons
                  name={
                    currentQuestionIndex < totalQuestions - 1
                      ? "arrow-forward"
                      : "checkmark"
                  }
                  size={24}
                  color="white"
                />
              </LinearGradient>
            </TouchableOpacity>

            {/* Подсказка под кнопкой */}
            <Typography variant="caption" style={styles.buttonHint}>
              {currentQuestionIndex < totalQuestions - 1
                ? `Вопрос ${currentQuestionIndex + 2} из ${totalQuestions}`
                : "Посмотреть результаты теста"}
            </Typography>
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: ds.spacing.lg,
    paddingVertical: ds.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: ds.radius.pill,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "white",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ds.spacing.lg,
    paddingVertical: ds.spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: ds.radius.sm,
    marginRight: ds.spacing.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: ds.radius.sm,
  },
  progressText: {
    color: "white",
    minWidth: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: ds.spacing.lg,
  },
  content: {
    backgroundColor: "white",
    margin: ds.spacing.lg,
    borderRadius: ds.radius.xl,
    padding: ds.spacing.lg,
    ...ds.shadow.card,
  },
  questionContainer: {
    marginBottom: ds.spacing.lg,
  },
  questionText: {
    color: colors.text,
    marginBottom: ds.spacing.lg,
    textAlign: "center",
  },
  optionsContainer: {
    gap: ds.spacing.sm,
  },
  option: {
    backgroundColor: colors.card,
    borderRadius: ds.radius.lg,
    padding: ds.spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  correctOption: {
    borderColor: colors.success,
    backgroundColor: colors.success + "10",
  },
  incorrectOption: {
    borderColor: colors.error,
    backgroundColor: colors.error + "10",
  },
  optionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: {
    color: colors.text,
    flex: 1,
  },
  flipCardContainer: {
    alignItems: "center",
    marginBottom: ds.spacing.lg,
  },
  flipCard: {
    width: width - 80,
    height: 120,
    borderRadius: ds.radius.lg,
    overflow: "hidden",
    ...ds.shadow.card,
  },
  flipCardGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: ds.spacing.lg,
  },
  flipCardText: {
    color: "white",
    textAlign: "center",
    marginBottom: ds.spacing.sm,
  },
  flipIcon: {
    position: "absolute",
    bottom: ds.spacing.sm,
    right: ds.spacing.sm,
  },
  flipHint: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: ds.spacing.sm,
    fontStyle: "italic",
  },
  explanationContainer: {
    backgroundColor: colors.card,
    borderRadius: ds.radius.lg,
    padding: ds.spacing.md,
    marginTop: ds.spacing.lg,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ds.spacing.sm,
  },
  explanationTitle: {
    color: colors.text,
    marginLeft: ds.spacing.sm,
  },
  explanationText: {
    color: colors.textSecondary,
    marginBottom: ds.spacing.sm,
  },
  visualExampleContainer: {
    alignItems: "center",
  },
  visualExampleImage: {
    width: "100%",
    height: 120,
    borderRadius: ds.radius.md,
    marginBottom: ds.spacing.sm,
  },
  visualExampleText: {
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  resultContainer: {
    backgroundColor: "white",
    margin: ds.spacing.lg,
    borderRadius: ds.radius.xl,
    padding: ds.spacing.xl,
    alignItems: "center",
    ...ds.shadow.card,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: ds.spacing.xl,
  },
  resultTitle: {
    color: colors.text,
    marginTop: ds.spacing.sm,
    textAlign: "center",
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: ds.spacing.lg,
  },
  scoreText: {
    color: colors.textSecondary,
    marginBottom: ds.spacing.xs,
  },
  percentageText: {
    color: colors.primary,
  },
  headerProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: ds.radius.sm,
    marginRight: ds.spacing.sm,
    overflow: "hidden",
  },
  headerProgressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: ds.radius.sm,
  },
  resultProgressBar: {
    width: "100%",
    height: 8,
    backgroundColor: colors.border,
    borderRadius: ds.radius.md,
    marginBottom: ds.spacing.lg,
    overflow: "hidden",
  },
  resultProgressFill: {
    height: "100%",
  },
  resultMessage: {
    color: colors.textSecondary,
    textAlign: "center",
  },
  footer: {
    backgroundColor: "white",
    borderTopLeftRadius: ds.radius.xl,
    borderTopRightRadius: ds.radius.xl,
    paddingHorizontal: ds.spacing.lg,
    paddingVertical: ds.spacing.md,
    ...ds.shadow.card,
  },
  nextButton: {
    borderRadius: ds.radius.lg,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ds.spacing.md,
    paddingHorizontal: ds.spacing.lg,
  },
  nextButtonText: {
    color: "white",
    marginRight: ds.spacing.sm,
  },
  continueButton: {
    borderRadius: ds.radius.lg,
    overflow: "hidden",
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ds.spacing.md,
    paddingHorizontal: ds.spacing.lg,
  },
  continueButtonText: {
    color: "white",
    marginRight: ds.spacing.sm,
  },
  buttonHint: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: ds.spacing.sm,
    fontStyle: "italic",
  },
});

export default MiniTestScreen;
