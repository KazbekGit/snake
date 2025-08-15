# Продвинутая аналитика и персонализация

Система детального отслеживания поведения пользователей, анализа обучения и персонализированных рекомендаций.

## 📊 Возможности

### 🔍 Детальная аналитика поведения
- **Сессии изучения**: Отслеживание времени, блоков, взаимодействий
- **Тестовые попытки**: Анализ ответов, времени, ошибок
- **Паттерны обучения**: Предпочитаемое время, частота сессий
- **Прогресс по темам**: Сильные и слабые области

### 🎯 Персонализированные рекомендации
- **Слабые темы**: Автоматическое выявление проблемных областей
- **Продолжение серии**: Мотивация для поддержания streak
- **Новые темы**: Рекомендации по расширению знаний
- **Практика ошибок**: Повторение проблемных вопросов

### 📈 Статистика и отчеты
- **Ежедневная статистика**: Сессии, тесты, время изучения
- **Недельные отчеты**: Тренды и прогресс
- **Профиль пользователя**: Детальная информация о привычках

## 🏗️ Архитектура

### Основные компоненты

```
src/analytics/
├── advancedAnalytics.ts     # Основная система аналитики
├── README.md               # Эта документация
└── __tests__/
    └── advancedAnalytics.test.ts  # Тесты системы
```

### Типы данных

#### StudySession
```typescript
interface StudySession {
  id: string;
  topicId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  blocksCompleted: number;
  totalBlocks: number;
  interactions: UserInteraction[];
}
```

#### TestAttempt
```typescript
interface TestAttempt {
  id: string;
  topicId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  questions: QuestionAttempt[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  mistakes: QuestionMistake[];
}
```

#### UserProfile
```typescript
interface UserProfile {
  userId: string;
  grade: string;
  goal: string;
  preferredLearningTime: string;
  averageSessionDuration: number;
  totalStudyTime: number;
  topicsCompleted: number;
  averageScore: number;
  streakDays: number;
  lastActiveDate: string;
  weakTopics: string[];
  strongTopics: string[];
}
```

#### Recommendation
```typescript
interface Recommendation {
  type: 'review_weak_topic' | 'continue_streak' | 'try_new_topic' | 'practice_mistakes';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  topicId?: string;
  reason: string;
  estimatedTime: number;
}
```

## 🚀 Использование

### Базовое использование

```typescript
import { advancedAnalytics } from '../analytics/advancedAnalytics';

// Начало сессии изучения
const sessionId = await advancedAnalytics.startStudySession('money');

// Добавление взаимодействий
await advancedAnalytics.addInteraction(sessionId, {
  type: 'block_view',
  data: { blockIndex: 0, blockTitle: 'Определение денег' }
});

// Завершение сессии
await advancedAnalytics.endStudySession(sessionId, 3, 4);

// Начало тестовой попытки
const attemptId = await advancedAnalytics.startTestAttempt('money');

// Добавление ответов
await advancedAnalytics.addQuestionAttempt(
  attemptId,
  'question1',
  'option1',
  'option1',
  5000, // время в миллисекундах
  0     // использованные подсказки
);

// Завершение теста
await advancedAnalytics.completeTestAttempt(attemptId);

// Получение рекомендаций
const recommendations = await advancedAnalytics.generateRecommendations();

// Получение сводки
const summary = await advancedAnalytics.getAnalyticsSummary();
```

### Использование в React компонентах

```typescript
import { useAdvancedAnalytics } from '../hooks/useAdvancedAnalytics';

function MyComponent() {
  const {
    startStudySession,
    endStudySession,
    addInteraction,
    getRecommendations,
    getProfile,
    formatStudyTime,
    getStreakEmoji
  } = useAdvancedAnalytics();

  const handleStartLearning = async () => {
    const sessionId = await startStudySession('money');
    // ... логика изучения
    await endStudySession(sessionId, 3, 4);
  };

  const recommendations = getRecommendations();
  const profile = getProfile();

  return (
    <View>
      <Text>Время изучения: {formatStudyTime(profile?.totalStudyTime || 0)}</Text>
      <Text>Серия: {getStreakEmoji(profile?.streakDays || 0)} {profile?.streakDays} дней</Text>
      
      {recommendations.map(rec => (
        <RecommendationCard key={rec.type} recommendation={rec} />
      ))}
    </View>
  );
}
```

## 📱 UI Компоненты

### RecommendationCard
Карточка для отображения рекомендаций с приоритетами и действиями.

```typescript
import { RecommendationCard } from '../ui/RecommendationCard';

<RecommendationCard
  recommendation={recommendation}
  onPress={() => handleRecommendationPress(recommendation)}
/>
```

### AdvancedStatsCard
Детальная статистика пользователя с визуализацией прогресса.

```typescript
import { AdvancedStatsCard } from '../ui/AdvancedStatsCard';

<AdvancedStatsCard
  profile={profile}
  formatStudyTime={formatStudyTime}
  formatScore={formatScore}
  getStreakEmoji={getStreakEmoji}
  getScoreColor={getScoreColor}
/>
```

### AdvancedAnalyticsScreen
Полноценный экран аналитики с табами для статистики и рекомендаций.

```typescript
import { AdvancedAnalyticsScreen } from '../screens/AdvancedAnalyticsScreen';

// Добавить в навигацию
<Stack.Screen name="AdvancedAnalytics" component={AdvancedAnalyticsScreen} />
```

## 🔧 Интеграция

