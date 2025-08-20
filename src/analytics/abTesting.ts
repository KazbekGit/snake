import AsyncStorage from "@react-native-async-storage/async-storage";

// Типы для A/B тестирования
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  startDate: number;
  endDate?: number;
  variants: ABVariant[];
  metrics: ABMetric[];
  targetAudience: TargetAudience;
  trafficAllocation: number; // Процент трафика (0-100)
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  trafficPercentage: number;
}

export interface ABMetric {
  name: string;
  type: "conversion" | "engagement" | "retention" | "custom";
  goal: "maximize" | "minimize";
  weight: number; // Вес метрики (0-1)
}

export interface TargetAudience {
  userSegments: string[];
  conditions: AudienceCondition[];
}

export interface AudienceCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
  value: any;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  timestamp: number;
  metrics: Record<string, number>;
}

export interface ABTestStats {
  testId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  averageEngagement: number;
  confidenceLevel: number;
  isSignificant: boolean;
  winner: boolean;
}

// Ключи для AsyncStorage
const STORAGE_KEYS = {
  AB_TESTS: "ab_tests",
  AB_RESULTS: "ab_test_results",
  USER_ASSIGNMENTS: "ab_user_assignments",
  AB_STATS: "ab_test_stats",
};

class ABTesting {
  private static instance: ABTesting;
  private activeTests: Map<string, ABTest> = new Map();
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId

  private constructor() {
    this.initializeTests();
  }

  static getInstance(): ABTesting {
    if (!ABTesting.instance) {
      ABTesting.instance = new ABTesting();
    }
    return ABTesting.instance;
  }

  // Инициализация тестов
  private async initializeTests(): Promise<void> {
    const tests = await this.getABTests();
    tests.forEach((test) => {
      if (test.status === "active") {
        this.activeTests.set(test.id, test);
      }
    });

    await this.loadUserAssignments();
  }

  // Получение варианта для пользователя
  async getVariant(testId: string, userId: string): Promise<ABVariant | null> {
    const test = this.activeTests.get(testId);
    if (!test) return null;

    // Проверяем, подходит ли пользователь под целевую аудиторию
    if (!this.isUserInTargetAudience(userId, test.targetAudience)) {
      return null;
    }

    // Получаем или создаем назначение пользователя
    let assignment = await this.getUserAssignment(userId, testId);
    if (!assignment) {
      assignment = this.assignUserToVariant(userId, testId, test);
      await this.saveUserAssignment(userId, testId, assignment);
    }

    return test.variants.find((v) => v.id === assignment) || null;
  }

  // Назначение пользователя на вариант
  private assignUserToVariant(
    userId: string,
    testId: string,
    test: ABTest
  ): string {
    const hash = this.hashUserId(userId + testId);
    const normalizedHash = hash % 100;

    let cumulativePercentage = 0;
    for (const variant of test.variants) {
      cumulativePercentage += variant.trafficPercentage;
      if (normalizedHash < cumulativePercentage) {
        return variant.id;
      }
    }

    // Fallback на первый вариант
    return test.variants[0]?.id || "";
  }

  // Проверка принадлежности пользователя к целевой аудитории
  private isUserInTargetAudience(
    userId: string,
    targetAudience: TargetAudience
  ): boolean {
    // TODO: Реализовать проверку сегментов пользователя
    // Пока возвращаем true для всех пользователей
    return true;
  }

