// Реальный пример использования данных в персонализации
// Этот файл показывает как персонализация работает с реальными данными

import {
  getUserProgress,
  updateTopicProgress,
  markBlockCompleted,
  saveTestResult,
  addStudyTime,
} from "./progressStorage";
import { logEvent, getEvents, getStreakDays } from "./analytics";

// Пример 1: Пользователь изучает тему и персонализация анализирует его прогресс
export async function exampleUserProgress() {
  console.log("📚 ПРИМЕР 1: Анализ прогресса пользователя");
  console.log("=".repeat(50));

  // Пользователь изучает тему "money"
  await updateTopicProgress("money", {
    completedBlocks: 3,
    totalBlocks: 5,
    studyTime: 25 * 60 * 1000, // 25 минут
  });

  // Пользователь завершает блок
  await markBlockCompleted("money", 3, 5);

  // Пользователь проходит тест
  await saveTestResult("money", 8, 10); // 8 из 10 правильных

  // Получаем реальные данные
  const progress = await getUserProgress();

  console.log("📊 РЕАЛЬНЫЕ ДАННЫЕ ПРОГРЕССА:");
  console.log("- Тема: money");
  console.log(
    "- Завершено блоков:",
    progress.topics.money?.completedBlocks || 0,
    "из",
    progress.topics.money?.totalBlocks || 0
  );
  console.log(
    "- Время изучения:",
    Math.round((progress.topics.money?.studyTime || 0) / 60000),
    "минут"
  );
  console.log("- Результат теста:", progress.testScores.money || 0, "из 10");
  console.log(
    "- Процент завершения:",
    (
      ((progress.topics.money?.completedBlocks || 0) /
        (progress.topics.money?.totalBlocks || 1)) *
      100
    ).toFixed(1) + "%"
  );

  // Персонализация использует эти данные для рекомендаций
  const completionRate =
    (progress.topics.money?.completedBlocks || 0) /
    (progress.topics.money?.totalBlocks || 1);
  const testScore = (progress.testScores.money || 0) / 10;

  console.log("\n🧠 АНАЛИЗ ПЕРСОНАЛИЗАЦИИ:");
  console.log(
    "- Процент завершения темы:",
    (completionRate * 100).toFixed(1) + "%"
  );
  console.log("- Успеваемость в тестах:", (testScore * 100).toFixed(1) + "%");

  if (completionRate > 0.5 && testScore > 0.7) {
    console.log(
      "- РЕКОМЕНДАЦИЯ: Продолжить изучение темы (хорошие результаты)"
    );
  } else if (testScore < 0.6) {
    console.log(
      "- РЕКОМЕНДАЦИЯ: Повторить материал (низкие результаты в тесте)"
    );
  } else {
    console.log("- РЕКОМЕНДАЦИЯ: Завершить текущую тему");
  }
}

// Пример 2: Анализ событий пользователя
export async function exampleUserEvents() {
  console.log("\n📈 ПРИМЕР 2: Анализ событий пользователя");
  console.log("=".repeat(50));

  // Пользователь выполняет различные действия
  await logEvent("topic_progress_updated", {
    topicId: "money",
    updates: { completedBlocks: 4 },
  });
  await logEvent("block_completed", { topicId: "money", blockIndex: 4 });
  await logEvent("test_result_saved", {
    topicId: "money",
    score: 9,
    totalQuestions: 10,
  });
  await logEvent("study_session_started", {
    topicId: "money",
    timestamp: Date.now(),
  });
  await logEvent("study_session_ended", {
    topicId: "money",
    duration: 30 * 60 * 1000,
  });

  // Получаем события
  const events = await getEvents();
  const streakDays = await getStreakDays();

  console.log("📊 РЕАЛЬНЫЕ ДАННЫЕ СОБЫТИЙ:");
  console.log("- Количество событий:", events.length);
  console.log("- Streak дней:", streakDays);
  console.log("- Типы событий:", [...new Set(events.map((e) => e.type))]);

  // Анализируем активность за последние 7 дней
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const recentEvents = events.filter(
    (e) => new Date(e.timestamp) > new Date(weekAgo)
  );

  console.log("\n📅 АНАЛИЗ АКТИВНОСТИ:");
  console.log("- Событий за неделю:", recentEvents.length);
  console.log(
    "- Средняя активность:",
    (recentEvents.length / 7).toFixed(1),
    "событий в день"
  );

  // Персонализация использует эти данные
  const isActiveUser = recentEvents.length > 5;
  const hasGoodStreak = streakDays > 3;

  console.log("\n🧠 ПЕРСОНАЛИЗАЦИЯ НА ОСНОВЕ АКТИВНОСТИ:");
  if (isActiveUser && hasGoodStreak) {
    console.log(
      "- РЕКОМЕНДАЦИЯ: Продолжить интенсивное изучение (активный пользователь)"
    );
  } else if (!isActiveUser) {
    console.log(
      "- РЕКОМЕНДАЦИЯ: Напомнить о продолжении обучения (неактивный пользователь)"
    );
  } else {
    console.log("- РЕКОМЕНДАЦИЯ: Поддерживать текущий темп");
  }
}

