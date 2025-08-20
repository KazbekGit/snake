import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useEnhancedPersonalization } from "../hooks/useEnhancedPersonalization";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";

/**
 * Пример использования Personalization Engine в реальном приложении
 *
 * Этот компонент демонстрирует:
 * 1. Интеграцию с A/B тестированием
 * 2. Использование ML рекомендаций
 * 3. Аналитику поведения пользователя
 * 4. Предиктивные инсайты
 */
const PersonalizationExampleContent: React.FC = () => {
  const theme = useTheme();
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  // Используем Personalization Engine
  const [state, actions] = useEnhancedPersonalization("demo-user-123", {
    autoRefresh: true,
    refreshInterval: 60000, // 1 минута
    enableABTesting: true,
    enableML: true,
    enableAnalytics: true,
  });

  // Обработчик начала изучения темы
  const handleStartTopic = async (topicId: string) => {
    try {
      setCurrentTopic(topicId);
      setSessionStartTime(Date.now());

      // Запускаем сессию изучения
      await actions.startStudySession({
        topicId,
        availableTime: 30, // 30 минут
        difficultyPreference: 0.7,
        section: "mathematics",
      });

      Alert.alert("Сессия начата", `Начинаем изучение темы: ${topicId}`);
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось начать сессию");
    }
  };

  // Обработчик завершения изучения темы
  const handleCompleteTopic = async (topicId: string, score: number) => {
    if (!sessionStartTime) return;

    try {
      const sessionDuration = Date.now() - sessionStartTime;
      const completionRate = score / 100;

      // Завершаем сессию изучения
      await actions.endStudySession({
        duration: sessionDuration,
        completionRate,
        engagementScore: 0.8,
        satisfactionScore: 0.9,
        score,
      });

      // Записываем взаимодействие
      await actions.recordInteraction({
        type: "topic_complete",
        topicId,
        score,
        duration: sessionDuration,
      });

      setCurrentTopic(null);
      setSessionStartTime(null);

      Alert.alert(
        "Тема завершена",
        `Результат: ${score}%\nВремя: ${Math.round(
          sessionDuration / 60000
        )} мин`
      );
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось завершить сессию");
    }
  };

  // Обработчик взаимодействия с контентом
  const handleContentInteraction = async (
    interactionType: string,
    value: number = 1
  ) => {
    try {
      await actions.recordInteraction({
        type: interactionType,
        topicId: currentTopic,
        value,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Failed to record interaction:", error);
    }
  };

  // Получение персонализированной конфигурации
  const getPersonalizedConfig = () => {
    const uiVariant = state.userVariants.get("ui_personalization");
    return (
      uiVariant?.config || {
        show_progress_bar: true,
        show_recommendations: true,
        theme: "default",
      }
    );
  };

  // Рендер рекомендаций
  const renderRecommendations = () => {
    if (state.recommendations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Загрузка рекомендаций...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Рекомендуемые темы
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {state.recommendations.slice(0, 5).map((rec, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.recommendationCard,
                { backgroundColor: theme.colors.surface },
              ]}
              onPress={() => handleStartTopic(rec.topicId)}
            >
              <Text style={[styles.topicTitle, { color: theme.colors.text }]}>
                {rec.topicId}
              </Text>
              <Text
                style={[styles.topicScore, { color: theme.colors.primary }]}
              >
                {(rec.score * 100).toFixed(0)}%
              </Text>
              <Text
                style={[
                  styles.topicExplanation,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {rec.explanation}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  // Рендер аналитики
  const renderAnalytics = () => {
    if (!state.behaviorProfile) {
      return (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Аналитика загружается...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Ваша аналитика
        </Text>

        <View
          style={[
            styles.analyticsCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Text style={[styles.analyticsTitle, { color: theme.colors.text }]}>
            Уровень вовлеченности
          </Text>
          <Text
            style={[styles.analyticsValue, { color: theme.colors.primary }]}
          >
            {state.behaviorProfile.engagementMetrics.engagementScore.toFixed(0)}
            %
          </Text>

          <Text style={[styles.analyticsTitle, { color: theme.colors.text }]}>
            Мотивация
          </Text>
          <Text
            style={[styles.analyticsValue, { color: theme.colors.primary }]}
          >
            {state.behaviorProfile.engagementMetrics.motivationLevel}
          </Text>
        </View>

        {state.predictiveInsights && (
          <View
            style={[
              styles.analyticsCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.analyticsTitle, { color: theme.colors.text }]}>
              Предиктивные инсайты
            </Text>
            {state.predictiveInsights.predictions.map((prediction, index) => (
              <View key={index} style={styles.predictionItem}>
                <Text
                  style={[
                    styles.predictionType,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {prediction.type}
                </Text>
                <Text
                  style={[
                    styles.predictionValue,
                    { color: theme.colors.primary },
                  ]}
                >
                  {(prediction.value * 100).toFixed(0)}%
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Рендер A/B тестов
  const renderABTests = () => {
    if (state.activeTests.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text
            style={[styles.emptyText, { color: theme.colors.textSecondary }]}
          >
            Нет активных A/B тестов
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Активные эксперименты
        </Text>
        {state.activeTests.map((test) => (
          <View
            key={test.id}
            style={[styles.testCard, { backgroundColor: theme.colors.surface }]}
          >
            <Text style={[styles.testName, { color: theme.colors.text }]}>
              {test.name}
            </Text>
            <Text
              style={[
                styles.testDescription,
                { color: theme.colors.textSecondary },
              ]}
            >
              {test.description}
            </Text>
            {state.userVariants.has(test.id) && (
              <Text
                style={[styles.variantInfo, { color: theme.colors.primary }]}
              >
                Ваш вариант: {state.userVariants.get(test.id)?.name}
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  };

  // Рендер действий
  const renderActions = () => {
    const config = getPersonalizedConfig();

    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Действия
        </Text>

        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.primary },
            ]}
            onPress={() => handleContentInteraction("content_view")}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.white }]}
            >
              Просмотр контента
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.colors.secondary },
            ]}
            onPress={() => handleContentInteraction("quiz_start")}
          >
            <Text
              style={[styles.actionButtonText, { color: theme.colors.white }]}
            >
              Начать тест
            </Text>
          </TouchableOpacity>

          {currentTopic && (
            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.accent },
              ]}
              onPress={() => handleCompleteTopic(currentTopic, 85)}
            >
              <Text
                style={[styles.actionButtonText, { color: theme.colors.white }]}
              >
                Завершить тему
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {config.show_recommendations && (
          <TouchableOpacity
            style={[
              styles.refreshButton,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() => actions.refreshAll()}
          >
            <Text
              style={[styles.refreshButtonText, { color: theme.colors.text }]}
            >
              Обновить данные
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (state.isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Загрузка Personalization Engine...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Personalization Engine Demo
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Демонстрация возможностей персонализации
        </Text>
      </View>

      {renderRecommendations()}
      {renderAnalytics()}
      {renderABTests()}
      {renderActions()}

      {state.error && (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Ошибка: {state.error}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const PersonalizationExample: React.FC = () => {
  return (
    <ThemeProvider>
      <PersonalizationExampleContent />
    </ThemeProvider>
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
    fontSize: 18,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
  },
  recommendationCard: {
    width: 200,
    padding: 16,
    marginRight: 12,
    borderRadius: 12,
    elevation: 2,
    boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.10)",
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  topicScore: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  topicExplanation: {
    fontSize: 12,
    lineHeight: 16,
  },
  analyticsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.10)",
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  predictionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  predictionType: {
    fontSize: 12,
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  testCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    boxShadow: "0px 2px 4px 0px rgba(0,0,0,0.10)",
  },
  testName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  variantInfo: {
    fontSize: 12,
    fontWeight: "500",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorContainer: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
    backgroundColor: "#ffebee",
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default PersonalizationExample;
