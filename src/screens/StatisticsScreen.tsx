import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { colors } from "../constants/colors";
import { useAppTheme } from "../theme/ThemeProvider";
import { Container, Row, Col } from "../ui/Grid";
import { TopNav } from "../ui/TopNav";
import {
  getStudyStatistics,
  clearUserData,
  resetTopicProgress,
  getUserProgress,
} from "../utils/progressStorage";
import { getEvents, clearEvents, getStreakDays } from "../utils/analytics";
import { t, setLocale } from "../i18n";
import { serializeUserData } from "../utils/backup";

const { width, height } = Dimensions.get("window");

interface StatisticsScreenProps {
  navigation: any;
}

export const StatisticsScreen: React.FC<StatisticsScreenProps> = ({
  navigation,
}) => {
  const { mode, toggle } = useAppTheme();
  const [statistics, setStatistics] = useState({
    totalTopics: 0,
    completedTopics: 0,
    totalStudyTime: 0,
    averageScore: 0,
    lastActivity: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [streakDays, setStreakDays] = useState<number>(0);

  // Animation values
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);

  useEffect(() => {
    loadStatistics();
  }, []);

  useEffect(() => {
    // Start animations
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
  }, []);

  const loadStatistics = async () => {
    try {
      const stats = await getStudyStatistics();
      setStatistics(stats);
      setEvents(await getEvents(20));
      setStreakDays(await getStreakDays());
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleClearData = async () => {
    try {
      await clearUserData();
      await loadStatistics();
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  const handleResetMoneyTopic = async () => {
    try {
      await resetTopicProgress("money");
      await loadStatistics();
    } catch (error) {
      console.error("Error resetting topic:", error);
    }
  };

  const handleResetAllTopics = async () => {
    try {
      const progress = await getUserProgress();
      const topicIds = Object.keys(progress.topics);
      for (const id of topicIds) {
        await resetTopicProgress(id);
      }
      await loadStatistics();
    } catch (error) {
      console.error("Error resetting all topics:", error);
    }
  };

  const formatStudyTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} мин`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}ч ${remainingMinutes}мин`;
  };

  const formatLastActivity = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "Менее часа назад";
    } else if (diffInHours < 24) {
      return `${diffInHours} часов назад`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} дней назад`;
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.background}
        >
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Загрузка статистики...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.background}>
        <Container>
          <TopNav />
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("statsTitle")}</Text>
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={toggle} style={styles.backButton}>
                <Ionicons name="moon" size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setLocale("en")} style={styles.backButton} accessibilityLabel="Switch to English">
                <Ionicons name="language" size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Animated.View style={[styles.content, animatedStyle]}>
              {/* Main Statistics */}
              <View style={styles.mainStatsContainer}>
                <Text style={styles.sectionTitle}>Общая статистика</Text>
                <Row>
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Col key={i} spanDesktop={6} spanTablet={6} spanMobile={12}>
                      <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                          <Ionicons
                            name={i === 0 ? "book-outline" : i === 1 ? "checkmark-circle-outline" : i === 2 ? "time-outline" : i === 3 ? "flame-outline" : "trophy-outline"}
                            size={32}
                            color={i === 0 ? colors.primary : i === 1 ? colors.success : i === 2 ? colors.warning : i === 3 ? colors.error : colors.premium}
                          />
                        </View>
                        <Text style={styles.statValue}>
                          {i === 0
                            ? statistics.totalTopics
                            : i === 1
                            ? statistics.completedTopics
                            : i === 2
                            ? formatStudyTime(statistics.totalStudyTime)
                            : i === 3
                            ? streakDays
                            : `${statistics.averageScore}%`}
                        </Text>
                        <Text style={styles.statLabel}>
                          {i === 0
                            ? "Изучено тем"
                            : i === 1
                            ? "Завершено тем"
                            : i === 2
                            ? "Время изучения"
                            : i === 3
                            ? "Серия (дней подряд)"
                            : "Средний балл"}
                        </Text>
                      </View>
                    </Col>
                  ))}
                </Row>
              </View>

              {/* Progress Overview */}
              <View style={styles.progressContainer}>
                <Text style={styles.sectionTitle}>Прогресс обучения</Text>
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressTitle}>Завершенность курса</Text>
                    <Text style={styles.progressPercentage}>
                      {statistics.totalTopics > 0
                        ? Math.round(
                            (statistics.completedTopics / statistics.totalTopics) * 100
                          )
                        : 0}
                      %
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            statistics.totalTopics > 0
                              ? (statistics.completedTopics / statistics.totalTopics) * 100
                              : 0
                          }%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {statistics.completedTopics} из {statistics.totalTopics} тем завершено
                  </Text>
                </View>
              </View>

              {/* Recent Activity */}
              <View style={styles.activityContainer}>
                <Text style={styles.sectionTitle}>Последняя активность</Text>
                <View style={styles.activityCard}>
                  <View style={styles.activityHeader}>
                    <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
                    <Text style={styles.activityText}>{formatLastActivity(statistics.lastActivity)}</Text>
                  </View>
                  {events.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                      {events.map((e, idx) => (
                        <Text key={idx} style={styles.activityText}>
                          • {new Date(e.timestamp).toLocaleString()} — {e.type}
                        </Text>
                      ))}
                      <TouchableOpacity
                        onPress={async () => {
                          await clearEvents();
                          setEvents([]);
                        }}
                        style={{ marginTop: 8 }}
                      >
                        <Text style={{ color: colors.primary, textAlign: "right" }}>
                          Очистить журнал событий
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>Действия</Text>
                <TouchableOpacity style={styles.actionButton} onPress={loadStatistics}>
                  <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.actionButtonGradient}>
                    <Ionicons name="refresh" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Обновить статистику</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={async () => {
                    try {
                      const json = await serializeUserData();
                      console.log("[BACKUP]", json);
                    } catch (e) {
                      console.error("Export error", e);
                    }
                  }}
                >
                  <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.actionButtonGradient}>
                    <Ionicons name="download-outline" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Экспорт резервной копии (в лог)</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleResetMoneyTopic}>
                  <LinearGradient colors={[colors.secondary, colors.primary]} style={styles.actionButtonGradient}>
                    <Ionicons name="refresh-circle" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Сбросить тему «Деньги»</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={handleResetAllTopics}>
                  <LinearGradient colors={[colors.warning, colors.error]} style={styles.actionButtonGradient}>
                    <Ionicons name="alert-circle" size={20} color="white" />
                    <Text style={styles.actionButtonText}>Сбросить прогресс по всем темам</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearData}>
                  <View style={styles.clearButtonContent}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                    <Text style={styles.clearButtonText}>Очистить данные</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </Container>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 16,
  },
  mainStatsContainer: {
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: (width - 80) / 2 - 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: "center",
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityContainer: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  activityText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  actionsContainer: {
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  clearButton: {
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  clearButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  clearButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default StatisticsScreen;
