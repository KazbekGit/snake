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
import { TimeIcon } from "../ui/icons/TimeIcon";
import { LayersIcon } from "../ui/icons/LayersIcon";
import { StarOutlineIcon } from "../ui/icons/StarOutlineIcon";
import { Container, Row, Col } from "../ui/Grid";
import { TopNav } from "../ui/TopNav";
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
        colors={[...colors.gradients.primary]}
        style={styles.background}
      >
        <Container>
          <TopNav />
        </Container>
        <View style={{ paddingTop: ds.spacing.lg }}>
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
            <Typography variant="caption" style={styles.sectionName}>
              Экономика
            </Typography>
            <Typography variant="title" style={styles.topicTitle}>
              {currentTopic.title}
            </Typography>
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
              <Typography variant="body" style={styles.description}>
                {currentTopic.description}
              </Typography>
            </View>

            {/* Learning Objectives */}
            <View style={styles.objectivesContainer}>
              <Typography variant="subtitle" style={styles.objectivesTitle}>
                Что ты узнаешь:
              </Typography>
              {currentTopic.learningObjectives?.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <View style={styles.objectiveIcon}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.success}
                    />
                  </View>
                  <Typography variant="body" style={styles.objectiveText}>
                    {objective}
                  </Typography>
                </View>
              ))}
            </View>

            {/* Topic Info Cards */}
            <Row style={styles.infoCardsContainer}>
              <Col size={4}>
                <View style={styles.infoCard}>
                  <TimeIcon size={24} color={colors.primary} />
                  <Typography variant="button" style={styles.infoCardValue}>
                    {currentTopic.estimatedTime || 15} мин
                  </Typography>
                  <Typography variant="caption" style={styles.infoCardLabel}>
                    Время изучения
                  </Typography>
                </View>
              </Col>
              <Col size={4}>
                <View style={styles.infoCard}>
                  <LayersIcon size={24} color={colors.primary} />
                  <Typography variant="button" style={styles.infoCardValue}>
                    {currentTopic.totalBlocks ||
                      currentTopic.contentBlocks?.length ||
                      4}
                  </Typography>
                  <Typography variant="caption" style={styles.infoCardLabel}>
                    Блоков теории
                  </Typography>
                </View>
              </Col>
              <Col size={4}>
                <View style={styles.infoCard}>
                  <StarOutlineIcon size={24} color={colors.primary} />
                  <Typography variant="button" style={styles.infoCardValue}>
                    {getDifficultyText(currentTopic.difficulty || "medium")}
                  </Typography>
                  <Typography variant="caption" style={styles.infoCardLabel}>
                    Сложность
                  </Typography>
                </View>
              </Col>
            </Row>

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
                <Typography variant="button" style={styles.difficultyBadgeText}>
                  {getDifficultyText(currentTopic.difficulty || "medium")}
                </Typography>
              </View>
            </View>

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Typography variant="body" style={styles.progressText}>
                  Прогресс изучения
                </Typography>
                <Typography variant="button" style={styles.progressPercentage}>
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
                </Typography>
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
                  colors={[...colors.gradients.primary]}
                  style={styles.startButtonGradient}
                  pointerEvents="none"
                >
                  <Ionicons name="play" size={24} color="white" />
                  <Typography variant="button" style={styles.startButtonText}>
                    {(topicProgress?.completedBlocks ?? 0) > 0
                      ? "Продолжить изучение"
                      : "Начать изучение"}
                  </Typography>
                </LinearGradient>
              </TouchableOpacity>

              {/* Подсказка под кнопкой */}
              <Typography variant="caption" style={styles.buttonHint}>
                {(topicProgress?.completedBlocks ?? 0) > 0
                  ? `Продолжить с блока ${
                      (topicProgress?.lastBlockIndex ?? 0) + 1
                    }`
                  : "Начать изучение темы с первого блока"}
              </Typography>

              {/* Reset progress */}
              {topicProgress && (
                <TouchableOpacity
                  onPress={confirmResetProgress}
                  style={styles.resetButton}
                  testID="reset-progress-button"
                >
                  <Typography variant="caption" style={styles.resetButtonText}>
                    Сбросить прогресс
                  </Typography>
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
                <Typography variant="body" style={styles.premiumText}>
                  Premium контент
                </Typography>
              </View>
            )}
          </Animated.View>
        </ScrollView>
        </View>
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
    borderRadius: ds.radius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  sectionName: {
    color: "rgba(255,255,255,0.8)",
    marginBottom: ds.spacing.xs,
  },
  topicTitle: {
    color: "white",
    textAlign: "center",
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: ds.radius.full,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: ds.spacing.xl,
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
    borderTopLeftRadius: ds.radius.xl,
    borderTopRightRadius: ds.radius.xl,
    marginTop: -30,
    paddingHorizontal: ds.spacing.lg,
    paddingTop: ds.spacing.xl,
  },
  descriptionContainer: {
    marginBottom: ds.spacing.xl,
  },
  description: {
    textAlign: "center",
    color: colors.text,
  },
  objectivesContainer: {
    marginBottom: ds.spacing.xl,
  },
  objectivesTitle: {
    marginBottom: ds.spacing.md,
    textAlign: "center",
    color: colors.text,
  },
  objectiveItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ds.spacing.sm,
  },
  objectiveIcon: {
    marginRight: ds.spacing.sm,
  },
  objectiveText: {
    flex: 1,
    color: colors.textSecondary,
  },
  infoCardsContainer: {
    marginBottom: ds.spacing.xl,
  },
  infoCard: {
    alignItems: "center",
    padding: ds.spacing.md,
    backgroundColor: colors.card,
    borderRadius: ds.radius.lg,
    marginHorizontal: ds.spacing.xs,
    ...ds.shadows.card,
  },
  infoCardValue: {
    marginTop: ds.spacing.sm,
    color: colors.text,
  },
  infoCardLabel: {
    marginTop: ds.spacing.xs,
    textAlign: "center",
    color: colors.textSecondary,
  },
  difficultyContainer: {
    alignItems: "center",
    marginBottom: ds.spacing.xl,
  },
  difficultyBadge: {
    paddingHorizontal: ds.spacing.md,
    paddingVertical: ds.spacing.sm,
    borderRadius: ds.radius.full,
  },
  difficultyBadgeText: {
    color: "white",
  },
  progressContainer: {
    marginBottom: ds.spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ds.spacing.sm,
  },
  progressText: {
    color: colors.textSecondary,
  },
  progressPercentage: {
    color: colors.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: ds.radius.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: ds.radius.sm,
  },
  buttonContainer: {
    marginBottom: ds.spacing.md,
  },
  startButton: {
    borderRadius: ds.radius.lg,
    overflow: "hidden",
    ...ds.shadows.card,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ds.spacing.md,
    paddingHorizontal: ds.spacing.xl,
  },
  startButtonText: {
    color: "white",
    marginLeft: ds.spacing.sm,
  },
  buttonHint: {
    textAlign: "center",
    marginTop: ds.spacing.sm,
    fontStyle: "italic",
    color: colors.textSecondary,
  },
  resetButton: {
    alignSelf: "center",
    marginTop: ds.spacing.sm,
    paddingHorizontal: ds.spacing.sm,
    paddingVertical: ds.spacing.xs,
    borderRadius: ds.radius.md,
    backgroundColor: colors.card,
  },
  resetButtonText: {
    color: colors.textSecondary,
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ds.spacing.sm,
  },
  premiumText: {
    color: colors.premium,
    marginLeft: ds.spacing.xs,
  },
});

export default TopicHeaderScreen;