// Пример 3: Сравнение нескольких тем
export async function exampleMultipleTopics() {
  console.log("\n📚 ПРИМЕР 3: Сравнение нескольких тем");
  console.log("=".repeat(50));

  // Пользователь изучает несколько тем
  await updateTopicProgress("money", {
    completedBlocks: 4,
    totalBlocks: 5,
    studyTime: 30 * 60 * 1000,
  });
  await saveTestResult("money", 9, 10);

  await updateTopicProgress("market", {
    completedBlocks: 2,
    totalBlocks: 4,
    studyTime: 20 * 60 * 1000,
  });
  await saveTestResult("market", 7, 10);

  await updateTopicProgress("law", {
    completedBlocks: 1,
    totalBlocks: 3,
    studyTime: 10 * 60 * 1000,
  });
  await saveTestResult("law", 5, 10);

  const progress = await getUserProgress();

  console.log("📊 РЕАЛЬНЫЕ ДАННЫЕ ПО ТЕМАМ:");

  const topicAnalysis = Object.entries(progress.topics).map(
    ([topicId, topic]) => ({
      topicId,
      completionRate:
        ((topic.completedBlocks / topic.totalBlocks) * 100).toFixed(1) + "%",
      studyTime: Math.round(topic.studyTime / 60000) + " мин",
      testScore: progress.testScores[topicId] || 0,
      efficiency: (
        (progress.testScores[topicId] || 0) /
        (topic.studyTime / 60000)
      ).toFixed(2),
    })
  );

  topicAnalysis.forEach((topic) => {
    console.log(
      `- ${topic.topicId}: ${topic.completionRate} завершения, ${topic.studyTime} изучения, ${topic.testScore}/10 в тесте, эффективность ${topic.efficiency}`
    );
  });

  // Персонализация определяет сильные и слабые темы
  const sortedTopics = Object.entries(progress.testScores).sort(
    ([, a], [, b]) => b - a
  );
  const strongTopics = sortedTopics.slice(0, 2).map(([topicId]) => topicId);
  const weakTopics = sortedTopics.slice(-2).map(([topicId]) => topicId);

  console.log("\n🧠 АНАЛИЗ ПЕРСОНАЛИЗАЦИИ:");
  console.log("- Сильные темы:", strongTopics.join(", "));
  console.log("- Слабые темы:", weakTopics.join(", "));

  console.log("\n🎯 РЕКОМЕНДАЦИИ:");
  console.log("- Рекомендовать продолжение темы 'money' (сильная тема)");
  console.log(
    "- Предложить дополнительную практику по теме 'law' (слабая тема)"
  );
  console.log("- Учитывать эффективность изучения для планирования времени");
}

// Главная функция для запуска всех примеров
export async function runAllExamples() {
  console.log("🚀 ДЕМОНСТРАЦИЯ РЕАЛЬНЫХ ДАННЫХ В ПЕРСОНАЛИЗАЦИИ");
  console.log("=".repeat(60));

  await exampleUserProgress();
  await exampleUserEvents();
  await exampleMultipleTopics();

  console.log("\n✅ ВСЕ ПРИМЕРЫ ЗАВЕРШЕНЫ!");
  console.log(
    "Теперь вы видите как персонализация работает с реальными данными:"
  );
  console.log("- Прогресс по темам");
  console.log("- Результаты тестов");
  console.log("- Время изучения");
  console.log("- События активности");
  console.log("- Streak дней");
  console.log("- Сравнение эффективности по темам");
}

