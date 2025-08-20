import { useState, useEffect, useCallback, useRef } from "react";
import { abTesting } from "../analytics/abTesting";
import { recommendationEngine } from "../ml/recommendationEngine";
import { enhancedAnalytics } from "../analytics/enhancedAnalytics";
import { advancedAnalytics } from "../analytics/advancedAnalytics";
import {
  subscribeToEvents,
  getEvents,
  getStreakDays,
} from "../utils/analytics";
import { getUserProgress } from "../utils/progressStorage";
import type {
  ABTest,
  ABVariant,
  ABTestStats,
  RecommendationScore,
  UserBehaviorProfile,
  PredictiveInsights,
  CohortAnalysis,
} from "../types/personalization";

export interface EnhancedPersonalizationState {
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

export interface EnhancedPersonalizationActions {
  // A/B тестирование
  getVariant: (testId: string) => Promise<ABVariant | null>;
  recordTestResult: (
    testId: string,
    metrics: Record<string, number>
  ) => Promise<void>;
  getTestStats: (testId: string) => Promise<ABTestStats[]>;

  // ML рекомендации
  getRecommendations: (
    limit?: number,
    context?: Record<string, any>
  ) => Promise<RecommendationScore[]>;
  updateUserFeatures: (features: Record<string, any>) => Promise<void>;
  updateTopicFeatures: (
    topicId: string,
    features: Record<string, any>
  ) => Promise<void>;

  // Расширенная аналитика
  analyzeBehavior: () => Promise<UserBehaviorProfile>;
  generateInsights: () => Promise<PredictiveInsights>;
  getCohortAnalyses: () => Promise<CohortAnalysis[]>;

