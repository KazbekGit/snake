import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useEnhancedPersonalization } from "../hooks/useEnhancedPersonalization";
import { Typography } from "../ui/Typography";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Container, Row, Col } from "../ui/Grid";
import { TopNav } from "../ui/TopNav";
import { ds } from "../ui/theme";
import { colors } from "../constants/colors";
import { useAppTheme } from "../theme/ThemeProvider";
import { PersonalizationTester } from "../components/PersonalizationTester";

interface PersonalizationScreenProps {
  navigation: any;
}

export const PersonalizationScreen: React.FC<PersonalizationScreenProps> = ({
  navigation,
}) => {
  const { mode } = useAppTheme();
  const [state, actions] = useEnhancedPersonalization("user-123", {
    autoRefresh: true,
    refreshInterval: 300000, // 5 минут
    enableABTesting: true,
    enableML: true,
    enableAnalytics: true,
    demoFill: true,
    debounceMs: 300,
  });

  // Загружаем рекомендации с контекстом при монтировании
  useEffect(() => {
    const loadRecommendationsWithContext = async () => {
      const context = {
        availableTime: selectedDuration,
        preferredDifficulty: 0.7,
        currentTopicId: selectedGoal || "general",
        screen: "personalization",
        learningStyle: "visual",
      };

      await actions.getRecommendations(10, context);
    };

    loadRecommendationsWithContext();
  }, [actions, selectedDuration, selectedGoal]);

  const [selectedGoal, setSelectedGoal] = useState("");
  const [selectedDuration, setSelectedDuration] = useState(60);
  const [showTester, setShowTester] = useState(false);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const formatStudyTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    return formatTime(minutes);
  };

  const handleStartStudySession = async () => {
    if (!selectedGoal.trim()) {
      Alert.alert("Ошибка", "Пожалуйста, выберите тему для изучения");
      return;
    }

    try {
      await actions.startStudySession({
        topicId: selectedGoal,
        availableTime: selectedDuration,
        difficultyPreference: 0.7,
        section: "mathematics",
      });
      Alert.alert(
        "Сессия начата",
        `Начинаем изучение темы "${selectedGoal}" на ${formatTime(
          selectedDuration
        )}`
      );
      setSelectedGoal("");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось начать сессию");
    }
  };

  const handleUpdateDifficulty = (
    difficulty: "beginner" | "intermediate" | "advanced"
  ) => {
    const difficultyMap = {
      beginner: 0.3,
      intermediate: 0.6,
      advanced: 0.9,
    };
    actions.updateUserFeatures({
      preferredDifficulty: difficultyMap[difficulty],
    });
  };

  const handleUpdateLearningStyle = (
    style: "visual" | "auditory" | "kinesthetic" | "reading"
  ) => {
    actions.updateUserFeatures({
      learningStyle: style,
    });
  };

  const handleUpdatePace = (pace: "slow" | "normal" | "fast") => {
    actions.updateUserFeatures({
      pacePreference: pace,
    });
  };

  const handleRefreshData = async () => {
    try {
      await actions.refreshAll();
      Alert.alert("Успешно", "Данные обновлены");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось обновить данные");
    }
  };

  const renderRecommendations = () => {
    if (state.recommendations.length === 0) {
      return (
        <Card style={styles.card}>
          <Typography variant="h6" style={styles.cardTitle}>
            Рекомендации
          </Typography>
          <Typography variant="body2" style={styles.emptyText}>
            Загрузка рекомендаций...
          </Typography>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Typography variant="h6" style={styles.cardTitle}>
          Рекомендуемые темы
        </Typography>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {state.recommendations.slice(0, 5).map((rec, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recommendationCard}
              onPress={() => setSelectedGoal(rec.topicId)}
            >
              <Typography variant="subtitle1" style={styles.topicTitle}>
                {rec.topicId}
              </Typography>
              <Typography variant="h4" style={styles.topicScore}>
                {(rec.score * 100).toFixed(0)}%
              </Typography>
              <Typography variant="caption" style={styles.topicExplanation}>
                {rec.explanation}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>
    );
  };

  const renderAnalytics = () => {
    if (!state.behaviorProfile) {
      return (
        <Card style={styles.card}>
          <Typography variant="h6" style={styles.cardTitle}>
            Аналитика
          </Typography>
          <Typography variant="body2" style={styles.emptyText}>
            Аналитика загружается...
          </Typography>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Typography variant="h6" style={styles.cardTitle}>
          Ваша аналитика
        </Typography>

        <Row>
          <Col size={6}>
            <Typography variant="body2" style={styles.analyticsLabel}>
              Уровень вовлеченности
            </Typography>
            <Typography variant="h4" style={styles.analyticsValue}>
              {state.behaviorProfile.engagementMetrics.engagementScore.toFixed(
                0
              )}
              %
            </Typography>
          </Col>
          <Col size={6}>
            <Typography variant="body2" style={styles.analyticsLabel}>
              Мотивация
            </Typography>
            <Typography variant="h4" style={styles.analyticsValue}>
              {state.behaviorProfile.engagementMetrics.motivationLevel}
            </Typography>
          </Col>
        </Row>

        {state.predictiveInsights && (
          <View style={styles.insightsContainer}>
            <Typography variant="subtitle2" style={styles.insightsTitle}>
              Предиктивные инсайты
            </Typography>
            {state.predictiveInsights.predictions.map((prediction, index) => (
              <View key={index} style={styles.predictionItem}>
                <Typography variant="caption" style={styles.predictionType}>
                  {prediction.type}
                </Typography>
                <Typography variant="body2" style={styles.predictionValue}>
                  {(prediction.value * 100).toFixed(0)}%
                </Typography>
              </View>
            ))}
          </View>
        )}
      </Card>
    );
  };

  const renderABTests = () => {
    if (state.activeTests.length === 0) {
      return (
        <Card style={styles.card}>
          <Typography variant="h6" style={styles.cardTitle}>
            A/B Тесты
          </Typography>
          <Typography variant="body2" style={styles.emptyText}>
            Нет активных экспериментов
          </Typography>
        </Card>
      );
    }

    return (
      <Card style={styles.card}>
        <Typography variant="h6" style={styles.cardTitle}>
          Активные эксперименты
        </Typography>
        {state.activeTests.map((test) => (
          <View key={test.id} style={styles.testItem}>
            <Typography variant="subtitle2" style={styles.testName}>
              {test.name}
            </Typography>
            <Typography variant="body2" style={styles.testDescription}>
              {test.description}
            </Typography>
            {state.userVariants.has(test.id) && (
              <Typography variant="caption" style={styles.variantInfo}>
                Ваш вариант: {state.userVariants.get(test.id)?.name}
              </Typography>
            )}
          </View>
        ))}
      </Card>
    );
  };

  const renderPreferences = () => (
    <Card style={styles.card}>
      <Typography variant="h6" style={styles.cardTitle}>
        Настройки персонализации
      </Typography>

      <View style={styles.preferenceSection}>
        <Typography variant="subtitle2" style={styles.preferenceLabel}>
          Сложность
        </Typography>
        <Row>
          <Col size={4}>
            <Button
              title="Начинающий"
              onPress={() => handleUpdateDifficulty("beginner")}
              variant="outline"
              size="small"
            />
          </Col>
          <Col size={4}>
            <Button
              title="Средний"
              onPress={() => handleUpdateDifficulty("intermediate")}
              variant="outline"
              size="small"
            />
          </Col>
          <Col size={4}>
            <Button
              title="Продвинутый"
              onPress={() => handleUpdateDifficulty("advanced")}
              variant="outline"
              size="small"
            />
          </Col>
        </Row>
      </View>

      <View style={styles.preferenceSection}>
        <Typography variant="subtitle2" style={styles.preferenceLabel}>
          Стиль обучения
        </Typography>
        <Row>
          <Col size={6}>
            <Button
              title="Визуальный"
              onPress={() => handleUpdateLearningStyle("visual")}
              variant="outline"
              size="small"
            />
          </Col>
          <Col size={6}>
            <Button
              title="Аудиальный"
              onPress={() => handleUpdateLearningStyle("auditory")}
              variant="outline"
              size="small"
            />
          </Col>
        </Row>
        <Row style={{ marginTop: 8 }}>
          <Col size={6}>
            <Button
              title="Кинестетический"
              onPress={() => handleUpdateLearningStyle("kinesthetic")}
              variant="outline"
              size="small"
            />
          </Col>
          <Col size={6}>
            <Button
              title="Чтение"
              onPress={() => handleUpdateLearningStyle("reading")}
              variant="outline"
              size="small"
            />
          </Col>
        </Row>
      </View>

      <View style={styles.preferenceSection}>
        <Typography variant="subtitle2" style={styles.preferenceLabel}>
          Темп обучения
        </Typography>
        <Row>
          <Col size={4}>
            <Button
              title="Медленный"
              onPress={() => handleUpdatePace("slow")}
              variant="outline"
              size="small"
            />
          </Col>
          <Col size={4}>
            <Button
              title="Обычный"
              onPress={() => handleUpdatePace("normal")}
              variant="outline"
              size="small"
            />
          </Col>
          <Col size={4}>
            <Button
              title="Быстрый"
              onPress={() => handleUpdatePace("fast")}
              variant="outline"
              size="small"
            />
          </Col>
        </Row>
      </View>
    </Card>
  );

  const renderStudySession = () => (
    <Card style={styles.card}>
      <Typography variant="h6" style={styles.cardTitle}>
        Начать сессию изучения
      </Typography>

      <View style={styles.inputSection}>
        <Typography variant="body2" style={styles.inputLabel}>
          Выберите тему
        </Typography>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {state.recommendations.slice(0, 3).map((rec, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.topicOption,
                selectedGoal === rec.topicId && styles.selectedTopic,
              ]}
              onPress={() => setSelectedGoal(rec.topicId)}
            >
              <Typography variant="body2" style={styles.topicOptionText}>
                {rec.topicId}
              </Typography>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.inputSection}>
        <Typography variant="body2" style={styles.inputLabel}>
          Время изучения (минуты)
        </Typography>
        <Row>
          {[15, 30, 45, 60].map((duration) => (
            <Col key={duration} size={3}>
              <TouchableOpacity
                style={[
                  styles.durationOption,
                  selectedDuration === duration && styles.selectedDuration,
                ]}
                onPress={() => setSelectedDuration(duration)}
              >
                <Typography variant="body2" style={styles.durationText}>
                  {duration}
                </Typography>
              </TouchableOpacity>
            </Col>
          ))}
        </Row>
      </View>

      <Button
        title="Начать изучение"
        onPress={handleStartStudySession}
        disabled={!selectedGoal}
        style={styles.startButton}
      />
    </Card>
  );

  if (state.isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <StatusBar
          barStyle={mode === "dark" ? "light-content" : "dark-content"}
        />
        <TopNav
          title="Персонализация"
          onBack={() => navigation.goBack()}
          rightIcon={
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => setShowTester(!showTester)}
                style={{ marginRight: 16 }}
              >
                <Ionicons name="bug" size={24} color={colors.text} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleRefreshData}>
                <Ionicons name="refresh" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          }
        />
        <View style={styles.loadingContainer}>
          <Typography variant="h6">
            Загрузка Personalization Engine...
          </Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={mode === "dark" ? "light-content" : "dark-content"}
      />
      <TopNav
        title="Персонализация"
        onBack={() => navigation.goBack()}
        rightIcon={
          <TouchableOpacity onPress={handleRefreshData}>
            <Ionicons name="refresh" size={24} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {showTester ? (
        <PersonalizationTester />
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Container>
            {renderRecommendations()}
            {renderAnalytics()}
            {renderABTests()}
            {renderPreferences()}
            {renderStudySession()}

            {state.error && (
              <Card style={[styles.card, styles.errorCard]}>
                <Typography variant="body2" style={styles.errorText}>
                  Ошибка: {state.error}
                </Typography>
              </Card>
            )}
          </Container>
        </ScrollView>
      )}
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
  scrollView: {
    flex: 1,
  },
  card: {
    marginBottom: ds.spacing.lg,
  },
  cardTitle: {
    marginBottom: ds.spacing.md,
  },
  emptyText: {
    fontStyle: "italic",
    textAlign: "center",
    padding: ds.spacing.lg,
  },
  recommendationCard: {
    width: 200,
    padding: ds.spacing.md,
    marginRight: 8,
    borderRadius: ds.radius.md,
    backgroundColor: colors.card,
    elevation: 2,
    boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.10)",
  },
  topicTitle: {
    marginBottom: ds.spacing.xs,
  },
  topicScore: {
    marginBottom: ds.spacing.xs,
    color: colors.primary,
  },
  topicExplanation: {
    lineHeight: 16,
  },
  analyticsLabel: {
    marginBottom: ds.spacing.xs,
  },
  analyticsValue: {
    color: colors.primary,
  },
  insightsContainer: {
    marginTop: ds.spacing.md,
    paddingTop: ds.spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  insightsTitle: {
    marginBottom: 8,
  },
  predictionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ds.spacing.xs,
  },
  predictionType: {
    flex: 1,
  },
  predictionValue: {
    fontWeight: "600",
    color: colors.primary,
  },
  testItem: {
    marginBottom: ds.spacing.md,
    paddingBottom: ds.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  testName: {
    marginBottom: ds.spacing.xs,
  },
  testDescription: {
    marginBottom: ds.spacing.xs,
  },
  variantInfo: {
    color: colors.primary,
    fontWeight: "500",
  },
  preferenceSection: {
    marginBottom: ds.spacing.lg,
  },
  preferenceLabel: {
    marginBottom: 8,
  },
  inputSection: {
    marginBottom: ds.spacing.lg,
  },
  inputLabel: {
    marginBottom: 8,
  },
  topicOption: {
    paddingHorizontal: ds.spacing.md,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: ds.radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedTopic: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  topicOptionText: {
    color: colors.text,
  },
  durationOption: {
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: ds.radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedDuration: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    color: colors.text,
  },
  startButton: {
    marginTop: ds.spacing.md,
  },
  errorCard: {
    backgroundColor: "#ffebee",
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
});
