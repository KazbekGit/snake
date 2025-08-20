import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getUserProgress,
  updateTopicProgress,
  markBlockCompleted,
  saveTestResult,
  addStudyTime,
} from "./progressStorage";
import { logEvent, getEvents, getStreakDays } from "./analytics";

// Демо скрипт показывает как работают реальные данные в персонализации
export async function demoRealData() {
  console.log("🚀 ДЕМОНСТРАЦИЯ РЕАЛЬНЫХ ДАННЫХ В ПЕРСОНАЛИЗАЦИИ");
  console.log("=".repeat(60));

  // Очищаем данные для чистого демо
  await AsyncStorage.clear();

  // 1. Пользователь изучает тему "money"
  console.log("📚 Пользователь изучает тему 'money'...");
  await updateTopicProgress("money", {
    completedBlocks: 2,
    totalBlocks: 5,
    studyTime: 15 * 60 * 1000, // 15 минут
  });

  // 2. Пользователь завершает блок
  console.log("✅ Пользователь завершает блок...");
  await markBlockCompleted("money", 2, 5);

  // 3. Пользователь проходит тест
  console.log("📝 Пользователь проходит тест...");
  await saveTestResult("money", 8, 10); // 8 из 10 правильных

  // 4. Добавляется время изучения
  console.log("⏱️ Добавляется время изучения...");
  await addStudyTime("money", 20); // 20 минут

  // 5. Записываются события аналитики
  console.log("📊 Записываются события аналитики...");
  await logEvent("topic_progress_updated", {
    topicId: "money",
    updates: { completedBlocks: 3 },
  });
  await logEvent("block_completed", { topicId: "money", blockIndex: 3 });
  await logEvent("test_result_saved", {
    topicId: "money",
    score: 8,
    totalQuestions: 10,
  });

  // 6. Получаем реальные данные
  console.log("\n📈 ПОЛУЧАЕМ РЕАЛЬНЫЕ ДАННЫЕ:");
  const progress = await getUserProgress();
  const events = await getEvents();
  const streakDays = await getStreakDays();

  console.log("Прогресс по темам:", {
    money: {
      completedBlocks: progress.topics.money?.completedBlocks || 0,
      totalBlocks: progress.topics.money?.totalBlocks || 0,
      studyTime:
        Math.round((progress.topics.money?.studyTime || 0) / 60000) + " мин",
      lastStudied: progress.topics.money?.lastStudied,
    },
  });

  console.log("Результаты тестов:", progress.testScores);
  console.log(
    "Общее время изучения:",
    Math.round(progress.totalStudyTime / 60000) + " мин"
  );
  console.log("Последняя активность:", progress.lastActivity);
  console.log("Количество событий:", events.length);
  console.log("Streak дней:", streakDays);

  // 7. Персонализация использует эти реальные данные
  console.log("\n🧠 ПЕРСОНАЛИЗАЦИЯ ИСПОЛЬЗУЕТ РЕАЛЬНЫЕ ДАННЫЕ:");

  const userFeatures = {
    completionRate: progress.topics.money
      ? progress.topics.money.completedBlocks /
        progress.topics.money.totalBlocks
      : 0,
    averageScore: progress.testScores.money
      ? progress.testScores.money / 10
      : 0,
    streakDays,
    studyFrequency: events.filter(
      (e) =>
        new Date(e.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    totalStudyTime: progress.topics.money
      ? progress.topics.money.studyTime / (60 * 1000)
      : 0,
    strongTopics: Object.entries(progress.testScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topicId]) => topicId),
    weakTopics: Object.entries(progress.testScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3)
      .map(([topicId]) => topicId),
  };

  console.log("Фичи для ML:", {
    completionRate: (userFeatures.completionRate * 100).toFixed(1) + "%",
    averageScore: (userFeatures.averageScore * 100).toFixed(1) + "%",
    streakDays: userFeatures.streakDays + " дней",
    studyFrequency: userFeatures.studyFrequency + " событий за неделю",
    totalStudyTime: userFeatures.totalStudyTime + " минут",
    strongTopics: userFeatures.strongTopics,
    weakTopics: userFeatures.weakTopics,
  });

  // 8. Показываем как это влияет на рекомендации
  console.log("\n🎯 ВЛИЯНИЕ НА РЕКОМЕНДАЦИИ:");
  console.log("- Пользователь хорошо знает тему 'money' (80% в тесте)");
  console.log("- Завершил 60% блоков темы");
  console.log("- Изучал 35 минут");
  console.log("- Сильная тема: money");
  console.log("- Рекомендации будут учитывать эти данные");

  console.log("\n✅ ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА!");
  console.log(
    "Теперь персонализация работает с реальными данными вместо пустых экранов."
  );
}

// Демо с несколькими темами
export async function demoMultipleTopics() {
  console.log("🚀 ДЕМОНСТРАЦИЯ С НЕСКОЛЬКИМИ ТЕМАМИ");
  console.log("=".repeat(50));

  await AsyncStorage.clear();

  // Имитируем изучение нескольких тем
  console.log("📚 Пользователь изучает несколько тем...");

  await updateTopicProgress("money", {
    completedBlocks: 3,
    totalBlocks: 5,
    studyTime: 30 * 60 * 1000,
  });
  await saveTestResult("money", 9, 10);

  await updateTopicProgress("market", {
    completedBlocks: 1,
    totalBlocks: 4,
    studyTime: 15 * 60 * 1000,
  });
  await saveTestResult("market", 6, 10);

  await updateTopicProgress("law", {
    completedBlocks: 0,
    totalBlocks: 3,
    studyTime: 5 * 60 * 1000,
  });
  await saveTestResult("law", 3, 10);

  const progress = await getUserProgress();

  // Персонализация определяет сильные и слабые темы
  const topicScores = Object.entries(progress.testScores);
  const sortedTopics = topicScores.sort(([, a], [, b]) => b - a);
  const strongTopics = sortedTopics.slice(0, 2).map(([topicId]) => topicId);
  const weakTopics = sortedTopics.slice(-2).map(([topicId]) => topicId);

  console.log("\n📊 АНАЛИЗ ТЕМ:");
  console.log("Сильные темы:", strongTopics);
  console.log("Слабые темы:", weakTopics);
  console.log(
    "Средний балл:",
    (
      Object.values(progress.testScores).reduce(
        (sum, score) => sum + score,
        0
      ) / Object.values(progress.testScores).length
    ).toFixed(1) + "/10"
  );

  console.log("\n🎯 РЕКОМЕНДАЦИИ НА ОСНОВЕ РЕАЛЬНЫХ ДАННЫХ:");
  console.log("- Рекомендовать продолжение темы 'money' (сильная тема)");
  console.log(
    "- Предложить дополнительную практику по теме 'law' (слабая тема)"
  );
  console.log("- Учитывать предпочтения по времени изучения");

  console.log("\n✅ ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА!");
}

