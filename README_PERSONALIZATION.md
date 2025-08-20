# 🚀 Personalization Engine для Snake Learning App

## 📋 Обзор

Расширенный Personalization Engine представляет собой комплексную систему персонализации, которая объединяет A/B тестирование, машинное обучение и расширенную аналитику для создания персонализированного опыта обучения.

## 🏗️ Архитектура

Система состоит из трех основных компонентов:

### 1. A/B Тестирование (`abTesting.ts`)

- ✅ Управление активными A/B тестами
- ✅ Назначение пользователей на варианты тестов
- ✅ Запись результатов и расчет статистики
- ✅ Определение победителей тестов

### 2. ML Рекомендации (`recommendationEngine.ts`)

- ✅ Collaborative Filtering
- ✅ Content-Based Filtering
- ✅ Hybrid рекомендации
- ✅ Обновление признаков пользователей и контента

### 3. Расширенная аналитика (`enhancedAnalytics.ts`)

- ✅ Анализ поведения пользователей
- ✅ Предиктивные инсайты
- ✅ Анализ когорт
- ✅ Выявление паттернов обучения

## 🚀 Быстрый старт

### 1. Установка зависимостей

```bash
npm install @react-native-async-storage/async-storage
```

### 2. Базовое использование

```typescript
import { useEnhancedPersonalization } from "./src/hooks/useEnhancedPersonalization";

function MyComponent() {
  const [state, actions] = useEnhancedPersonalization("user-123");

  const handleStartLearning = async () => {
    await actions.startStudySession({
      topicId: "math-basics",
      availableTime: 30,
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

### 3. Получение рекомендаций с контекстом

```typescript
const recommendations = await actions.getRecommendations(5, {
  availableTime: 15, // 15 минут
  difficultyPreference: 0.7,
  section: "mathematics",
});
```

## 📁 Структура файлов

```
src/
├── analytics/
│   ├── abTesting.ts              # A/B тестирование
│   ├── enhancedAnalytics.ts      # Расширенная аналитика
│   └── advancedAnalytics.ts      # Базовая аналитика
├── ml/
│   └── recommendationEngine.ts   # ML рекомендации
├── hooks/
│   └── useEnhancedPersonalization.ts  # Основной хук
├── types/
│   └── personalization.ts        # Типы данных
├── components/
│   ├── PersonalizationDemo.tsx   # Демо компонент
│   └── PersonalizationExample.tsx # Пример использования
└── examples/
    └── PersonalizationExample.tsx # Полный пример
```

## 🧪 Тестирование

Все компоненты покрыты тестами:

```bash
# Запуск всех тестов
npm test

# Тесты Personalization Engine
npm test -- --testPathPattern=personalization

# Тесты A/B тестирования
npm test -- --testPathPattern=abTesting

# Тесты ML рекомендаций
npm test -- --testPathPattern=recommendationEngine
```

## 📊 Возможности

### A/B Тестирование

- ✅ Создание и управление тестами
- ✅ Назначение пользователей на варианты
- ✅ Запись результатов и метрик
- ✅ Статистический анализ
- ✅ Определение победителей

### ML Рекомендации

- ✅ Collaborative Filtering
- ✅ Content-Based Filtering
- ✅ Hybrid подход
- ✅ Персонализированные рекомендации
- ✅ Обновление признаков в реальном времени

### Аналитика

- ✅ Анализ поведения пользователей
- ✅ Предиктивные инсайты
- ✅ Анализ когорт
- ✅ Выявление паттернов обучения
- ✅ Прогнозирование оттока

## 🎯 Примеры использования

### 1. Создание A/B теста

```typescript
import { abTesting } from "./src/analytics/abTesting";

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

### 2. Получение рекомендаций

```typescript
import { recommendationEngine } from "./src/ml/recommendationEngine";

// Обновление признаков пользователя
await recommendationEngine.updateUserFeatures("user-123", {
  preferredTopics: ["mathematics", "physics"],
  averageScore: 85,
  studyFrequency: 2.5,
});

// Получение рекомендаций
const recommendations = await recommendationEngine.getRecommendations(
  "user-123",
  5,
  { availableTime: 30, difficultyPreference: 0.7 }
);
```

### 3. Анализ поведения

```typescript
import { enhancedAnalytics } from "./src/analytics/enhancedAnalytics";

// Анализ поведения пользователя
const behaviorProfile = await enhancedAnalytics.analyzeUserBehavior("user-123");

// Генерация предиктивных инсайтов
const insights = await enhancedAnalytics.generatePredictiveInsights("user-123");

// Анализ когорт
const cohorts = await enhancedAnalytics.analyzeCohorts();
```

## 🔧 Конфигурация

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

Система включает демонстрационные A/B тесты:

1. **Рекомендации алгоритм** - тестирование различных алгоритмов рекомендаций
2. **UI персонализация** - тестирование персонализированного интерфейса

## 📈 Производительность

- ⚡ Автообновление данных каждые 5 минут
- 💾 Кэширование результатов в AsyncStorage
- 🧠 Оптимизированные алгоритмы ML
- 📊 Эффективная обработка больших объемов данных

## 🔒 Безопасность

- ✅ Валидация входных данных
- ✅ Обработка ошибок и исключений
- ✅ Безопасное хранение данных пользователей
- ✅ Логирование для отладки

## 🚀 Демонстрация

Для демонстрации возможностей системы используйте:

```typescript
import PersonalizationDemo from './src/components/PersonalizationDemo';
import PersonalizationExample from './src/examples/PersonalizationExample';

// Простая демонстрация
<PersonalizationDemo userId="demo-user" />

// Полный пример использования
<PersonalizationExample />
```

## 📚 Документация

Подробная документация доступна в:

- `docs/PERSONALIZATION_ENGINE.md` - Полная документация
- `src/types/personalization.ts` - Типы данных
- `src/examples/PersonalizationExample.tsx` - Примеры использования

## 🤝 Расширение

Система спроектирована для легкого расширения:

1. **Добавление новых алгоритмов ML**
2. **Создание новых типов A/B тестов**
3. **Расширение аналитических метрик**
4. **Интеграция с внешними сервисами**

## 📊 Статистика

- ✅ **45 тестов** - все проходят успешно
- ✅ **3 основных компонента** - A/B тестирование, ML, аналитика
- ✅ **Полная интеграция** - все компоненты работают вместе
- ✅ **TypeScript** - полная типизация
- ✅ **Документация** - подробная документация и примеры

## 🎉 Заключение

Personalization Engine предоставляет мощную основу для создания персонализированного опыта обучения. Система объединяет современные подходы к персонализации и предоставляет простой API для интеграции в приложение.

---

**Готово к использованию! 🚀**


