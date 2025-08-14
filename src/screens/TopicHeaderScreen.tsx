import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
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
import { Topic } from "../types";
import { moneyTopic } from "../data";
import { getCachedUri } from "../utils/imageCache";
import {
  getTopicProgress,
  resetTopicProgress,
  TopicProgress,
} from "../utils/progressStorage";
import { logEvent } from "../utils/analytics";

const { width, height } = Dimensions.get("window");

interface TopicHeaderScreenProps {
  navigation: any;
  route: {
    params: {
      topic: Topic;
    };
  };
}

export const TopicHeaderScreen: React.FC<TopicHeaderScreenProps> = ({
  navigation,
  route,
}) => {
  const { topic } = route.params;
  const [topicProgress, setTopicProgress] = useState<TopicProgress | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [coverUri, setCoverUri] = useState<string | null>(null);

  // Animation values
  const headerOpacity = useSharedValue(0);
  const imageScale = useSharedValue(0.8);
  const contentTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(1);

  // Используем переданную тему или fallback на mockTopic
  const currentTopic = topic || {
    id: "topic_money_001",
    sectionId: "economics",
    title: "Деньги",
    description:
      "Узнай, что такое деньги, зачем они нужны и как работают в экономике",
    coverImage:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800",
    gradeLevel: 9,
    isPremium: false,
    estimatedTime: 15,
    difficulty: "medium",
    learningObjectives: [
      "Понять что такое деньги и их роль в экономике",
      "Изучить 5 основных функций денег",
      "Различать виды денег и их особенности",
    ],
    totalBlocks: 4,
    completedBlocks: 0,
  };

  // Загружаем прогресс темы
  useEffect(() => {
    const loadTopicProgress = async () => {
      try {
        const progress = await getTopicProgress(currentTopic.id);
        setTopicProgress(progress);
      } catch (error) {
        console.error("Error loading topic progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopicProgress();
  }, [currentTopic.id]);

  useEffect(() => {
    // Start animations
    headerOpacity.value = withTiming(1, { duration: 800 });
    imageScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cached = await getCachedUri(currentTopic.coverImage);
        if (mounted) setCoverUri(cached);
      } catch {
        if (mounted) setCoverUri(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [currentTopic.coverImage]);

  const handleStartLearning = () => {
    console.log("=== handleStartLearning вызвана ===");
    console.log("currentTopic:", currentTopic);
    console.log("topicProgress:", topicProgress);

    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Временно отключено для веб
    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 100 });
    });

    console.log("Начинаем изучение темы:", currentTopic.title);

    // Определяем с какого блока начать
    const startBlockIndex = topicProgress?.lastBlockIndex || 0;
    console.log("Переходим к блоку:", startBlockIndex + 1);

    // Navigate to theory block
    console.log("Навигация к TheoryBlock с параметрами:", {
      topic: currentTopic,
      blockIndex: startBlockIndex,
    });

    logEvent("start_topic", {
      topicId: currentTopic.id,
      fromBlock: startBlockIndex,
    });
    navigation.navigate("TheoryBlock", {
      topic: currentTopic,
      blockIndex: startBlockIndex,
    });
  };

  const handleBack = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Временно отключено для веб
    console.log("Возвращаемся назад");
    navigation.goBack();
  };

  const confirmResetProgress = () => {
    Alert.alert(
      "Сбросить прогресс",
      "Вы уверены, что хотите удалить прогресс по этой теме?",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Сбросить",
          style: "destructive",
          onPress: async () => {
            await resetTopicProgress(currentTopic.id);
            const updated = await getTopicProgress(currentTopic.id);
            setTopicProgress(updated);
          },
        },
      ]
    );
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }));

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: imageScale.value }],
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return colors.success;
      case "medium":
        return colors.warning;
      case "hard":
        return colors.error;
      default:
        return colors.warning;
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Легкий уровень";
      case "medium":
        return "Средний уровень";
      case "hard":
        return "Сложный уровень";
      default:
        return "Средний уровень";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.background}
      >
        {/** derive safe completed blocks for UI conditions */}
        {(() => {
          const _ = topicProgress?.completedBlocks ?? 0;
          return null;
        })()}
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Назад"
            style={styles.backButton}
            testID="back-button"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.sectionName}>Экономика</Text>
            <Text style={styles.topicTitle}>{currentTopic.title}</Text>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cover Image */}
          <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
            <Image
              source={{ uri: coverUri || currentTopic.coverImage }}
              style={styles.coverImage}
              resizeMode="cover"
              accessible
              accessibilityLabel={`Обложка темы ${currentTopic.title}`}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.7)"]}
              style={styles.imageOverlay}
            />
          </Animated.View>

          {/* Content */}
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{currentTopic.description}</Text>
            </View>

            {/* Learning Objectives */}
            <View style={styles.objectivesContainer}>
              <Text style={styles.objectivesTitle}>Что ты узнаешь:</Text>
              {currentTopic.learningObjectives?.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <View style={styles.objectiveIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.success}
                    />
                  </View>
                  <Text style={styles.objectiveText}>{objective}</Text>
                </View>
              ))}
            </View>

            {/* Topic Info Cards */}
            <View style={styles.infoCardsContainer}>
              <View style={styles.infoCard}>
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.infoCardValue}>
                  {currentTopic.estimatedTime || 15} мин
                </Text>
                <Text style={styles.infoCardLabel}>Время изучения</Text>
              </View>

              <View style={styles.infoCard}>
                <Ionicons
                  name="layers-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.infoCardValue}>
                  {currentTopic.totalBlocks ||
                    currentTopic.contentBlocks?.length ||
                    4}
                </Text>
                <Text style={styles.infoCardLabel}>Блоков теории</Text>
              </View>

              <View style={styles.infoCard}>
                <Ionicons
                  name="trophy-outline"
                  size={24}
                  color={colors.primary}
                />
                <Text style={styles.infoCardValue}>
                  {getDifficultyText(currentTopic.difficulty || "medium")}
                </Text>
                <Text style={styles.infoCardLabel}>Сложность</Text>
              </View>
            </View>

            {/* Difficulty Badge */}
            <View style={styles.difficultyContainer}>
              <View
                style={[
                  styles.difficultyBadge,
                  {
                    backgroundColor: getDifficultyColor(
                      currentTopic.difficulty || "medium"
                    ),
                  },
                ]}
              >
                <Text style={styles.difficultyBadgeText}>
                  {getDifficultyText(currentTopic.difficulty || "medium")}
                </Text>
              </View>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>Прогресс изучения</Text>
                <Text style={styles.progressPercentage}>
                  {Math.round(
                    ((topicProgress?.completedBlocks ?? 0) /
                      Math.max(
                        currentTopic.totalBlocks ||
                          currentTopic.contentBlocks?.length ||
                          1,
                        1
                      ) || 0) * 100
                  )}
                  %
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.round(
                        ((topicProgress?.completedBlocks ?? 0) /
                          Math.max(
                            currentTopic.totalBlocks ||
                              currentTopic.contentBlocks?.length ||
                              1,
                            1
                          ) || 0) * 100
                      )}%`,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Start Button */}
            <Animated.View
              style={[styles.buttonContainer, buttonAnimatedStyle]}
            >
              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartLearning}
                activeOpacity={0.8}
                testID="start-learning-button"
                accessibilityRole="button"
                accessibilityLabel={
                  (topicProgress?.completedBlocks ?? 0) > 0
                    ? "Продолжить изучение"
                    : "Начать изучение"
                }
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.startButtonGradient}
                  pointerEvents="none"
                >
                  <Ionicons name="play" size={24} color="white" />
                  <Text style={styles.startButtonText}>
                    {(topicProgress?.completedBlocks ?? 0) > 0
                      ? "Продолжить изучение"
                      : "Начать изучение"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Подсказка под кнопкой */}
              <Text style={styles.buttonHint}>
                {(topicProgress?.completedBlocks ?? 0) > 0
                  ? `Продолжить с блока ${
                      (topicProgress?.lastBlockIndex ?? 0) + 1
                    }`
                  : "Начать изучение темы с первого блока"}
              </Text>

              {/* Reset progress */}
              {topicProgress && (
                <TouchableOpacity
                  onPress={confirmResetProgress}
                  style={styles.resetButton}
                  testID="reset-progress-button"
                >
                  <Text style={styles.resetButtonText}>Сбросить прогресс</Text>
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Premium Badge (if applicable) */}
            {currentTopic.isPremium && (
              <View style={styles.premiumBadge}>
                <Ionicons
                  name="star-outline"
                  size={16}
                  color={colors.premium}
                />
                <Text style={styles.premiumText}>Premium контент</Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
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
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  sectionName: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  topicTitle: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    width: width,
    height: height * 0.3,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: "center",
  },
  objectivesContainer: {
    marginBottom: 24,
  },
  objectivesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  objectiveIcon: {
    marginRight: 12,
  },
  objectiveText: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  infoCardsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginTop: 8,
  },
  infoCardLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: "center",
  },
  difficultyContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  difficultyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  difficultyBadgeText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  buttonContainer: {
    marginBottom: 16,
  },
  startButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 12,
  },
  buttonHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  resetButton: {
    alignSelf: "center",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: colors.card,
  },
  resetButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "600",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  premiumText: {
    fontSize: 14,
    color: colors.premium,
    fontWeight: "600",
    marginLeft: 4,
  },
});

export default TopicHeaderScreen;
