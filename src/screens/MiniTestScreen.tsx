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
import { Topic, Question } from "../types";
import { moneyTopic } from "../data";

const { width, height } = Dimensions.get("window");

interface MiniTestScreenProps {
  navigation: any;
  route: {
    params: {
      topic: Topic;
      blockId: string;
    };
  };
}

export const MiniTestScreen: React.FC<MiniTestScreenProps> = ({
  navigation,
  route,
}) => {
  const { topic, blockId } = route.params;
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

  // Используем реальные вопросы из темы "Деньги"
  const questions = moneyTopic.quiz.questions;

  // Используем реальные вопросы из темы "Деньги"
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  useEffect(() => {
    // Start animations for new question
    questionOpacity.value = 0;
    questionTranslateY.value = 30;
    optionScale.value = 1;

    questionOpacity.value = withTiming(1, { duration: 600 });
    questionTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answerIndex: number) => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Временно отключено для веб

    console.log("Выбран ответ:", answerIndex, "для вопроса:", currentQuestionIndex);

    if (currentQuestion.type === "single") {
      setSelectedAnswers([answerIndex]);
      checkAnswer([answerIndex]);
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
          const optionIndex = currentQuestion.options.findIndex(opt => opt.id === answerId);
          return newAnswers.includes(optionIndex);
        })
      ) {
        checkAnswer(newAnswers);
      }
    }
  };

  const checkAnswer = (answers: number[]) => {
    let correct = false;

    if (currentQuestion.type === "single") {
      // Для single choice сравниваем с correctAnswer
      const selectedOptionId = currentQuestion.options[answers[0]]?.id;
      correct = selectedOptionId === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === "multiple") {
      // Для multiple choice проверяем все правильные ответы
      const selectedOptionIds = answers.map(index => currentQuestion.options[index]?.id);
      if (Array.isArray(currentQuestion.correctAnswer)) {
        correct = 
          selectedOptionIds.length === currentQuestion.correctAnswer.length &&
          currentQuestion.correctAnswer.every(id => selectedOptionIds.includes(id));
      }
    }

    console.log("Проверка ответа:", { correct, answers, correctAnswer: currentQuestion.correctAnswer });

    setIsCorrect(correct);
    if (correct) {
      setScore(score + 1);
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // Временно отключено для веб
    } else {
      // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); // Временно отключено для веб
    }

    setShowExplanation(true);
    explanationOpacity.value = withTiming(1, { duration: 500 });
  };

  const handleNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
      setShowExplanation(false);
      explanationOpacity.value = 0;
    } else {
      // Test completed
      setTestCompleted(true);
      resultScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to next theory block or control test
    navigation.navigate("TheoryBlock", {
      topic,
      blockIndex: 1, // Next block
    });
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
    if (currentQuestion.type === "flip_card") {
      return (
        <View style={styles.flipCardContainer}>
          <TouchableOpacity
            style={styles.flipCard}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShowExplanation(!showExplanation);
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.flipCardGradient}
            >
              <Text style={styles.flipCardText}>
                {showExplanation ? currentQuestion.back : currentQuestion.front}
              </Text>
              <Ionicons
                name="refresh"
                size={24}
                color="white"
                style={styles.flipIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
          {currentQuestion.visualHint && (
            <Text style={styles.flipHint}>{currentQuestion.visualHint}</Text>
          )}
        </View>
      );
    }

    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedAnswers.includes(index);
            const isCorrect =
              currentQuestion.type === "single_choice"
                ? index === currentQuestion.correctIndex
                : currentQuestion.correctIndexes?.includes(index);

            let optionStyle = styles.option;
            if (showExplanation) {
              if (isCorrect) {
                optionStyle = [styles.option, styles.correctOption];
              } else if (isSelected && !isCorrect) {
                optionStyle = [styles.option, styles.incorrectOption];
              }
            } else if (isSelected) {
              optionStyle = [styles.option, styles.selectedOption];
            }

            return (
              <TouchableOpacity
                key={index}
                style={optionStyle}
                onPress={() => handleAnswerSelect(index)}
                disabled={showExplanation}
              >
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>{option}</Text>
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
          <Text style={styles.explanationTitle}>
            {isCorrect ? "Правильно!" : "Попробуй еще раз"}
          </Text>
        </View>

        <Text style={styles.explanationText}>
          {currentQuestion.explanation}
        </Text>

        {currentQuestion.visualExample && (
          <View style={styles.visualExampleContainer}>
            <Image
              source={{ uri: currentQuestion.visualExample.url }}
              style={styles.visualExampleImage}
              resizeMode="cover"
            />
            <Text style={styles.visualExampleText}>
              {currentQuestion.visualExample.altText}
            </Text>
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
          <Text style={styles.resultTitle}>
            {isExcellent
              ? "Отлично!"
              : isGood
              ? "Хорошо!"
              : isSatisfactory
              ? "Удовлетворительно"
              : "Нужно подтянуть"}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>
            {score} из {totalQuestions}
          </Text>
          <Text style={styles.percentageText}>{percentage}%</Text>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
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

        <Text style={styles.resultMessage}>
          {isExcellent
            ? "Ты отлично усвоил материал! 🎉"
            : isGood
            ? "Ты хорошо понял основные моменты! 👍"
            : isSatisfactory
            ? "Есть что подтянуть, но основа понятна."
            : "Рекомендуем повторить материал еще раз."}
        </Text>
      </Animated.View>
    );
  };

  if (testCompleted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.background}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Результаты теста</Text>
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
                colors={[colors.primary, colors.primaryDark]}
                style={styles.continueButtonGradient}
              >
                <Text style={styles.continueButtonText}>
                  Продолжить изучение
                </Text>
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
        colors={[colors.primary, colors.primaryDark]}
        style={styles.background}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Проверь понимание</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentQuestionIndex + 1) / totalQuestions) * 100
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1} из {totalQuestions}
          </Text>
        </View>

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
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.nextButtonGradient}
              >
                <Text style={styles.nextButtonText}>
                  {currentQuestionIndex < totalQuestions - 1
                    ? "Следующий вопрос"
                    : "Завершить тест"}
                </Text>
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
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginRight: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
    minWidth: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  questionContainer: {
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
    textAlign: "center",
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
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
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  flipCardContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  flipCard: {
    width: width - 80,
    height: 120,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  flipCardGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  flipCardText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  flipIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  flipHint: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    fontStyle: "italic",
  },
  explanationContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  explanationHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 8,
  },
  explanationText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  visualExampleContainer: {
    alignItems: "center",
  },
  visualExampleImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  visualExampleText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    fontStyle: "italic",
  },
  resultContainer: {
    backgroundColor: "white",
    margin: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 12,
    textAlign: "center",
  },
  scoreContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  percentageText: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.primary,
  },
  progressBar: {
    width: "100%",
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    marginBottom: 20,
    overflow: "hidden",
  },
  resultMessage: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
  },
  footer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
  continueButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  continueButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  continueButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 8,
  },
});

export default MiniTestScreen;
