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
import { Topic, ContentBlock } from "../types";
import { moneyTopic } from "../data";
import { markBlockCompleted, addStudyTime } from "../utils/progressStorage";
import { logEvent } from "../utils/analytics";
import { getCachedUri } from "../utils/imageCache";

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
  const [currentBlockIndex, setCurrentBlockIndex] = useState(blockIndex);
  const [studyStartTime, setStudyStartTime] = useState<number>(Date.now());
  const [mediaUri, setMediaUri] = useState<string | null>(null);

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
          const cached = await getCachedUri(currentBlock.media.url);
          setMediaUri(cached);
        } else {
          setMediaUri(null);
        }
      } catch {
        setMediaUri(null);
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

    if (currentBlockIndex < totalBlocks - 1) {
      // Переходим к следующему блоку
      logEvent("next_block", {
        topicId: currentTopic.id,
        from: currentBlockIndex,
        to: currentBlockIndex + 1,
      });
      setCurrentBlockIndex(currentBlockIndex + 1);
    } else {
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
        />
        <View style={styles.mediaOverlay}>
          <Text style={styles.mediaAltText}>{media.altText}</Text>
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
          <Text style={styles.mnemonicTitle}>Мнемоника для запоминания</Text>
        </View>
        <View style={styles.mnemonicContent}>
          <Text style={styles.mnemonicPhrase}>"{mnemonic.phrase}"</Text>
          <Text style={styles.mnemonicExplanation}>{mnemonic.explanation}</Text>
          <Text style={styles.mnemonicHint}>💡 {mnemonic.visualHint}</Text>
        </View>
      </View>
    );
  };

  const renderKeyTerms = () => {
    if (!currentBlock.keyTerms || currentBlock.keyTerms.length === 0)
      return null;

    return (
      <View style={styles.keyTermsContainer}>
        <Text style={styles.keyTermsTitle}>Ключевые термины:</Text>
        {currentBlock.keyTerms.map((term, index) => (
          <View key={index} style={styles.keyTermItem}>
            <View
              style={[
                styles.keyTermBadge,
                { backgroundColor: term.highlightColor },
              ]}
            >
              <Text style={styles.keyTermText}>{term.term}</Text>
            </View>
            <Text style={styles.keyTermDefinition}>{term.definition}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.background}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            accessibilityRole="button" accessibilityLabel="Назад"
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={styles.topicTitle}>{topic.title}</Text>
            <Text style={styles.blockProgress}>
              Блок {currentBlockIndex + 1} из {totalBlocks}
            </Text>
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
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
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
              <Text style={styles.blockTitle}>{currentBlock.title}</Text>
            </View>

            {/* Media (if before content) */}
            {currentBlock.media?.placement === "before_content" &&
              renderMedia()}

            {/* Main Content */}
            <View style={styles.mainContent}>
              <Text style={styles.contentText}>{currentBlock.content}</Text>
            </View>

            {/* Example */}
            {currentBlock.example && (
              <View style={styles.exampleContainer}>
                <View style={styles.exampleHeader}>
                  <Ionicons
                    name="lightbulb-outline"
                    size={20}
                    color={colors.warning}
                  />
                  <Text style={styles.exampleTitle}>Пример из жизни</Text>
                </View>
                <Text style={styles.exampleText}>{currentBlock.example}</Text>
              </View>
            )}

            {/* Key Terms */}
            {renderKeyTerms()}

            {/* Media (if after content) */}
            {currentBlock.media?.placement === "after_content" && renderMedia()}

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
              <Text style={styles.navButtonText}>Назад</Text>
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
                  colors={[colors.primary, colors.primaryDark]}
                  style={styles.nextButtonGradient}
                >
                  <Text style={styles.nextButtonText}>
                    {currentBlockIndex < totalBlocks - 1
                      ? "Следующий блок"
                      : "Перейти к тесту"}
                  </Text>
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
              <Text style={styles.buttonHint}>
                {currentBlockIndex < totalBlocks - 1
                  ? `Следующий: блок ${currentBlockIndex + 2} из ${totalBlocks}`
                  : "Далее: тест"}
              </Text>
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
  topicTitle: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  blockProgress: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
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
    minWidth: 30,
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
  titleContainer: {
    marginBottom: 20,
  },
  blockTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    textAlign: "center",
  },
  mediaContainer: {
    marginVertical: 20,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    padding: 10,
  },
  mediaAltText: {
    color: "white",
    fontSize: 12,
    textAlign: "center",
  },
  mainContent: {
    marginBottom: 20,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.text,
    textAlign: "justify",
  },
  exampleContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  exampleHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 8,
  },
  exampleText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    fontStyle: "italic",
  },
  keyTermsContainer: {
    marginBottom: 20,
  },
  keyTermsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 12,
  },
  keyTermItem: {
    marginBottom: 12,
  },
  keyTermBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  keyTermText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  keyTermDefinition: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mnemonicContainer: {
    backgroundColor: colors.warning + "10",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  mnemonicHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mnemonicTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.text,
    marginLeft: 8,
  },
  mnemonicContent: {
    gap: 8,
  },
  mnemonicPhrase: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.warning,
    textAlign: "center",
  },
  mnemonicExplanation: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  mnemonicHint: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: "italic",
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
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
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
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  nextButtonContainer: {
    flex: 1,
    marginLeft: 16,
  },
  nextButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
  buttonHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: "white",
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.5)",
  },
});

export default TheoryBlockScreen;
