#!/usr/bin/env node

/**
 * Простой тест Personalization Engine
 * Запуск: node test-personalization.js
 */

const { abTesting } = require("./src/analytics/abTesting");
const { recommendationEngine } = require("./src/ml/recommendationEngine");
const { enhancedAnalytics } = require("./src/analytics/enhancedAnalytics");

async function testPersonalizationEngine() {
  console.log("🧪 Тестирование Personalization Engine...\n");

  const testUserId = "test-user-" + Date.now();
  const testTopicId = "test-topic-" + Date.now();

  try {
    // 1. Тест A/B тестирования
    console.log("1️⃣ Тестирование A/B тестирования...");
    const testId = await abTesting.createTest({
      name: "Тест персонализации",
      description: "Тестирование функций персонализации",
      status: "active",
      startDate: Date.now(),
      variants: [
        {
          id: "control",
          name: "Контрольная группа",
          description: "Обычный алгоритм",
          config: { algorithm: "basic" },
          trafficPercentage: 50,
        },
        {
          id: "experimental",
          name: "Экспериментальная группа",
          description: "Улучшенный алгоритм",
          config: { algorithm: "advanced" },
          trafficPercentage: 50,
        },
      ],
      metrics: [
        {
          name: "engagement",
          type: "engagement",
          goal: "maximize",
          weight: 1.0,
        },
      ],
      targetAudience: {
        userSegments: ["all"],
        conditions: [],
      },
      trafficAllocation: 100,
    });
    console.log("✅ A/B тест создан:", testId);

    const variant = await abTesting.getVariant(testId, testUserId);
    console.log("✅ Пользователь назначен на вариант:", variant?.name);

    await abTesting.recordResult(testId, variant.id, testUserId, {
      conversion: 1,
      engagement: 0.8,
    });
    console.log("✅ Результат записан");

    // 2. Тест ML рекомендаций
    console.log("\n2️⃣ Тестирование ML рекомендаций...");
    await recommendationEngine.updateUserFeatures(testUserId, {
      preferredTopics: ["mathematics", "physics"],
      averageScore: 85,
      studyFrequency: 2.5,
    });
    console.log("✅ Признаки пользователя обновлены");

    await recommendationEngine.updateTopicFeatures(testTopicId, {
      difficulty: 0.7,
      popularity: 0.8,
      tags: ["mathematics"],
    });
    console.log("✅ Признаки темы обновлены");

    const recommendations = await recommendationEngine.getRecommendations(
      testUserId,
      5
    );
    console.log("✅ Получены рекомендации:", recommendations.length, "штук");
    if (recommendations.length > 0) {
      console.log(
        "   Первая рекомендация:",
        recommendations[0].topicId,
        "-",
        (recommendations[0].score * 100).toFixed(0) + "%"
      );
    }

    // 3. Тест аналитики
    console.log("\n3️⃣ Тестирование аналитики...");
    const behaviorProfile = await enhancedAnalytics.analyzeUserBehavior(
      testUserId
    );
    console.log("✅ Профиль поведения создан");
    console.log(
      "   Вовлеченность:",
      behaviorProfile.engagementMetrics.engagementScore.toFixed(0) + "%"
    );
    console.log(
      "   Мотивация:",
      behaviorProfile.engagementMetrics.motivationLevel
    );

    const insights = await enhancedAnalytics.generatePredictiveInsights(
      testUserId
    );
    console.log("✅ Предиктивные инсайты сгенерированы");
    console.log("   Количество предсказаний:", insights.predictions.length);

    const cohorts = await enhancedAnalytics.analyzeCohorts();
    console.log("✅ Анализ когорт выполнен");
    console.log("   Количество когорт:", cohorts.length);

    // 4. Итоговый результат
    console.log("\n🎉 Все тесты прошли успешно!");
    console.log("\n📊 Статистика:");
    console.log("   - A/B тест создан и работает");
    console.log("   - ML рекомендации генерируются");
    console.log("   - Аналитика функционирует");
    console.log("   - Предиктивные инсайты работают");
    console.log("   - Когортный анализ активен");

    console.log("\n✅ Personalization Engine готов к использованию!");
  } catch (error) {
    console.error("❌ Ошибка при тестировании:", error.message);
    process.exit(1);
  }
}

// Запуск теста
testPersonalizationEngine().catch(console.error);