### В TheoryBlockScreen
```typescript
const { startStudySession, endStudySession, addInteraction } = useAdvancedAnalytics();

useEffect(() => {
  // Инициализация сессии при загрузке блока
  (async () => {
    const sessionId = await startStudySession(topic.id);
    await addInteraction(sessionId, {
      type: 'block_view',
      data: { blockIndex: currentBlockIndex }
    });
  })();
}, [currentBlockIndex]);

const handleNext = async () => {
  // Завершение сессии при переходе к тесту
  await endStudySession(sessionId, blocksCompleted, totalBlocks);
};
```

### В MiniTestScreen
```typescript
const { startTestAttempt, addQuestionAttempt, completeTestAttempt } = useAdvancedAnalytics();

useEffect(() => {
  // Инициализация тестовой попытки
  if (currentQuestionIndex === 0) {
    startTestAttempt(topic.id);
  }
}, [currentQuestionIndex]);

const checkAnswer = async (answers: number[]) => {
  // Запись попытки ответа
  await addQuestionAttempt(
    attemptId,
    questionId,
    selectedAnswer,
    correctAnswer,
    timeSpent,
    hintsUsed
  );
};

const handleFinishTest = async () => {
  // Завершение тестовой попытки
  await completeTestAttempt();
};
```

### В HomeScreen
```typescript
const { getHighPriorityRecommendations } = useAdvancedAnalytics();

// Отображение рекомендаций на главном экране
const highPriorityRecs = getHighPriorityRecommendations();

{highPriorityRecs.length > 0 && (
  <ScrollView horizontal>
    {highPriorityRecs.map(rec => (
      <RecommendationCard key={rec.type} recommendation={rec} />
    ))}
  </ScrollView>
)}
```

## 🧪 Тестирование

### Запуск тестов
```bash
# Тесты системы аналитики
npm test src/analytics/__tests__/advancedAnalytics.test.ts

# Тесты React хука
npm test src/hooks/__tests__/useAdvancedAnalytics.test.ts

# Все тесты
npm test
```

### Покрытие тестами
- ✅ Сессии изучения (создание, завершение, взаимодействия)
- ✅ Тестовые попытки (создание, ответы, завершение)
- ✅ Профиль пользователя (обновление, расчеты)
- ✅ Рекомендации (генерация, приоритеты)
- ✅ React хук (состояние, методы, форматирование)
- ✅ Обработка ошибок (AsyncStorage, невалидные ID)

## 📊 Алгоритмы

### Расчет слабых тем
1. Собираем все ошибки по темам
2. Подсчитываем количество попыток для каждой темы
3. Сортируем по убыванию количества ошибок
4. Возвращаем топ-3 проблемные темы

### Расчет сильных тем
1. Собираем все тестовые попытки
2. Вычисляем средний балл для каждой темы
3. Фильтруем темы с баллом >= 80%
4. Сортируем по убыванию балла
5. Возвращаем топ-3 сильные темы

### Генерация рекомендаций
1. **Слабые темы** (высокий приоритет): Если есть темы с ошибками
2. **Продолжение серии** (средний приоритет): Если streak > 0
3. **Новые темы** (средний приоритет): Если есть неизученные темы
4. **Практика ошибок** (высокий приоритет): Если есть ошибки для повторения

### Расчет streak дней
1. Собираем все даты сессий
2. Сортируем по возрастанию
3. Подсчитываем последовательные дни
4. Возвращаем максимальную длину streak

## 🔄 Хранение данных

### AsyncStorage ключи
- `advanced_analytics_study_sessions` - сессии изучения
- `advanced_analytics_test_attempts` - тестовые попытки
- `advanced_analytics_user_profile` - профиль пользователя
- `advanced_analytics_learning_patterns` - паттерны обучения
- `advanced_analytics_question_mistakes` - ошибки в вопросах
- `advanced_analytics_daily_stats` - ежедневная статистика

### Структура данных
Все данные хранятся в JSON формате с автоматической сериализацией/десериализацией.

## 🎯 Лучшие практики

### 1. Обработка ошибок
```typescript
try {
  await advancedAnalytics.startStudySession(topicId);
} catch (error) {
  console.error('Failed to start study session:', error);
  // Fallback логика
}
```

### 2. Асинхронные операции
```typescript
// Всегда используйте await для асинхронных операций
const sessionId = await startStudySession(topicId);
await addInteraction(sessionId, interaction);
```

### 3. Валидация данных
```typescript
// Проверяйте существование данных перед использованием
const profile = getProfile();
if (profile?.weakTopics?.length > 0) {
  // Показываем рекомендации
}
```

### 4. Оптимизация производительности
```typescript
// Используйте useCallback для стабильных ссылок
const handleRecommendationPress = useCallback((rec) => {
  // Обработка нажатия
}, []);
```

## 🔮 Будущие улучшения

### Планируемые функции
- **Адаптивное тестирование**: Динамическая сложность вопросов
- **AI-рекомендации**: Машинное обучение для персонализации
- **Социальные элементы**: Сравнение с друзьями
- **Экспорт данных**: CSV/Excel отчеты
- **Облачная синхронизация**: Синхронизация между устройствами

### Расширение аналитики
- **Временные паттерны**: Анализ лучшего времени для изучения
- **Сложность контента**: Адаптация под уровень пользователя
- **Мотивационные элементы**: Система достижений и наград
- **Прогнозирование**: Предсказание успеваемости

## 📚 Ресурсы

- [React Native AsyncStorage](https://github.com/react-native-async-storage/async-storage)
- [React Hooks Testing](https://react-hooks-testing-library.com/)
- [Jest Testing Framework](https://jestjs.io/)
- [Data Visualization Best Practices](https://www.nngroup.com/articles/data-visualization/)