  // Хеширование userId для детерминированного назначения
  private hashUserId(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  // Запись результата теста
  async recordResult(
    testId: string,
    variantId: string,
    userId: string,
    metrics: Record<string, number>
  ): Promise<void> {
    const result: ABTestResult = {
      testId,
      variantId,
      userId,
      timestamp: Date.now(),
      metrics,
    };

    const results = await this.getABTestResults();
    results.push(result);
    await this.saveABTestResults(results);

    // Обновляем статистику
    await this.updateTestStats(testId, variantId, metrics);
  }

  // Обновление статистики теста
  private async updateTestStats(
    testId: string,
    variantId: string,
    metrics: Record<string, number>
  ): Promise<void> {
    const stats = await this.getABTestStats();
    const testStats = stats[testId] || {};
    const variantStats = testStats[variantId] || {
      testId,
      variantId,
      impressions: 0,
      conversions: 0,
      conversionRate: 0,
      averageEngagement: 0,
      confidenceLevel: 0,
      isSignificant: false,
      winner: false,
    };

    // Обновляем метрики
    variantStats.impressions++;

    if (metrics.conversion) {
      variantStats.conversions++;
    }

    variantStats.conversionRate =
      (variantStats.conversions / variantStats.impressions) * 100;

    if (metrics.engagement) {
      variantStats.averageEngagement =
        (variantStats.averageEngagement * (variantStats.impressions - 1) +
          metrics.engagement) /
        variantStats.impressions;
    }

    // Рассчитываем статистическую значимость
    variantStats.confidenceLevel = this.calculateConfidenceLevel(
      testStats,
      variantId
    );
    variantStats.isSignificant = variantStats.confidenceLevel > 0.95;

    testStats[variantId] = variantStats;
    stats[testId] = testStats;
    await this.saveABTestStats(stats);
  }

  // Расчет статистической значимости
  private calculateConfidenceLevel(
    testStats: Record<string, ABTestStats>,
    variantId: string
  ): number {
    // Упрощенный расчет доверительного интервала
    // В реальной реализации здесь должен быть t-test или z-test
    const variant = testStats[variantId];
    if (!variant || variant.impressions < 30) return 0;

    // Простая формула для демонстрации
    const standardError = Math.sqrt(
      (variant.conversionRate * (100 - variant.conversionRate)) /
        variant.impressions
    );

    return Math.min(standardError < 5 ? 0.95 : 0.85, 0.99);
  }

  // Получение статистики теста
  async getTestStats(testId: string): Promise<ABTestStats[]> {
    const stats = await this.getABTestStats();
    const testStats = stats[testId] || {};

    const results = Object.values(testStats);

    // Определяем победителя
    if (results.length > 1) {
      const bestVariant = results.reduce((best, current) =>
        current.conversionRate > best.conversionRate ? current : best
      );

      results.forEach((variant) => {
        variant.winner =
          variant.variantId === bestVariant.variantId && variant.isSignificant;
      });
    }

    return results;
  }

  // Создание нового A/B теста
  async createTest(test: Omit<ABTest, "id">): Promise<string> {
    const testId = `ab_test_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newTest: ABTest = {
      ...test,
      id: testId,
    };

    const tests = await this.getABTests();
    tests.push(newTest);
    await this.saveABTests(tests);

    if (newTest.status === "active") {
      this.activeTests.set(testId, newTest);
    }

    return testId;
  }

  // Обновление статуса теста
  async updateTestStatus(
    testId: string,
    status: ABTest["status"]
  ): Promise<void> {
    const tests = await this.getABTests();
    const testIndex = tests.findIndex((t) => t.id === testId);

    if (testIndex !== -1) {
      tests[testIndex].status = status;
      if (status === "completed") {
        tests[testIndex].endDate = Date.now();
      }
      await this.saveABTests(tests);

      if (status === "active") {
        this.activeTests.set(testId, tests[testIndex]);
      } else {
        this.activeTests.delete(testId);
      }
    }
  }

  // Получение всех активных тестов
  async getActiveTests(): Promise<ABTest[]> {
    return Array.from(this.activeTests.values());
  }

  // Получение конфигурации для пользователя
  async getUserConfig(userId: string, configKey: string): Promise<any> {
    const activeTests = await this.getActiveTests();

    for (const test of activeTests) {
      const variant = await this.getVariant(test.id, userId);
      if (variant && variant.config[configKey]) {
        return variant.config[configKey];
      }
    }

    return null;
  }

  // Приватные методы для работы с хранилищем

  private async getABTests(): Promise<ABTest[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AB_TESTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async saveABTests(tests: ABTest[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AB_TESTS, JSON.stringify(tests));
  }

  private async getABTestResults(): Promise<ABTestResult[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AB_RESULTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async saveABTestResults(results: ABTestResult[]): Promise<void> {
    await AsyncStorage.setItem(
      STORAGE_KEYS.AB_RESULTS,
      JSON.stringify(results)
    );
  }

  private async getUserAssignment(
    userId: string,
    testId: string
  ): Promise<string | null> {
    const assignments = this.userAssignments.get(userId);
    return assignments?.get(testId) || null;
  }

  private async saveUserAssignment(
    userId: string,
    testId: string,
    variantId: string
  ): Promise<void> {
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    this.userAssignments.get(userId)!.set(testId, variantId);
    await this.saveAllUserAssignments();
  }

  private async loadUserAssignments(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_ASSIGNMENTS);
      if (data) {
        const assignments = JSON.parse(data);
        this.userAssignments = new Map(
          Object.entries(assignments).map(([userId, testAssignments]) => [
            userId,
            new Map(Object.entries(testAssignments as Record<string, string>)),
          ])
        );
      }
    } catch {
      this.userAssignments = new Map();
    }
  }

  private async saveAllUserAssignments(): Promise<void> {
    const assignments = Object.fromEntries(
      Array.from(this.userAssignments.entries()).map(
        ([userId, testAssignments]) => [
          userId,
          Object.fromEntries(testAssignments),
        ]
      )
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_ASSIGNMENTS,
      JSON.stringify(assignments)
    );
  }

  private async getABTestStats(): Promise<
    Record<string, Record<string, ABTestStats>>
  > {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.AB_STATS);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private async saveABTestStats(
    stats: Record<string, Record<string, ABTestStats>>
  ): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AB_STATS, JSON.stringify(stats));
  }

  // Очистка данных
  async clearAllData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.AB_TESTS),
      AsyncStorage.removeItem(STORAGE_KEYS.AB_RESULTS),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_ASSIGNMENTS),
      AsyncStorage.removeItem(STORAGE_KEYS.AB_STATS),
    ]);
  }
}

export const abTesting = ABTesting.getInstance();

// Предустановленные A/B тесты для демонстрации
export const DEMO_AB_TESTS: Omit<ABTest, "id">[] = [
  {
    name: "Рекомендации алгоритм",
    description: "Тестирование различных алгоритмов рекомендаций",
    status: "active",
    startDate: Date.now(),
    variants: [
      {
        id: "control",
        name: "Контрольная группа",
        description: "Текущий алгоритм рекомендаций",
        config: {
          algorithm: "collaborative_filtering",
          weight_user_preferences: 0.3,
          weight_progress: 0.4,
          weight_recency: 0.3,
        },
        trafficPercentage: 50,
      },
      {
        id: "ml_enhanced",
        name: "ML-улучшенный",
        description: "Алгоритм с машинным обучением",
        config: {
          algorithm: "ml_enhanced",
          weight_user_preferences: 0.25,
          weight_progress: 0.35,
          weight_recency: 0.25,
          weight_behavioral_patterns: 0.15,
        },
        trafficPercentage: 50,
      },
    ],
    metrics: [
      {
        name: "conversion_rate",
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
  },
  {
    name: "UI персонализация",
    description: "Тестирование персонализированного интерфейса",
    status: "active",
    startDate: Date.now(),
    variants: [
      {
        id: "standard",
        name: "Стандартный UI",
        description: "Обычный интерфейс",
        config: {
          show_progress_bar: true,
          show_recommendations: true,
          show_achievements: true,
          theme: "default",
        },
        trafficPercentage: 50,
      },
      {
        id: "personalized",
        name: "Персонализированный UI",
        description: "Адаптивный интерфейс",
        config: {
          show_progress_bar: true,
          show_recommendations: true,
          show_achievements: true,
          theme: "adaptive",
          adaptive_layout: true,
          smart_notifications: true,
        },
        trafficPercentage: 50,
      },
    ],
    metrics: [
      {
        name: "session_duration",
        type: "engagement",
        goal: "maximize",
        weight: 0.5,
      },
      {
        name: "retention_rate",
        type: "retention",
        goal: "maximize",
        weight: 0.5,
      },
    ],
    targetAudience: {
      userSegments: ["all"],
      conditions: [],
    },
    trafficAllocation: 100,
  },
];
