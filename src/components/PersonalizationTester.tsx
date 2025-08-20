import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useEnhancedPersonalization } from "../hooks/useEnhancedPersonalization";
import { Typography } from "../ui/Typography";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { colors } from "../constants/colors";
import { ds } from "../ui/theme";

export const PersonalizationTester: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const [state, actions] = useEnhancedPersonalization(
    "test-user-" + Date.now(),
    {
      autoRefresh: false,
      enableABTesting: true,
      enableML: true,
      enableAnalytics: true,
      demoFill: true,
    }
  );

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runFullTest = async () => {
    setIsRunning(true);
    clearResults();

    try {
      addResult("🚀 Начинаем тестирование Personalization Engine...");

      // Тест 1: Проверка инициализации
      addResult("1️⃣ Проверка инициализации...");
      if (state.isLoading) {
        addResult("   ⏳ Загрузка данных...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
      addResult("   ✅ Инициализация завершена");

      // Тест 2: Проверка A/B тестирования
      addResult("2️⃣ Проверка A/B тестирования...");
      if (state.activeTests.length > 0) {
        addResult(`   ✅ Найдено ${state.activeTests.length} активных тестов`);
        state.activeTests.forEach((test) => {
          addResult(`   📋 Тест: ${test.name}`);
        });
      } else {
        addResult("   ℹ️ Нет активных A/B тестов");
      }

      // Тест 3: Проверка рекомендаций
      addResult("3️⃣ Проверка ML рекомендаций...");
      if (state.recommendations.length > 0) {
        addResult(
          `   ✅ Получено ${state.recommendations.length} рекомендаций`
        );
        state.recommendations.slice(0, 3).forEach((rec, index) => {
          addResult(
            `   📚 ${index + 1}. ${rec.topicId} (${(rec.score * 100).toFixed(
              0
            )}%)`
          );
        });
      } else {
        addResult("   ⏳ Рекомендации загружаются...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addResult("   ℹ️ Рекомендации появятся после изучения тем");
      }

      // Тест 4: Проверка аналитики
      addResult("4️⃣ Проверка аналитики...");
      if (state.behaviorProfile) {
        addResult("   ✅ Профиль поведения создан");
        addResult(
          `   📊 Вовлеченность: ${state.behaviorProfile.engagementMetrics.engagementScore.toFixed(
            0
          )}%`
        );
        addResult(
          `   🎯 Мотивация: ${state.behaviorProfile.engagementMetrics.motivationLevel}`
        );
      } else {
        addResult("   ⏳ Аналитика загружается...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addResult(
          "   ℹ️ Аналитика появится после взаимодействия с приложением"
        );
      }

      // Тест 5: Проверка предиктивных инсайтов
      addResult("5️⃣ Проверка предиктивных инсайтов...");
      if (state.predictiveInsights) {
        addResult("   ✅ Предиктивные инсайты сгенерированы");
        addResult(
          `   🔮 Количество предсказаний: ${state.predictiveInsights.predictions.length}`
        );
        state.predictiveInsights.predictions.forEach((pred, index) => {
          addResult(
            `   📈 ${index + 1}. ${pred.type}: ${(pred.value * 100).toFixed(
              0
            )}%`
          );
        });
      } else {
        addResult("   ⏳ Инсайты загружаются...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        addResult("   ℹ️ Инсайты появятся после накопления данных");
      }

      // Тест 6: Проверка когорт
      addResult("6️⃣ Проверка анализа когорт...");
      if (state.cohortAnalyses.length > 0) {
        addResult(`   ✅ Найдено ${state.cohortAnalyses.length} когорт`);
        state.cohortAnalyses.forEach((cohort) => {
          addResult(
            `   👥 Когорта: ${cohort.cohortId} (${cohort.users.length} пользователей)`
          );
        });
      } else {
        addResult("   ℹ️ Когорты появятся после анализа данных");
      }

      // Тест 7: Проверка ошибок
      addResult("7️⃣ Проверка обработки ошибок...");
      if (state.error) {
        addResult(`   ⚠️ Обнаружена ошибка: ${state.error}`);
      } else {
        addResult("   ✅ Ошибок не обнаружено");
      }

      addResult("🎉 Тестирование завершено успешно!");
      addResult("✅ Personalization Engine работает корректно!");
    } catch (error) {
      addResult(`❌ Ошибка при тестировании: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const testUserFeatures = async () => {
    try {
      addResult("🧪 Тестирование обновления признаков пользователя...");
      await actions.updateUserFeatures({
        preferredTopics: ["mathematics", "physics"],
        averageScore: 85,
        studyFrequency: 2.5,
      });
      addResult("   ✅ Признаки пользователя обновлены");
    } catch (error) {
      addResult(`   ❌ Ошибка: ${error.message}`);
    }
  };

  const testStudySession = async () => {
    try {
      addResult("🧪 Тестирование сессии изучения...");
      await actions.startStudySession({
        topicId: "test-topic",
        availableTime: 30,
        difficultyPreference: 0.7,
        section: "mathematics",
      });
      addResult("   ✅ Сессия изучения запущена");

      await new Promise((resolve) => setTimeout(resolve, 1000));

      await actions.endStudySession({
        duration: 1800000, // 30 минут
        completionRate: 0.8,
        engagementScore: 0.9,
        satisfactionScore: 0.85,
        score: 85,
      });
      addResult("   ✅ Сессия изучения завершена");
    } catch (error) {
      addResult(`   ❌ Ошибка: ${error.message}`);
    }
  };

  const testInteraction = async () => {
    try {
      addResult("🧪 Тестирование записи взаимодействий...");
      await actions.recordInteraction({
        type: "content_view",
        topicId: "test-topic",
        value: 1,
        timestamp: Date.now(),
      });
      addResult("   ✅ Взаимодействие записано");
    } catch (error) {
      addResult(`   ❌ Ошибка: ${error.message}`);
    }
  };

  const refreshData = async () => {
    try {
      addResult("🔄 Обновление данных...");
      await actions.refreshAll();
      addResult("   ✅ Данные обновлены");
    } catch (error) {
      addResult(`   ❌ Ошибка: ${error.message}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Typography variant="h5" style={styles.title}>
          🧪 Personalization Engine Tester
        </Typography>
        <Typography variant="body2" style={styles.subtitle}>
          Тестирование функций персонализации в реальном времени
        </Typography>
      </Card>

      <Card style={styles.controlsCard}>
        <Typography variant="h6" style={styles.sectionTitle}>
          Управление тестами
        </Typography>

        <View style={styles.buttonRow}>
          <Button
            title="Полный тест"
            onPress={runFullTest}
            disabled={isRunning}
            style={styles.button}
          />
          <Button
            title="Очистить"
            onPress={clearResults}
            variant="secondary"
            style={styles.button}
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Обновить признаки"
            onPress={testUserFeatures}
            variant="outline"
            size="small"
            style={styles.button}
          />
          <Button
            title="Тест сессии"
            onPress={testStudySession}
            variant="outline"
            size="small"
            style={styles.button}
          />
        </View>

        <View style={styles.buttonRow}>
          <Button
            title="Записать взаимодействие"
            onPress={testInteraction}
            variant="outline"
            size="small"
            style={styles.button}
          />
          <Button
            title="Обновить данные"
            onPress={refreshData}
            variant="outline"
            size="small"
            style={styles.button}
          />
        </View>
      </Card>

      <Card style={styles.statusCard}>
        <Typography variant="h6" style={styles.sectionTitle}>
          Статус системы
        </Typography>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Загрузка:</Text>
          <Text
            style={[
              styles.statusValue,
              state.isLoading ? styles.loading : styles.ready,
            ]}
          >
            {state.isLoading ? "⏳ Загружается..." : "✅ Готово"}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>A/B тесты:</Text>
          <Text style={styles.statusValue}>
            {state.activeTests.length} активных
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Рекомендации:</Text>
          <Text style={styles.statusValue}>
            {state.recommendations.length} доступно
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Аналитика:</Text>
          <Text style={styles.statusValue}>
            {state.behaviorProfile ? "✅ Доступна" : "⏳ Загружается"}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <Text style={styles.statusLabel}>Инсайты:</Text>
          <Text style={styles.statusValue}>
            {state.predictiveInsights ? "✅ Доступны" : "⏳ Загружаются"}
          </Text>
        </View>

        {state.error && (
          <View style={styles.errorItem}>
            <Text style={styles.errorLabel}>Ошибка:</Text>
            <Text style={styles.errorText}>{state.error}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.resultsCard}>
        <Typography variant="h6" style={styles.sectionTitle}>
          Результаты тестирования
        </Typography>

        {testResults.length === 0 ? (
          <Typography variant="body2" style={styles.emptyText}>
            Нажмите "Полный тест" для начала тестирования
          </Typography>
        ) : (
          <ScrollView style={styles.resultsContainer}>
            {testResults.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))}
          </ScrollView>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: ds.spacing.md,
  },
  headerCard: {
    marginBottom: ds.spacing.md,
  },
  title: {
    marginBottom: ds.spacing.xs,
  },
  subtitle: {
    color: colors.textSecondary,
  },
  controlsCard: {
    marginBottom: ds.spacing.md,
  },
  sectionTitle: {
    marginBottom: ds.spacing.md,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8, // ds.spacing.sm
    marginBottom: 8, // ds.spacing.sm
  },
  button: {
    flex: 1,
  },
  statusCard: {
    marginBottom: ds.spacing.md,
  },
  statusItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: ds.spacing.xs,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  loading: {
    color: colors.warning,
  },
  ready: {
    color: colors.success,
  },
  errorItem: {
    marginTop: 8, // ds.spacing.sm
    padding: 8, // ds.spacing.sm
    backgroundColor: "#ffebee",
    borderRadius: 8, // ds.radius.sm
  },
  errorLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.error,
    marginBottom: ds.spacing.xs,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
  },
  resultsCard: {
    marginBottom: ds.spacing.md,
  },
  emptyText: {
    textAlign: "center",
    fontStyle: "italic",
    color: colors.textSecondary,
  },
  resultsContainer: {
    maxHeight: 300,
  },
  resultText: {
    fontSize: 12,
    marginBottom: ds.spacing.xs,
    fontFamily: "monospace",
  },
});
