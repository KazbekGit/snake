import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useEnhancedPersonalization } from "../hooks/useEnhancedPersonalization";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";

interface PersonalizationDemoProps {
  userId: string;
}

const PersonalizationDemoContent: React.FC<PersonalizationDemoProps> = ({
  userId,
}) => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "ab" | "ml" | "analytics"
  >("overview");

  const [state, actions] = useEnhancedPersonalization(userId, {
    autoRefresh: true,
    refreshInterval: 30000, // 30 секунд
    enableABTesting: true,
    enableML: true,
    enableAnalytics: true,
  });

  const handleStartSession = async () => {
    try {
      await actions.startStudySession({
        topicId: "demo-topic",
        availableTime: 30,
        difficultyPreference: 0.7,
      });
      Alert.alert("Успех", "Сессия изучения запущена");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось запустить сессию");
    }
  };

  const handleEndSession = async () => {
    try {
      await actions.endStudySession({
        duration: 1800000, // 30 минут
        completionRate: 0.8,
        engagementScore: 0.7,
        satisfactionScore: 0.9,
      });
      Alert.alert("Успех", "Сессия изучения завершена");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось завершить сессию");
    }
  };

  const handleRecordInteraction = async () => {
    try {
      await actions.recordInteraction({
        type: "topic_view",
        topicId: "demo-topic",
        duration: 120000,
        value: 1,
      });
      Alert.alert("Успех", "Взаимодействие записано");
    } catch (error) {
      Alert.alert("Ошибка", "Не удалось записать взаимодействие");
    }
  };

  const renderOverview = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Обзор Personalization Engine
      </Text>

      <View style={styles.statusContainer}>
        <Text style={[styles.statusLabel, { color: theme.colors.text }]}>
          Статус: {state.isLoading ? "Загрузка..." : "Готов"}
        </Text>
        {state.error && (
          <Text style={[styles.errorText, { color: theme.colors.error }]}>
            Ошибка: {state.error}
          </Text>
        )}
        <Text
          style={[styles.statusText, { color: theme.colors.textSecondary }]}
        >
          Последнее обновление:{" "}
          {new Date(state.lastUpdated).toLocaleTimeString()}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {state.activeTests.length}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            A/B тестов
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {state.recommendations.length}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Рекомендаций
          </Text>
        </View>

        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: theme.colors.primary }]}>
            {state.cohortAnalyses.length}
          </Text>
          <Text
            style={[styles.statLabel, { color: theme.colors.textSecondary }]}
          >
            Когорт
          </Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary },
          ]}
          onPress={handleStartSession}
        >
          <Text
            style={[styles.actionButtonText, { color: theme.colors.white }]}
          >
            Запустить сессию
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.secondary },
          ]}
          onPress={handleEndSession}
        >
          <Text
            style={[styles.actionButtonText, { color: theme.colors.white }]}
          >
            Завершить сессию
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: theme.colors.accent },
          ]}
          onPress={handleRecordInteraction}
        >
          <Text
            style={[styles.actionButtonText, { color: theme.colors.white }]}
          >
            Записать взаимодействие
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderABTesting = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        A/B Тестирование
      </Text>

      {state.activeTests.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Нет активных A/B тестов
        </Text>
      ) : (
        state.activeTests.map((test) => (
          <View key={test.id} style={styles.testItem}>
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
            <Text style={[styles.testStatus, { color: theme.colors.primary }]}>
              Статус: {test.status}
            </Text>

            {state.userVariants.has(test.id) && (
              <View style={styles.variantInfo}>
                <Text
                  style={[
                    styles.variantLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Ваш вариант: {state.userVariants.get(test.id)?.name}
                </Text>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );

  const renderMLRecommendations = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        ML Рекомендации
      </Text>

      {state.recommendations.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Нет рекомендаций
        </Text>
      ) : (
        state.recommendations.slice(0, 5).map((rec, index) => (
          <View key={index} style={styles.recommendationItem}>
            <Text
              style={[styles.recommendationTitle, { color: theme.colors.text }]}
            >
              Тема: {rec.topicId}
            </Text>
            <Text
              style={[
                styles.recommendationScore,
                { color: theme.colors.primary },
              ]}
            >
              Оценка: {(rec.score * 100).toFixed(1)}%
            </Text>
            <Text
              style={[
                styles.recommendationExplanation,
                { color: theme.colors.textSecondary },
              ]}
            >
              {rec.explanation}
            </Text>

            <View style={styles.factorsContainer}>
              <Text
                style={[
                  styles.factorsTitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Факторы:
              </Text>
              {Object.entries(rec.factors).map(([factor, value]) => (
                <Text
                  key={factor}
                  style={[
                    styles.factorItem,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  • {factor}: {(value * 100).toFixed(1)}%
                </Text>
              ))}
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
        Расширенная аналитика
      </Text>

      {state.behaviorProfile ? (
        <View style={styles.analyticsContainer}>
          <View style={styles.analyticsSection}>
            <Text style={[styles.analyticsTitle, { color: theme.colors.text }]}>
              Профиль поведения
            </Text>
            <Text
              style={[
                styles.analyticsText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Уровень мотивации:{" "}
              {state.behaviorProfile.engagementMetrics.motivationLevel}
            </Text>
            <Text
              style={[
                styles.analyticsText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Оценка вовлеченности:{" "}
              {state.behaviorProfile.engagementMetrics.engagementScore}
            </Text>
            <Text
              style={[
                styles.analyticsText,
                { color: theme.colors.textSecondary },
              ]}
            >
              Частота сессий:{" "}
              {state.behaviorProfile.engagementMetrics.sessionFrequency.toFixed(
                1
              )}{" "}
              в день
            </Text>
          </View>

          {state.predictiveInsights && (
            <View style={styles.analyticsSection}>
              <Text
                style={[styles.analyticsTitle, { color: theme.colors.text }]}
              >
                Предиктивные инсайты
              </Text>
              {state.predictiveInsights.predictions.map((prediction, index) => (
                <View key={index} style={styles.predictionItem}>
                  <Text
                    style={[
                      styles.predictionType,
                      { color: theme.colors.primary },
                    ]}
                  >
                    {prediction.type}
                  </Text>
                  <Text
                    style={[
                      styles.predictionValue,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Значение: {(prediction.value * 100).toFixed(1)}%
                  </Text>
                  <Text
                    style={[
                      styles.predictionConfidence,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Уверенность: {(prediction.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          Аналитика не загружена
        </Text>
      )}
    </View>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case "overview":
        return renderOverview();
      case "ab":
        return renderABTesting();
      case "ml":
        return renderMLRecommendations();
      case "analytics":
        return renderAnalytics();
      default:
        return renderOverview();
    }
  };

  if (state.isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Загрузка Personalization Engine...
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.tabContainer}>
        {[
          { key: "overview", label: "Обзор" },
          { key: "ab", label: "A/B Тесты" },
          { key: "ml", label: "ML" },
          { key: "analytics", label: "Аналитика" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && {
                backgroundColor: theme.colors.primary,
              },
            ]}
            onPress={() => setSelectedTab(tab.key as any)}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    selectedTab === tab.key
                      ? theme.colors.white
                      : theme.colors.text,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const PersonalizationDemo: React.FC<PersonalizationDemoProps> = ({
  userId,
}) => {
  return (
    <ThemeProvider>
      <PersonalizationDemoContent userId={userId} />
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
    marginTop: 16,
    fontSize: 16,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statusContainer: {
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    fontStyle: "italic",
  },
  testItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
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
  testStatus: {
    fontSize: 12,
    fontWeight: "500",
  },
  variantInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  variantLabel: {
    fontSize: 12,
  },
  recommendationItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recommendationScore: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  recommendationExplanation: {
    fontSize: 14,
    marginBottom: 12,
  },
  factorsContainer: {
    marginTop: 8,
  },
  factorsTitle: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  factorItem: {
    fontSize: 12,
    marginLeft: 8,
  },
  analyticsContainer: {
    gap: 16,
  },
  analyticsSection: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f5f5f5",
  },
  analyticsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  analyticsText: {
    fontSize: 14,
    marginBottom: 4,
  },
  predictionItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 6,
    backgroundColor: "#ffffff",
  },
  predictionType: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 12,
    marginBottom: 2,
  },
  predictionConfidence: {
    fontSize: 12,
  },
});

export default PersonalizationDemo;


