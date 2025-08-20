# Примеры реальных данных в персонализации

## 🎯 Что такое "реальные данные"?

Реальные данные - это информация, которую пользователь генерирует при использовании приложения:

### 1. **Прогресс по темам** (из `progressStorage.ts`)

```typescript
// Когда пользователь изучает тему "money"
await updateTopicProgress("money", {
  completedBlocks: 3,    // Завершил 3 блока
  totalBlocks: 5,        // Всего 5 блоков
  studyTime: 25 * 60 * 1000, // 25 минут изучения
});

// Результат в AsyncStorage:
{
  "topics": {
    "money": {
      "completedBlocks": 3,
      "totalBlocks": 5,
      "studyTime": 1500000, // 25 минут в миллисекундах
      "lastStudied": "2025-01-19T11:30:00.000Z"
    }
  }
}
```

### 2. **Результаты тестов** (из `MiniTestScreen.tsx`)

```typescript
// Когда пользователь проходит тест
await saveTestResult("money", 8, 10); // 8 из 10 правильных

// Результат в AsyncStorage:
{
  "testScores": {
    "money": 8  // Балл за тест
  }
}
```

### 3. **События активности** (из `analytics.ts`)

```typescript
// Когда пользователь завершает блок
await logEvent("block_completed", {
  topicId: "money",
  blockIndex: 3,
});

// Когда пользователь проходит тест
await logEvent("test_result_saved", {
  topicId: "money",
  score: 8,
  totalQuestions: 10,
});

// Результат в AsyncStorage:
[
  {
    type: "block_completed",
    payload: { topicId: "money", blockIndex: 3 },
    timestamp: "2025-01-19T11:30:00.000Z",
  },
  {
    type: "test_result_saved",
    payload: { topicId: "money", score: 8, totalQuestions: 10 },
    timestamp: "2025-01-19T11:35:00.000Z",
  },
];
```

## 🧠 Как персонализация использует эти данные

### В `useEnhancedPersonalization.ts` (строки 110-209):

```typescript
const aggregateUserFeatures = async () => {
  // Получаем реальные данные
  const progress = await getUserProgress(); // Из AsyncStorage
  const events = await getEvents(); // Из AsyncStorage
  const streakDays = await getStreakDays(); // Из AsyncStorage

  // Вычисляем метрики из реальных данных:

  // 1. Процент завершения тем
  const completionRate = totalCompletedBlocks / totalBlocks;

  // 2. Средний балл из тестов
  const averageScore =
    testScores.reduce((sum, score) => sum + score, 0) / testScores.length;

  // 3. Частота занятий (события за неделю)
  const studyFrequency = recentEvents.length;

  // 4. Сильные и слабые темы
  const strongTopics = sortedTopics.slice(0, 3).map(([topicId]) => topicId);
  const weakTopics = sortedTopics.slice(-3).map(([topicId]) => topicId);

  return {
    completionRate, // 60% (3 из 5 блоков)
    averageScore, // 80% (8 из 10 баллов)
    studyFrequency, // 5 событий за неделю
    strongTopics, // ["money"]
    weakTopics, // ["law"]
    totalStudyTime, // 25 минут
  };
};
```

## 📱 Где данные собираются в приложении

### 1. **TheoryBlockScreen.tsx** (строки 155-254):

```typescript
const handleNext = async () => {
  // Сохраняем прогресс текущего блока
  await markBlockCompleted(currentTopic.id, currentBlockIndex, totalBlocks);

  // Добавляем время изучения
  const studyTimeMinutes = Math.round((Date.now() - studyStartTime) / 60000);
  if (studyTimeMinutes > 0) {
    await addStudyTime(currentTopic.id, studyTimeMinutes);
  }
};
```

### 2. **MiniTestScreen.tsx** (строки 225-324):

```typescript
const handleFinishTest = async () => {
  // Сохраняем результат теста
  await saveTestResult(topic.id, score, totalQuestions);

  // Записываем событие
  logEvent("finish_test", {
    topicId: topic.id,
    score,
    totalQuestions,
  });
};
```

## 🎯 Как это влияет на рекомендации

### Пример реальных рекомендаций:

```typescript
// Пользователь изучил тему "money":
// - Завершил 3 из 5 блоков (60%)
// - Получил 8 из 10 баллов в тесте (80%)
// - Изучал 25 минут

// Персонализация анализирует:
const userFeatures = {
  completionRate: 0.6, // 60% завершения
  averageScore: 0.8, // 80% успеваемость
  strongTopics: ["money"], // Сильная тема
  studyTime: 25, // 25 минут изучения
};

// Генерирует рекомендации:
if (userFeatures.completionRate > 0.5 && userFeatures.averageScore > 0.7) {
  // "Продолжить изучение темы 'money' (хорошие результаты)"
} else if (userFeatures.averageScore < 0.6) {
  // "Повторить материал (низкие результаты в тесте)"
}
```

## 🔄 Живой поток данных

1. **Пользователь открывает блок теории** → `TheoryBlockScreen.tsx`
2. **Изучает материал** → `addStudyTime()` записывает время
3. **Завершает блок** → `markBlockCompleted()` обновляет прогресс
4. **Проходит тест** → `saveTestResult()` сохраняет результат
5. **Персонализация анализирует** → `aggregateUserFeatures()` вычисляет фичи
6. **Генерирует рекомендации** → на основе реальных данных

## ✅ Результат

Вместо пустых экранов персонализация теперь показывает:

- **Реальные рекомендации** на основе прогресса
- **Персональную аналитику** на основе активности
- **Адаптивные предложения** на основе результатов тестов
- **Динамические настройки** на основе предпочтений

**Это и есть "реальные данные" в действии!** 🚀

