# Расширенный Personalization Engine

## Обзор

Расширенный Personalization Engine представляет собой комплексную систему персонализации, которая объединяет A/B тестирование, машинное обучение и расширенную аналитику для создания персонализированного опыта обучения.

## Архитектура

Система состоит из трех основных компонентов:

### 1. A/B Тестирование (`abTesting.ts`)

- Управление активными A/B тестами
- Назначение пользователей на варианты тестов
- Запись результатов и расчет статистики
- Определение победителей тестов

### 2. ML Рекомендации (`recommendationEngine.ts`)

- Collaborative Filtering
- Content-Based Filtering
- Hybrid рекомендации
- Обновление признаков пользователей и контента

### 3. Расширенная аналитика (`enhancedAnalytics.ts`)

- Анализ поведения пользователей
- Предиктивные инсайты
- Анализ когорт
- Выявление паттернов обучения

## Интеграционный хук

### useEnhancedPersonalization

Основной хук для работы с Personalization Engine:

```typescript
const [state, actions] = useEnhancedPersonalization(userId, {
  autoRefresh: true,
  refreshInterval: 300000, // 5 минут
  enableABTesting: true,
  enableML: true,
  enableAnalytics: true,
});
```

#### Состояние (state)

```typescript
interface EnhancedPersonalizationState {
  // A/B тестирование
  activeTests: ABTest[];
  userVariants: Map<string, ABVariant>;
  testStats: Map<string, ABTestStats[]>;

  // ML рекомендации
  recommendations: RecommendationScore[];
  recommendationContext: Record<string, any>;

  // Расширенная аналитика
  behaviorProfile: UserBehaviorProfile | null;
  predictiveInsights: PredictiveInsights | null;
  cohortAnalyses: CohortAnalysis[];

  // Общее состояние
  isLoading: boolean;
  error: string | null;
  lastUpdated: number;
}
```

#### Действия (actions)

##### A/B Тестирование

- `getVariant(testId: string)` - получить вариант теста для пользователя
- `recordTestResult(testId: string, metrics: Record<string, number>)` - записать результат теста
- `getTestStats(testId: string)` - получить статистику теста

##### ML Рекомендации

- `getRecommendations(limit?: number, context?: Record<string, any>)` - получить рекомендации
- `updateUserFeatures(features: Record<string, any>)` - обновить признаки пользователя
- `updateTopicFeatures(topicId: string, features: Record<string, any>)` - обновить признаки темы

##### Аналитика

- `analyzeBehavior()` - проанализировать поведение пользователя
- `generateInsights()` - сгенерировать предиктивные инсайты
- `getCohortAnalyses()` - получить анализ когорт

##### Интеграционные действия

- `startStudySession(context?: Record<string, any>)` - запустить сессию изучения
- `endStudySession(metrics: Record<string, number>)` - завершить сессию изучения
- `recordInteraction(interaction: Record<string, any>)` - записать взаимодействие
- `refreshAll()` - обновить все данные

## Использование

### Базовое использование

```typescript
import { useEnhancedPersonalization } from "../hooks/useEnhancedPersonalization";

function MyComponent() {
  const [state, actions] = useEnhancedPersonalization("user-123");

  const handleStartLearning = async () => {
    await actions.startStudySession({
      topicId: "math-basics",
      availableTime: 30,
    });
  };

  const handleCompleteTopic = async () => {
    await actions.endStudySession({
      duration: 1800000, // 30 минут
      completionRate: 0.8,
      engagementScore: 0.7,
    });
  };

  return (
    <View>
      {state.recommendations.map((rec) => (
        <Text key={rec.topicId}>
          {rec.topicId}: {rec.score}
        </Text>
      ))}
    </View>
  );
}
```

### Получение рекомендаций с контекстом

```typescript
const recommendations = await actions.getRecommendations(5, {
  availableTime: 15, // 15 минут
  difficultyPreference: 0.7,
  section: "mathematics",
});
```

### Запись взаимодействий

```typescript
await actions.recordInteraction({
  type: "topic_view",
  topicId: "algebra",
  duration: 120000, // 2 минуты
  value: 1,
});
```

## A/B Тестирование

### Создание теста

```typescript
import { abTesting, DEMO_AB_TESTS } from "../analytics/abTesting";

// Создание нового теста
const testId = await abTesting.createTest({
  name: "Новый алгоритм рекомендаций",
  description: "Тестирование улучшенного алгоритма",
  status: "active",
  startDate: Date.now(),
  variants: [
    {
      id: "control",
      name: "Контрольная группа",
      description: "Текущий алгоритм",
      config: { algorithm: "basic" },
      trafficPercentage: 50,
    },
    {
      id: "experimental",
      name: "Экспериментальная группа",
      description: "Новый алгоритм",
      config: { algorithm: "advanced" },
      trafficPercentage: 50,
    },
  ],
  metrics: [
    {
      name: "completion_rate",
      type: "conversion",
      goal: "maximize",
      weight: 0.6,
    },
    {
      name: "engagement_time",
      type: "engagement",
      goal: "maximize",
      weight: 0.4,
    },
  ],
  targetAudience: {
    userSegments: ["all"],
    conditions: [],
  },
  trafficAllocation: 100,
});
```