  // Интеграционные действия
  startStudySession: (context?: Record<string, any>) => Promise<void>;
  endStudySession: (metrics: Record<string, number>) => Promise<void>;
  recordInteraction: (interaction: Record<string, any>) => Promise<void>;
  refreshAll: () => Promise<void>;
}

export const useEnhancedPersonalization = (
  userId: string,
  options?: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    enableABTesting?: boolean;
    enableML?: boolean;
    enableAnalytics?: boolean;
    demoFill?: boolean;
    debounceMs?: number;
  }
): [EnhancedPersonalizationState, EnhancedPersonalizationActions] => {
  const {
    autoRefresh = true,
    refreshInterval = 300000, // 5 минут
    enableABTesting = true,
    enableML = true,
    enableAnalytics = true,
    debounceMs = 300,
  } = options || {};
  const demoFill = options?.demoFill ?? __DEV__;

  const [state, setState] = useState<EnhancedPersonalizationState>({
    activeTests: [],
    userVariants: new Map(),
    testStats: new Map(),
    recommendations: [],
    recommendationContext: {},
    behaviorProfile: null,
    predictiveInsights: null,
    cohortAnalyses: [],
    isLoading: true,
    error: null,
    lastUpdated: 0,
  });

  // Дебаунс для обновлений
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Агрегация фичей пользователя из реальных данных
  const aggregateUserFeatures = useCallback(async () => {
    try {
      const [progress, streakDays, events] = await Promise.all([
        getUserProgress(),
        getStreakDays(),
        getEvents(),
      ]);

      // Вычисляем метрики из прогресса
      const topics = Object.values(progress.topics);
      const completedTopics = topics.filter(
        (t) => t.completedBlocks >= t.totalBlocks
      ).length;
      const totalCompletedBlocks = topics.reduce(
        (sum, t) => sum + t.completedBlocks,
        0
      );
      const totalBlocks = topics.reduce((sum, t) => sum + t.totalBlocks, 0);
      const completionRate =
        totalBlocks > 0 ? totalCompletedBlocks / totalBlocks : 0;

      // Средний балл из тестов
      const testScores = Object.values(progress.testScores);
      const averageScore =
        testScores.length > 0
          ? testScores.reduce((sum, score) => sum + score, 0) /
            testScores.length
          : 0;

      // Частота занятий (события за последнюю неделю)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentEvents = events.filter(
        (e) => new Date(e.timestamp) > weekAgo
      );
      const studyFrequency = recentEvents.length;

      // Предпочитаемое время суток
      const hourCounts = new Array(24).fill(0);
      events.forEach((e) => {
        const hour = new Date(e.timestamp).getHours();
        hourCounts[hour]++;
      });
      const preferredTimeOfDay = hourCounts.indexOf(Math.max(...hourCounts));

      // Слабые и сильные темы
      const topicScores = Object.entries(progress.testScores);
      const sortedTopics = topicScores.sort(([, a], [, b]) => b - a);
      const strongTopics = sortedTopics.slice(0, 3).map(([topicId]) => topicId);
      const weakTopics = sortedTopics.slice(-3).map(([topicId]) => topicId);

      // Общее время изучения
      const totalStudyTime = topics.reduce((sum, t) => sum + t.studyTime, 0);

      return {
        completionRate,
        averageScore,
        streakDays,
        studyFrequency,
        preferredTimeOfDay,
        strongTopics,
        weakTopics,
        totalStudyTime,
        completedTopics,
        totalTopics: topics.length,
        lastActivity: progress.lastActivity,
      };
    } catch (error) {
      console.error("Failed to aggregate user features:", error);
      return {
        completionRate: 0,
        averageScore: 0,
        streakDays: 0,
        studyFrequency: 0,
        preferredTimeOfDay: 12,
        strongTopics: [],
        weakTopics: [],
        totalStudyTime: 0,
        completedTopics: 0,
        totalTopics: 0,
        lastActivity: new Date().toISOString(),
      };
    }
  }, []);

  // Дебаунсированная загрузка рекомендаций и аналитики
  const debouncedLoadData = useCallback(async () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        // Обновляем фичи пользователя в ML
        if (enableML) {
          const features = await aggregateUserFeatures();
          await recommendationEngine.updateUserFeatures(userId, {
            ...features,
            preferredTimeOfDay: String(features.preferredTimeOfDay),
          } as any);
        }

        // Перезагружаем данные
        await Promise.all([
          Promise.resolve().then(() => loadRecommendations()),
          Promise.resolve().then(() => loadAnalytics()),
        ]);

        setState((prev) => ({ ...prev, lastUpdated: Date.now() }));
      } catch (error) {
        console.error("Failed to debounced load data:", error);
      }
    }, debounceMs);
  }, [
    enableML,
    aggregateUserFeatures,
    loadRecommendations,
    loadAnalytics,
    debounceMs,
  ]);

  // Загрузка A/B тестов
  const loadABTests = useCallback(async () => {
    if (!enableABTesting) return;

    try {
      const activeTests = await abTesting.getActiveTests();
      const userVariants = new Map<string, ABVariant>();

      // Получаем варианты для пользователя
      for (const test of activeTests) {
        const variant = await abTesting.getVariant(test.id, userId);
        if (variant) {
          userVariants.set(test.id, variant);
        }
      }

      setState((prev) => ({
        ...prev,
        activeTests,
        userVariants,
      }));
    } catch (error) {
      console.error("Failed to load A/B tests:", error);
      setState((prev) => ({ ...prev, error: "Failed to load A/B tests" }));
    }
  }, [userId, enableABTesting]);

  // Загрузка рекомендаций
  const loadRecommendations = useCallback(async () => {
    if (!enableML) return;

    try {
      const recommendations = await recommendationEngine.getRecommendations(
        userId,
        10
      );
      setState((prev) => ({
        ...prev,
        recommendations,
      }));
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      setState((prev) => ({
        ...prev,
        error: "Failed to load recommendations",
      }));
    }
  }, [userId, enableML]);

  // Загрузка аналитики
  const loadAnalytics = useCallback(async () => {
    if (!enableAnalytics) return;

    try {
      const [behaviorProfile, predictiveInsights, cohortAnalyses] =
        await Promise.all([
          enhancedAnalytics.analyzeUserBehavior(userId),
          enhancedAnalytics.generatePredictiveInsights(userId),
          enhancedAnalytics.analyzeCohorts(),
        ]);

      setState((prev) => ({
        ...prev,
        behaviorProfile,
        predictiveInsights,
        cohortAnalyses,
      }));
    } catch (error) {
      console.error("Failed to load analytics:", error);
      setState((prev) => ({ ...prev, error: "Failed to load analytics" }));
    }
  }, [userId, enableAnalytics]);

  // Инициализация
  useEffect(() => {
    const initialize = async () => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        await Promise.all([
          loadABTests(),
          loadRecommendations(),
          loadAnalytics(),
        ]);

        setState((prev) => {
          if (!demoFill) {
            return { ...prev, isLoading: false, lastUpdated: Date.now() };
          }
          // Заполняем демо-данными, если пусто
          const hasAnyData =
            prev.activeTests.length > 0 ||
            prev.recommendations.length > 0 ||
            !!prev.behaviorProfile ||
            !!prev.predictiveInsights ||
            prev.cohortAnalyses.length > 0;

          if (hasAnyData) {
            return { ...prev, isLoading: false, lastUpdated: Date.now() };
          }

          const demoRecommendations = [
            {
              topicId: "money",
              score: 0.92,
              factors: {
                userPreference: 0.9,
                contentRelevance: 0.85,
                difficultyMatch: 0.8,
                progressAlignment: 0.7,
                recency: 0.6,
                popularity: 0.8,
              },
              explanation: "Тема соответствует интересам и уровню сложности",
            },
            {
              topicId: "market",
              score: 0.81,
              factors: {
                userPreference: 0.7,
                contentRelevance: 0.8,
                difficultyMatch: 0.75,
                progressAlignment: 0.65,
                recency: 0.55,
                popularity: 0.9,
              },
              explanation: "Высокая релевантность и популярность",
            },
          ];
          const demoProfile = {
            userId,
            learningPatterns: [],
            engagementMetrics: {
              sessionFrequency: 4,
              averageSessionDuration: 25 * 60 * 1000,
              completionRate: 0.62,
              retentionRate: 0.78,
              engagementScore: 0.74,
              motivationLevel: "medium" as const,
              dropoffPoints: [],
            },
            performanceTrends: [],
            contentPreferences: {
              favoriteTopics: ["money", "market"],
              avoidedTopics: ["law"],
              preferredDifficulty: 0.6,
              preferredContentType: "text" as const,
              learningStyle: "visual" as const,
              pacePreference: "normal" as const,
            },
            timePatterns: {
              preferredStudyTimes: [{ hour: 19, frequency: 5 }],
              weeklyPattern: [],
              sessionGaps: [],
              optimalSessionDuration: 30 * 60 * 1000,
              breakPatterns: [],
            },
            socialPatterns: {
              comparisonGroup: "grade-10",
              percentileRank: 68,
              competitiveSpirit: "medium" as const,
              socialMotivation: 0.5,
              peerInfluence: 0.4,
            },
            lastUpdated: Date.now(),
          };
          const demoInsights = {
            userId,
            predictions: [
              {
                type: "completion_probability" as const,
                value: 0.82,
                confidence: 0.7,
                timeframe: 30,
                factors: ["стабильный прогресс", "средняя вовлеченность"],
              },
            ],
            recommendations: [
              {
                type: "optimization" as const,
                priority: "medium" as const,
                title: "Короткие сессии вечером",
                description: "Планируйте 25–30 минут в вечернее время",
                expectedImpact: 0.12,
                implementation: "поставить напоминание",
              },
            ],
            riskFactors: [
              {
                factor: "перерывы > 5 дней",
                severity: "low" as const,
                probability: 0.2,
                mitigation: "пуш-напоминания",
              },
            ],
            opportunities: [
              {
                area: "повышение средн. балла",
                potential: 0.3,
                effort: 0.2,
                roi: 1.5,
                description: "добавить 2 практических мини-теста в неделю",
              },
            ],
            lastUpdated: Date.now(),
          };
          const demoAB: ABTest[] = [
            {
              id: "home-layout",
              name: "Home layout",
              description: "Перестановка блоков на главной",
              status: "active",
              startDate: Date.now() - 7 * 86400000,
              variants: [
                {
                  id: "A",
                  name: "Control",
                  description: "Оригинал",
                  config: {},
                  trafficPercentage: 50,
                },
                {
                  id: "B",
                  name: "Variant",
                  description: "Рекомендации выше",
                  config: { recommendationsFirst: true },
                  trafficPercentage: 50,
                },
              ],
              metrics: [
                {
                  name: "ctr_reco",
                  type: "engagement",
                  goal: "maximize",
                  weight: 1,
                },
              ],
              targetAudience: { userSegments: ["all"], conditions: [] },
              trafficAllocation: 100,
            },
          ];

          return {
            ...prev,
            recommendations: demoRecommendations as any,
            behaviorProfile: demoProfile as any,
            predictiveInsights: demoInsights as any,
            activeTests: demoAB as any,
            isLoading: false,
            lastUpdated: Date.now(),
          };
        });
      } catch (error) {
        console.error("Failed to initialize enhanced personalization:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: "Failed to initialize",
        }));
      }
    };

    initialize();
  }, [loadABTests, loadRecommendations, loadAnalytics]);

  // Автообновление
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        await Promise.all([loadRecommendations(), loadAnalytics()]);

        setState((prev) => ({
          ...prev,
          lastUpdated: Date.now(),
        }));
      } catch (error) {
        console.error("Failed to refresh personalization data:", error);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadRecommendations, loadAnalytics]);

  // Реакция на события аналитики (реальные источники данных)
  useEffect(() => {
    if (typeof subscribeToEvents !== "function") {
      return () => {};
    }
    const unsubscribe = subscribeToEvents(async () => {
      await debouncedLoadData();
    });
    return unsubscribe;
  }, [debouncedLoadData]);

  // Действия для A/B тестирования
  const getVariant = useCallback(
    async (testId: string): Promise<ABVariant | null> => {
      if (!enableABTesting) return null;

      try {
        return await abTesting.getVariant(testId, userId);
      } catch (error) {
        console.error("Failed to get variant:", error);
        return null;
      }
    },
    [userId, enableABTesting]
  );

  const recordTestResult = useCallback(
    async (testId: string, metrics: Record<string, number>) => {
      if (!enableABTesting) return;

      try {
        const variant = await abTesting.getVariant(testId, userId);
        if (variant) {
          await abTesting.recordResult(testId, variant.id, userId, metrics);

          // Обновляем статистику
          const stats = await abTesting.getTestStats(testId);
          setState((prev) => ({
            ...prev,
            testStats: new Map(prev.testStats.set(testId, stats)),
          }));
        }
      } catch (error) {
        console.error("Failed to record test result:", error);
      }
    },
    [userId, enableABTesting]
  );

  const getTestStats = useCallback(
    async (testId: string): Promise<ABTestStats[]> => {
      if (!enableABTesting) return [];

      try {
        return await abTesting.getTestStats(testId);
      } catch (error) {
        console.error("Failed to get test stats:", error);
        return [];
      }
    },
    [enableABTesting]
  );

  // Действия для ML рекомендаций
  const getRecommendations = useCallback(
    async (
      limit: number = 10,
      context?: Record<string, any>
    ): Promise<RecommendationScore[]> => {
      if (!enableML) return [];

      try {
        // Обогащаем контекст текущим временем и базовыми данными
        const enrichedContext = {
          ...context,
          timeOfDay: new Date().getHours(),
          currentTimestamp: Date.now(),
        };

        const recommendations = await recommendationEngine.getRecommendations(
          userId,
          limit,
          enrichedContext
        );
        setState((prev) => ({
          ...prev,
          recommendations,
          recommendationContext: enrichedContext,
        }));
        return recommendations;
      } catch (error) {
        console.error("Failed to get recommendations:", error);
        return [];
      }
    },
    [userId, enableML]
  );

  const updateUserFeatures = useCallback(
    async (features: Record<string, any>) => {
      if (!enableML) return;

      try {
        await recommendationEngine.updateUserFeatures(userId, features);
        // Перезагружаем рекомендации
        await loadRecommendations();
      } catch (error) {
        console.error("Failed to update user features:", error);
      }
    },
    [userId, enableML, loadRecommendations]
  );

  const updateTopicFeatures = useCallback(
    async (topicId: string, features: Record<string, any>) => {
      if (!enableML) return;

      try {
        await recommendationEngine.updateTopicFeatures(topicId, features);
        // Перезагружаем рекомендации
        await loadRecommendations();
      } catch (error) {
        console.error("Failed to update topic features:", error);
      }
    },
    [enableML, loadRecommendations]
  );

  // Действия для аналитики
  const analyzeBehavior =
    useCallback(async (): Promise<UserBehaviorProfile> => {
      if (!enableAnalytics) {
        throw new Error("Analytics is disabled");
      }

      try {
        const profile = await enhancedAnalytics.analyzeUserBehavior(userId);
        setState((prev) => ({
          ...prev,
          behaviorProfile: profile,
        }));
        return profile;
      } catch (error) {
        console.error("Failed to analyze behavior:", error);
        throw error;
      }
    }, [userId, enableAnalytics]);

  const generateInsights =
    useCallback(async (): Promise<PredictiveInsights> => {
      if (!enableAnalytics) {
        throw new Error("Analytics is disabled");
      }

      try {
        const insights = await enhancedAnalytics.generatePredictiveInsights(
          userId
        );
        setState((prev) => ({
          ...prev,
          predictiveInsights: insights,
        }));
        return insights;
      } catch (error) {
        console.error("Failed to generate insights:", error);
        throw error;
      }
    }, [userId, enableAnalytics]);

  const getCohortAnalyses = useCallback(async (): Promise<CohortAnalysis[]> => {
    if (!enableAnalytics) return [];

    try {
      const analyses = await enhancedAnalytics.analyzeCohorts();
      setState((prev) => ({
        ...prev,
        cohortAnalyses: analyses,
      }));
      return analyses;
    } catch (error) {
      console.error("Failed to get cohort analyses:", error);
      return [];
    }
  }, [enableAnalytics]);

  // Интеграционные действия
  const startStudySession = useCallback(
    async (context?: Record<string, any>) => {
      try {
        // Запускаем сессию в advanced analytics
        await advancedAnalytics.startStudySession(userId, context?.topicId);

        // Обновляем контекст рекомендаций
        if (context) {
          setState((prev) => ({
            ...prev,
            recommendationContext: {
              ...prev.recommendationContext,
              ...context,
            },
          }));
        }

        // Записываем результат A/B теста для UI персонализации
        if (enableABTesting) {
          await recordTestResult("ui_personalization", {
            session_start: 1,
            timestamp: Date.now(),
          });
        }
      } catch (error) {
        console.error("Failed to start study session:", error);
      }
    },
    [userId, enableABTesting, recordTestResult]
  );

  const endStudySession = useCallback(
    async (metrics: Record<string, number>) => {
      try {
        // Завершаем сессию в advanced analytics
        await advancedAnalytics.endStudySession(userId, metrics);

        // Записываем результаты A/B тестов
        if (enableABTesting) {
          await Promise.all([
            recordTestResult("recommendations_algorithm", {
              session_duration: metrics.duration || 0,
              completion_rate: metrics.completionRate || 0,
              engagement_score: metrics.engagementScore || 0,
            }),
            recordTestResult("ui_personalization", {
              session_end: 1,
              session_duration: metrics.duration || 0,
              satisfaction_score: metrics.satisfactionScore || 0,
            }),
          ]);
        }

        // Обновляем аналитику
        if (enableAnalytics) {
          await Promise.all([analyzeBehavior(), generateInsights()]);
        }
      } catch (error) {
        console.error("Failed to end study session:", error);
      }
    },
    [
      userId,
      enableABTesting,
      enableAnalytics,
      recordTestResult,
      analyzeBehavior,
      generateInsights,
    ]
  );

  const recordInteraction = useCallback(
    async (interaction: Record<string, any>) => {
      try {
        // Записываем взаимодействие в advanced analytics
        await advancedAnalytics.addInteraction(userId, interaction);

        // Обновляем признаки пользователя для ML
        if (enableML && interaction.type) {
          await updateUserFeatures({
            lastInteraction: interaction.type,
            interactionCount: (interaction.count || 0) + 1,
          });
        }

        // Записываем результаты A/B тестов
        if (enableABTesting) {
          await recordTestResult("recommendations_algorithm", {
            interaction_type: interaction.type,
            interaction_value: interaction.value || 0,
          });
        }
      } catch (error) {
        console.error("Failed to record interaction:", error);
      }
    },
    [userId, enableML, enableABTesting, updateUserFeatures, recordTestResult]
  );

  const refreshAll = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      await Promise.all([
        loadABTests(),
        loadRecommendations(),
        loadAnalytics(),
      ]);

      setState((prev) => ({
        ...prev,
        isLoading: false,
        lastUpdated: Date.now(),
        error: null,
      }));
    } catch (error) {
      console.error("Failed to refresh all data:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Failed to refresh data",
      }));
    }
  }, [loadABTests, loadRecommendations, loadAnalytics]);

  const actions: EnhancedPersonalizationActions = {
    getVariant,
    recordTestResult,
    getTestStats,
    getRecommendations,
    updateUserFeatures,
    updateTopicFeatures,
    analyzeBehavior,
    generateInsights,
    getCohortAnalyses,
    startStudySession,
    endStudySession,
    recordInteraction,
    refreshAll,
  };

  return [state, actions];
};
