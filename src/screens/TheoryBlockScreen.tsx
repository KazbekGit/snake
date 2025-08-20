import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
  StatusBar,
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
import { Topic, ContentBlock } from "../types";
import { moneyTopic } from "../data";
import { markBlockCompleted, addStudyTime } from "../utils/progressStorage";
import { logEvent } from "../utils/analytics";
import { useAdvancedAnalytics } from "../hooks/useAdvancedAnalytics";
import { getCachedUri } from "../utils/imageCache";
import { useAppTheme } from "../theme/ThemeProvider";

const { width, height } = Dimensions.get("window");

interface TheoryBlockScreenProps {
  navigation: any;
  route: {
    params: {
      topic: Topic;
      blockIndex: number;
    };
  };
}

export const TheoryBlockScreen: React.FC<TheoryBlockScreenProps> = ({
  navigation,
  route,
}) => {
  const { topic, blockIndex = 0 } = route.params;
  const { mode } = useAppTheme();
  const { startStudySession, endStudySession, addInteraction } =
    useAdvancedAnalytics();
  const [currentBlockIndex, setCurrentBlockIndex] = useState(blockIndex);
  const [studyStartTime, setStudyStartTime] = useState<number>(Date.now());
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [isMediaLoading, setIsMediaLoading] = useState<boolean>(false);

  // Animation values
  const contentTranslateY = useSharedValue(50);
  const contentOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const mediaScale = useSharedValue(1);

  // Используем переданную тему или fallback на moneyTopic
  const currentTopic = topic || moneyTopic;
  const totalBlocks = currentTopic.contentBlocks?.length || 4;
  const currentBlock = currentTopic.contentBlocks?.[currentBlockIndex] || {
    title: "Блок теории",
    content: "Содержание блока",
  };

  const progress = ((currentBlockIndex + 1) / totalBlocks) * 100;

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {Array.from({ length: totalBlocks }).map((_, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => {
              if (idx !== currentBlockIndex) {
                logEvent("jump_block", { topicId: currentTopic.id, to: idx });
                setCurrentBlockIndex(idx);
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={`Перейти к блоку ${idx + 1}`}
            testID={`dot-${idx}`}
            style={[
              styles.dot,
              idx === currentBlockIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    );
  };

  const scrollRef = React.useRef<ScrollView | null>(null);

  useEffect(() => {
    // Start animations
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    contentOpacity.value = withTiming(1, { duration: 800 });

    // Записываем время начала изучения
    setStudyStartTime(Date.now());

    // Инициализируем сессию изучения
    (async () => {
      try {
        await startStudySession(currentTopic.id);
        await addInteraction({
          type: "block_view",
          data: {
            blockIndex: currentBlockIndex,
            blockTitle: currentBlock.title,
          },
        });
      } catch (error) {
        console.error("Failed to start study session:", error);
      }
    })();

    // Лог события просмотра блока
    logEvent("open_block", {
      topicId: currentTopic.id,
      blockIndex: currentBlockIndex,
    });

    // Автоскролл к началу
    try {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } catch {}

    // Кэшируем медиа, если есть
    (async () => {
      try {
        if (currentBlock.media?.url) {
          setIsMediaLoading(true);
          const cached = await getCachedUri(currentBlock.media.url);
          setMediaUri(cached);
        } else {
          setMediaUri(null);
        }
      } catch {
        setMediaUri(null);
      } finally {
        setIsMediaLoading(false);
      }
    })();
  }, [currentBlockIndex]);

  const handleNext = async () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); // Временно отключено для веб
    buttonScale.value = withSpring(0.95, { duration: 100 }, () => {
      buttonScale.value = withSpring(1, { duration: 100 });
    });

    // Сохраняем прогресс текущего блока
    await markBlockCompleted(currentTopic.id, currentBlockIndex, totalBlocks);

    // Добавляем время изучения
    const studyTimeMinutes = Math.round((Date.now() - studyStartTime) / 60000);
    if (studyTimeMinutes > 0) {
      await addStudyTime(currentTopic.id, studyTimeMinutes);
    }

    // Записываем взаимодействие с блоком
    try {
      await addInteraction({
        type: "block_complete",
        data: {
          blockIndex: currentBlockIndex,
          blockTitle: currentBlock.title,
          timeSpent: Date.now() - studyStartTime,
        },
      });
    } catch (error) {
      console.error("Failed to add interaction:", error);
    }

    if (currentBlockIndex < totalBlocks - 1) {
      // Переходим к следующему блоку
      logEvent("next_block", {
        topicId: currentTopic.id,
        from: currentBlockIndex,
        to: currentBlockIndex + 1,
      });
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else {
      // Завершаем сессию изучения
      try {
        await endStudySession(currentBlockIndex + 1, totalBlocks);
      } catch (error) {
        console.error("Failed to end study session:", error);
      }

      // Переходим к тесту
      console.log("Переходим к тесту");
      logEvent("start_test", { topicId: currentTopic.id });
      navigation.navigate("MiniTest", {
        topic: currentTopic,
      });
    }
  };

  const handlePrevious = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Временно отключено для веб
    if (currentBlockIndex > 0) {
      setCurrentBlockIndex(currentBlockIndex - 1);
    }
  };

  const handleBack = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Временно отключено для веб
    console.log("Возвращаемся к списку тем");
    navigation.goBack();
  };

  // Animated styles
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const mediaAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: mediaScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const renderMedia = () => {
    if (!currentBlock.media) return null;

    const { media } = currentBlock;

    return (
      <Animated.View style={[styles.mediaContainer, mediaAnimatedStyle]}>
        <Image
          source={{ uri: mediaUri || media.url }}
          style={styles.mediaImage}
          resizeMode="cover"
          onLoadStart={() => setIsMediaLoading(true)}
          onLoadEnd={() => setIsMediaLoading(false)}
        />
        {isMediaLoading && (
          <View style={styles.mediaLoaderOverlay}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        <View style={styles.mediaOverlay}>
          <Typography variant="caption" style={styles.mediaAltText}>
            {media.altText}
          </Typography>
        </View>
      </Animated.View>
    );
  };

  const renderMnemonic = () => {
    if (!currentBlock.mnemonic) return null;

    const { mnemonic } = currentBlock;

    return (
      <View style={styles.mnemonicContainer}>
        <View style={styles.mnemonicHeader}>
          <Ionicons name="bulb-outline" size={24} color={colors.warning} />
          <Typography variant="subtitle" style={styles.mnemonicTitle}>
            Мнемоника для запоминания
          </Typography>
        </View>
        <View style={styles.mnemonicContent}>
          <Typography variant="body" style={styles.mnemonicPhrase}>
            "{mnemonic.phrase}"
          </Typography>
          <Typography variant="body" style={styles.mnemonicExplanation}>
            {mnemonic.explanation}
          </Typography>
          <Typography variant="body" style={styles.mnemonicHint}>
            💡 {mnemonic.visualHint}
          </Typography>
        </View>
      </View>
    );
  };

  const renderKeyTerms = () => {
    if (!currentBlock.keyTerms || currentBlock.keyTerms.length === 0)
      return null;

    return (
      <View style={styles.keyTermsContainer}>
        <Typography variant="subtitle" style={styles.keyTermsTitle}>
          Ключевые термины:
        </Typography>
        {currentBlock.keyTerms.map((term, index) => (
          <View key={index} style={styles.keyTermItem}>
            <View
              style={[
                styles.keyTermBadge,
                { backgroundColor: term.highlightColor },
              ]}
            >
              <Typography variant="button" style={styles.keyTermText}>
                {term.term}
              </Typography>
            </View>
            <Typography variant="body" style={styles.keyTermDefinition}>
              {term.definition}
            </Typography>
          </View>
        ))}
      </View>
    );
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
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Typography variant="body" style={styles.topicTitle}>
              {topic.title}
            </Typography>
            <Typography variant="caption" style={styles.blockProgress}>
              Блок {currentBlockIndex + 1} из {totalBlocks}
            </Typography>
          </View>

          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-vertical" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Typography variant="caption" style={styles.progressText}>
            {Math.round(progress)}%
          </Typography>
        </View>
        {renderDots()}

        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Animated.View style={[styles.content, contentAnimatedStyle]}>
            {/* Block Title */}
            <View style={styles.titleContainer}>
              <Typography variant="heroTitle" style={styles.blockTitle}>
                {currentBlock.title}
              </Typography>
            </View>

            {/* Media (if before content) */}
            {(currentBlock as any).media?.placement === "before_content" &&
              renderMedia()}

            {/* Main Content */}
            <View style={styles.mainContent}>
              <Typography variant="body" style={styles.contentText}>
                {currentBlock.content}
              </Typography>
            </View>

            {/* Example */}
            {(currentBlock as any).example && (
              <View style={styles.exampleContainer}>
                <View style={styles.exampleHeader}>
                  <Ionicons
                    name="bulb-outline"
                    size={20}
                    color={colors.warning}
                  />
                  <Typography variant="subtitle" style={styles.exampleTitle}>
                    Пример из жизни
                  </Typography>
                </View>
                <Typography variant="body" style={styles.exampleText}>
                  {(currentBlock as any).example}
                </Typography>
              </View>
            )}

            {/* Key Terms */}
            {renderKeyTerms()}

            {/* Media (if after content) */}
            {(currentBlock as any).media?.placement === "after_content" &&
              renderMedia()}

            {/* Mnemonic */}
            {renderMnemonic()}
          </Animated.View>
        </ScrollView>

        {/* Navigation Footer */}
        <View style={styles.footer}>
          <View style={styles.navigationButtons}>
            <TouchableOpacity
              style={[
                styles.navButton,
                styles.prevButton,
                currentBlockIndex === 0 && styles.disabledButton,
              ]}
              onPress={handlePrevious}
              disabled={currentBlockIndex === 0}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
              <Typography variant="button" style={styles.navButtonText}>
                Назад
              </Typography>
            </TouchableOpacity>

            <Animated.View
              style={[styles.nextButtonContainer, buttonAnimatedStyle]}
            >
              <TouchableOpacity
                style={styles.nextButton}
                onPress={handleNext}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel={
                  currentBlockIndex < totalBlocks - 1
                    ? "Следующий блок"
                    : "Перейти к тесту"
                }
              >
                <LinearGradient
                  colors={[...colors.gradients.primary]}
                  style={styles.nextButtonGradient}
                >
                  <Typography variant="button" style={styles.nextButtonText}>
                    {currentBlockIndex < totalBlocks - 1
                      ? "Следующий блок"
                      : "Перейти к тесту"}
                  </Typography>
                  <Ionicons
                    name={
                      currentBlockIndex < totalBlocks - 1
                        ? "chevron-forward"
                        : "checkmark"
                    }
                    size={24}
                    color="white"
                  />
                </LinearGradient>
              </TouchableOpacity>

              {/* Подсказка под кнопкой */}
              <Typography variant="caption" style={styles.buttonHint}>
                {currentBlockIndex < totalBlocks - 1
                  ? `Следующий: блок ${currentBlockIndex + 2} из ${totalBlocks}`
                  : "Далее: тест"}
              </Typography>
            </Animated.View>
          </View>
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
    borderRadius: ds.radius.pill,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flex: 1,
    alignItems: "center",
  },
  topicTitle: {
    color: "white",
  },
  blockProgress: {
    color: "rgba(255,255,255,0.8)",
    marginTop: ds.spacing.xs,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: ds.radius.pill,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
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
    minWidth: 30,
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
  titleContainer: {
    marginBottom: ds.spacing.lg,
  },
  blockTitle: {
    color: colors.text,
    textAlign: "center",
  },
  mediaContainer: {
    marginVertical: ds.spacing.lg,
    borderRadius: ds.radius.lg,
    overflow: "hidden",
    ...ds.shadow.card,
  },
  mediaImage: {
    width: "100%",
    height: 200,
  },
  mediaOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: ds.spacing.sm,
  },
  mediaLoaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  mediaAltText: {
    color: "white",
    textAlign: "center",
  },
  mainContent: {
    marginBottom: ds.spacing.lg,
  },
  contentText: {
    color: colors.text,
    textAlign: "justify",
  },
  exampleContainer: {
    backgroundColor: colors.card,
    borderRadius: ds.radius.lg,
    padding: ds.spacing.md,
    marginBottom: ds.spacing.lg,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ds.spacing.sm,
  },
  exampleTitle: {
    color: colors.text,
    marginLeft: ds.spacing.sm,
  },
  exampleText: {
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  keyTermsContainer: {
    marginBottom: ds.spacing.lg,
  },
  keyTermsTitle: {
    color: colors.text,
    marginBottom: ds.spacing.sm,
  },
  keyTermItem: {
    marginBottom: ds.spacing.sm,
  },
  keyTermBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: ds.spacing.sm,
    paddingVertical: ds.spacing.xs,
    borderRadius: ds.radius.pill,
    marginBottom: ds.spacing.xs,
  },
  keyTermText: {
    color: "white",
  },
  keyTermDefinition: {
    color: colors.textSecondary,
  },
  mnemonicContainer: {
    backgroundColor: colors.warning + "10",
    borderRadius: ds.radius.lg,
    padding: ds.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  mnemonicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: ds.spacing.sm,
  },
  mnemonicTitle: {
    color: colors.text,
    marginLeft: ds.spacing.sm,
  },
  mnemonicContent: {
    gap: ds.spacing.sm,
  },
  mnemonicPhrase: {
    color: colors.warning,
    textAlign: "center",
  },
  mnemonicExplanation: {
    color: colors.textSecondary,
  },
  mnemonicHint: {
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  footer: {
    backgroundColor: "white",
    borderTopLeftRadius: ds.radius.xl,
    borderTopRightRadius: ds.radius.xl,
    paddingHorizontal: ds.spacing.lg,
    paddingVertical: ds.spacing.md,
    ...ds.shadow.card,
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: ds.spacing.md,
    paddingVertical: ds.spacing.sm,
    borderRadius: ds.radius.lg,
    backgroundColor: colors.primary,
  },
  prevButton: {
    backgroundColor: colors.secondary,
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    color: "white",
    marginLeft: ds.spacing.sm,
  },
  nextButtonContainer: {
    flex: 1,
    marginLeft: ds.spacing.md,
  },
  nextButton: {
    borderRadius: ds.radius.lg,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: ds.spacing.sm,
    paddingHorizontal: ds.spacing.lg,
  },
  nextButtonText: {
    color: "white",
    marginRight: ds.spacing.sm,
  },
  buttonHint: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: ds.spacing.sm,
    fontStyle: "italic",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: ds.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: ds.radius.pill,
    marginHorizontal: ds.spacing.xs,
  },
  dotActive: {
    backgroundColor: "white",
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});

export default TheoryBlockScreen;