### Получение варианта для пользователя

```typescript
const variant = await actions.getVariant("test-id");
if (variant) {
  // Применить конфигурацию варианта
  console.log("Вариант:", variant.name);
  console.log("Конфигурация:", variant.config);
}
```

### Запись результатов

```typescript
await actions.recordTestResult("test-id", {
  completion_rate: 0.8,
  engagement_time: 1200,
  satisfaction_score: 0.9,
});
```

## ML Рекомендации

### Алгоритмы

Система поддерживает несколько алгоритмов рекомендаций:

1. **Collaborative Filtering** - рекомендации на основе похожих пользователей
2. **Content-Based Filtering** - рекомендации на основе содержимого
3. **Hybrid** - комбинация обоих подходов

### Обновление признаков пользователя

```typescript
await actions.updateUserFeatures({
  preferredTopics: ["mathematics", "physics"],
  averageScore: 85,
  studyFrequency: 2.5,
  learningStyle: "visual",
});
```

### Обновление признаков темы

```typescript
await actions.updateTopicFeatures("algebra", {
  difficulty: 0.7,
  popularity: 0.8,
  averageScore: 75,
  tags: ["mathematics", "equations"],
});
```

## Расширенная аналитика

### Анализ поведения

```typescript
const behaviorProfile = await actions.analyzeBehavior();
console.log(
  "Уровень мотивации:",
  behaviorProfile.engagementMetrics.motivationLevel
);
console.log(
  "Оценка вовлеченности:",
  behaviorProfile.engagementMetrics.engagementScore
);
```

### Предиктивные инсайты

```typescript
const insights = await actions.generateInsights();
insights.predictions.forEach((prediction) => {
  console.log(`${prediction.type}: ${prediction.value}`);
});
```

### Анализ когорт

```typescript
const cohorts = await actions.getCohortAnalyses();
cohorts.forEach((cohort) => {
  console.log(`Когорта ${cohort.cohortId}: ${cohort.metrics.retentionRate}`);
});
```

## Демонстрационный компонент

Для демонстрации возможностей системы создан компонент `PersonalizationDemo`:

```typescript
import PersonalizationDemo from "../components/PersonalizationDemo";

function App() {
  return <PersonalizationDemo userId="demo-user" />;
}
```

Компонент включает:

- Обзор состояния системы
- Просмотр активных A/B тестов
- Отображение ML рекомендаций
- Просмотр аналитики и инсайтов
- Интерактивные действия для тестирования

## Конфигурация

### Опции хука

```typescript
interface PersonalizationOptions {
  autoRefresh?: boolean; // Автообновление данных
  refreshInterval?: number; // Интервал обновления (мс)
  enableABTesting?: boolean; // Включить A/B тестирование
  enableML?: boolean; // Включить ML рекомендации
  enableAnalytics?: boolean; // Включить аналитику
}
```

### Предустановленные тесты

Система включает демонстрационные A/B тесты в `DEMO_AB_TESTS`:

1. **Рекомендации алгоритм** - тестирование различных алгоритмов рекомендаций
2. **UI персонализация** - тестирование персонализированного интерфейса

## Типы данных

Все типы данных определены в `src/types/personalization.ts`:

- `ABTest`, `ABVariant`, `ABTestStats` - для A/B тестирования
- `UserFeatureVector`, `TopicFeatureVector`, `RecommendationScore` - для ML
- `UserBehaviorProfile`, `PredictiveInsights`, `CohortAnalysis` - для аналитики

## Тестирование

Система включает comprehensive тесты:

```bash
# Тесты A/B тестирования
npm test -- --testPathPattern=abTesting

# Тесты ML рекомендаций
npm test -- --testPathPattern=recommendationEngine

# Тесты интеграционного хука
npm test -- --testPathPattern=useEnhancedPersonalization
```

## Производительность

- Автообновление данных каждые 5 минут
- Кэширование результатов в AsyncStorage
- Оптимизированные алгоритмы ML
- Эффективная обработка больших объемов данных

## Безопасность

- Валидация входных данных
- Обработка ошибок и исключений
- Безопасное хранение данных пользователей
- Логирование для отладки

## Расширение

Система спроектирована для легкого расширения:

1. Добавление новых алгоритмов ML
2. Создание новых типов A/B тестов
3. Расширение аналитических метрик
4. Интеграция с внешними сервисами

## Заключение

Расширенный Personalization Engine предоставляет мощную основу для создания персонализированного опыта обучения. Система объединяет современные подходы к персонализации и предоставляет простой API для интеграции в приложение.


