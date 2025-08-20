import { renderHook, act } from "@testing-library/react-hooks";
import { useEnhancedPersonalization } from "../useEnhancedPersonalization";
import { abTesting } from "../../analytics/abTesting";
import { recommendationEngine } from "../../ml/recommendationEngine";
import { enhancedAnalytics } from "../../analytics/enhancedAnalytics";
import { advancedAnalytics } from "../../analytics/advancedAnalytics";

// Мокаем все зависимости
jest.mock("../../analytics/abTesting");
jest.mock("../../ml/recommendationEngine");
jest.mock("../../analytics/enhancedAnalytics");
jest.mock("../../analytics/advancedAnalytics");
jest.mock("../../utils/analytics", () => ({
  subscribeToEvents: jest.fn(() => jest.fn()), // возвращает unsubscribe функцию
  getUserProgress: jest.fn(),
  getStreakDays: jest.fn(),
  getEvents: jest.fn(),
}));
jest.mock("../../utils/progressStorage", () => ({
  getUserProgress: jest.fn(),
  getStreakDays: jest.fn(),
}));

const mockAbTesting = abTesting as jest.Mocked<typeof abTesting>;
const mockRecommendationEngine = recommendationEngine as jest.Mocked<
  typeof recommendationEngine
>;
const mockEnhancedAnalytics = enhancedAnalytics as jest.Mocked<
  typeof enhancedAnalytics
>;
const mockAdvancedAnalytics = advancedAnalytics as jest.Mocked<
  typeof advancedAnalytics
>;

describe("useEnhancedPersonalization", () => {
  const userId = "test-user-id";

  beforeEach(() => {
    jest.clearAllMocks();

    // Настройка моков по умолчанию
    mockAbTesting.getActiveTests.mockResolvedValue([]);
    mockAbTesting.getVariant.mockResolvedValue(null);
    mockRecommendationEngine.getRecommendations.mockResolvedValue([]);
    mockEnhancedAnalytics.analyzeUserBehavior.mockResolvedValue({
      userId,
      learningPatterns: [],
      engagementMetrics: {
        sessionFrequency: 0,
        averageSessionDuration: 0,
        completionRate: 0,
        retentionRate: 0,
        engagementScore: 0,
        motivationLevel: "medium",
        dropoffPoints: [],
      },
      performanceTrends: [],
      contentPreferences: {
        favoriteTopics: [],
        avoidedTopics: [],
        preferredDifficulty: 0.5,
        preferredContentType: "text",
        learningStyle: "visual",
        pacePreference: "normal",
      },
      timePatterns: {
        preferredStudyTimes: [],
        weeklyPattern: [],
        sessionGaps: [],
        optimalSessionDuration: 30,
        breakPatterns: [],
      },
      socialPatterns: {
        comparisonGroup: "default",
        percentileRank: 50,
        competitiveSpirit: "medium",
        socialMotivation: 0.5,
        peerInfluence: 0.5,
      },
      lastUpdated: Date.now(),
    });
    mockEnhancedAnalytics.generatePredictiveInsights.mockResolvedValue({
      userId,
      predictions: [],
      recommendations: [],
      riskFactors: [],
      opportunities: [],
      lastUpdated: Date.now(),
    });
    mockEnhancedAnalytics.analyzeCohorts.mockResolvedValue([]);
    mockAdvancedAnalytics.startStudySession.mockResolvedValue();
    mockAdvancedAnalytics.endStudySession.mockResolvedValue();
    mockAdvancedAnalytics.addInteraction.mockResolvedValue();
  });

  describe("Инициализация", () => {
    it("должен инициализироваться с правильным состоянием", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      expect(result.current[0].isLoading).toBe(true);
      expect(result.current[0].error).toBeNull();

      await waitForNextUpdate();

      expect(result.current[0].isLoading).toBe(false);
      expect(result.current[0].activeTests).toEqual([]);
      expect(result.current[0].recommendations).toEqual([]);
      expect(result.current[0].behaviorProfile).toBeDefined();
      expect(result.current[0].predictiveInsights).toBeDefined();
      expect(result.current[0].cohortAnalyses).toEqual([]);
    });

    it("должен обрабатывать ошибки инициализации", async () => {
      mockAbTesting.getActiveTests.mockRejectedValue(
        new Error("AB Test error")
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      expect(result.current[0].isLoading).toBe(false);
      expect(result.current[0].error).toBe("Failed to load A/B tests");
    });

    it("должен отключать функции через опции", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId, {
          enableABTesting: false,
          enableML: false,
          enableAnalytics: false,
        })
      );

      await waitForNextUpdate();

      expect(mockAbTesting.getActiveTests).not.toHaveBeenCalled();
      expect(
        mockRecommendationEngine.getRecommendations
      ).not.toHaveBeenCalled();
      expect(mockEnhancedAnalytics.analyzeUserBehavior).not.toHaveBeenCalled();
    });
  });

  describe("A/B тестирование", () => {
    it("должен получать варианты A/B тестов", async () => {
      const mockVariant = {
        id: "test-variant",
        name: "Test Variant",
        description: "Test description",
        config: { test: true },
        trafficPercentage: 50,
      };

      mockAbTesting.getActiveTests.mockResolvedValue([
        {
          id: "test-1",
          name: "Test 1",
          description: "Test 1 description",
          status: "active",
          startDate: Date.now(),
          variants: [mockVariant],
          metrics: [],
          targetAudience: { userSegments: [], conditions: [] },
          trafficAllocation: 100,
        },
      ]);
      mockAbTesting.getVariant.mockResolvedValue(mockVariant);

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      expect(result.current[0].activeTests).toHaveLength(1);
      expect(result.current[0].userVariants.get("test-1")).toEqual(mockVariant);
    });

    it("должен записывать результаты A/B тестов", async () => {
      const mockVariant = {
        id: "test-variant",
        name: "Test Variant",
        description: "Test description",
        config: { test: true },
        trafficPercentage: 50,
      };

      mockAbTesting.getVariant.mockResolvedValue(mockVariant);
      mockAbTesting.getTestStats.mockResolvedValue([]);

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current[1].recordTestResult("test-1", {
          conversion: 1,
          engagement: 0.8,
        });
      });

      expect(mockAbTesting.recordResult).toHaveBeenCalledWith(
        "test-1",
        "test-variant",
        userId,
        { conversion: 1, engagement: 0.8 }
      );
    });

    it("должен получать статистику A/B тестов", async () => {
      const mockStats = [
        {
          testId: "test-1",
          variantId: "variant-1",
          impressions: 100,
          conversions: 20,
          conversionRate: 20,
          averageEngagement: 0.8,
          confidenceLevel: 0.95,
          isSignificant: true,
          winner: true,
        },
      ];

      mockAbTesting.getTestStats.mockResolvedValue(mockStats);

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      const stats = await result.current[1].getTestStats("test-1");
      expect(stats).toEqual(mockStats);
    });
  });

  describe("ML рекомендации", () => {
    it("должен получать рекомендации", async () => {
      const mockRecommendations = [
        {
          topicId: "topic-1",
          score: 0.9,
          factors: {
            userPreference: 0.8,
            contentRelevance: 0.9,
            difficultyMatch: 0.7,
            progressAlignment: 0.8,
            recency: 0.6,
            popularity: 0.7,
          },
          explanation: "Рекомендуется на основе ваших интересов",
        },
      ];

      mockRecommendationEngine.getRecommendations.mockResolvedValue(
        mockRecommendations
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      const recommendations = await result.current[1].getRecommendations(5, {
        availableTime: 30,
        difficultyPreference: 0.7,
      });

      expect(recommendations).toEqual(mockRecommendations);
      expect(mockRecommendationEngine.getRecommendations).toHaveBeenCalledWith(
        userId,
        5,
        expect.objectContaining({
          availableTime: 30,
          difficultyPreference: 0.7,
          timeOfDay: expect.any(Number),
          currentTimestamp: expect.any(Number),
        })
      );
    });

    it("должен обновлять признаки пользователя", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current[1].updateUserFeatures({
          preferredTopics: ["topic-1", "topic-2"],
          averageScore: 85,
        });
      });

      expect(mockRecommendationEngine.updateUserFeatures).toHaveBeenCalledWith(
        userId,
        { preferredTopics: ["topic-1", "topic-2"], averageScore: 85 }
      );
    });

    it("должен обновлять признаки темы", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current[1].updateTopicFeatures("topic-1", {
          popularity: 0.8,
          averageScore: 75,
        });
      });

      expect(mockRecommendationEngine.updateTopicFeatures).toHaveBeenCalledWith(
        "topic-1",
        { popularity: 0.8, averageScore: 75 }
      );
    });
  });

  describe("Аналитика", () => {
    it("должен анализировать поведение пользователя", async () => {
      const mockProfile = {
        userId,
        learningPatterns: [
          {
            patternId: "pattern-1",
            type: "session_duration",
            description: "Стабильная длительность сессий",
            confidence: 0.9,
            data: { averageDuration: 30 },
            lastObserved: Date.now(),
          },
        ],
        engagementMetrics: {
          sessionFrequency: 2.5,
          averageSessionDuration: 25,
          completionRate: 0.8,
          retentionRate: 0.9,
          engagementScore: 75,
          motivationLevel: "high",
          dropoffPoints: [],
        },
        performanceTrends: [],
        contentPreferences: {
          favoriteTopics: ["topic-1"],
          avoidedTopics: [],
          preferredDifficulty: 0.7,
          preferredContentType: "interactive",
          learningStyle: "visual",
          pacePreference: "normal",
        },
        timePatterns: {
          preferredStudyTimes: [{ hour: 18, frequency: 5 }],
          weeklyPattern: [],
          sessionGaps: [],
          optimalSessionDuration: 30,
          breakPatterns: [],
        },
        socialPatterns: {
          comparisonGroup: "grade_9_ege",
          percentileRank: 80,
          competitiveSpirit: "high",
          socialMotivation: 0.8,
          peerInfluence: 0.6,
        },
        lastUpdated: Date.now(),
      };

      mockEnhancedAnalytics.analyzeUserBehavior.mockResolvedValue(mockProfile);

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      const profile = await result.current[1].analyzeBehavior();
      expect(profile).toEqual(mockProfile);
    });

    it("должен генерировать предиктивные инсайты", async () => {
      const mockInsights = {
        userId,
        predictions: [
          {
            type: "completion_probability",
            value: 0.85,
            confidence: 0.8,
            timeframe: 30,
            factors: ["engagement_score", "completion_rate"],
          },
        ],
        recommendations: [
          {
            type: "optimization",
            priority: "medium",
            title: "Оптимизация контента",
            description: "Рекомендуем адаптировать сложность материала",
            expectedImpact: 0.2,
            implementation: "A/B тестирование различных подходов",
          },
        ],
        riskFactors: [],
        opportunities: [],
        lastUpdated: Date.now(),
      };

      mockEnhancedAnalytics.generatePredictiveInsights.mockResolvedValue(
        mockInsights
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      const insights = await result.current[1].generateInsights();
      expect(insights).toEqual(mockInsights);
    });

    it("должен получать анализ когорт", async () => {
      const mockCohorts = [
        {
          cohortId: "ege_students",
          cohortType: "goal",
          cohortValue: "ege",
          users: ["user-1", "user-2"],
          metrics: {
            size: 2,
            retentionRate: 0.9,
            averageEngagement: 0.8,
            completionRate: 0.7,
            averageScore: 75,
            churnRate: 0.1,
          },
          trends: [],
        },
      ];

      mockEnhancedAnalytics.analyzeCohorts.mockResolvedValue(mockCohorts);

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      const cohorts = await result.current[1].getCohortAnalyses();
      expect(cohorts).toEqual(mockCohorts);
    });
  });

  describe("Интеграционные действия", () => {
    it("должен запускать сессию изучения", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current[1].startStudySession({
          topicId: "topic-1",
          availableTime: 30,
        });
      });

      expect(mockAdvancedAnalytics.startStudySession).toHaveBeenCalledWith(
        userId,
        "topic-1"
      );
      expect(result.current[0].recommendationContext).toEqual({
        topicId: "topic-1",
        availableTime: 30,
      });
    });

    it("должен завершать сессию изучения", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current[1].endStudySession({
          duration: 1800000, // 30 минут
          completionRate: 0.8,
          engagementScore: 0.7,
          satisfactionScore: 0.9,
        });
      });

      expect(mockAdvancedAnalytics.endStudySession).toHaveBeenCalledWith(
        userId,
        {
          duration: 1800000,
          completionRate: 0.8,
          engagementScore: 0.7,
          satisfactionScore: 0.9,
        }
      );
    });

    it("должен записывать взаимодействия", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current[1].recordInteraction({
          type: "topic_view",
          topicId: "topic-1",
          duration: 120000,
          value: 1,
        });
      });

      expect(mockAdvancedAnalytics.addInteraction).toHaveBeenCalledWith(
        userId,
        {
          type: "topic_view",
          topicId: "topic-1",
          duration: 120000,
          value: 1,
        }
      );
    });

    it("должен обновлять все данные", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      await act(async () => {
        await result.current[1].refreshAll();
      });

      expect(mockAbTesting.getActiveTests).toHaveBeenCalled();
      expect(mockRecommendationEngine.getRecommendations).toHaveBeenCalled();
      expect(mockEnhancedAnalytics.analyzeUserBehavior).toHaveBeenCalled();
      expect(
        mockEnhancedAnalytics.generatePredictiveInsights
      ).toHaveBeenCalled();
      expect(mockEnhancedAnalytics.analyzeCohorts).toHaveBeenCalled();
    });
  });

  describe("Автообновление", () => {
    it("должен автоматически обновлять данные", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId, {
          autoRefresh: true,
          refreshInterval: 100, // Короткий интервал для теста
        })
      );

      await waitForNextUpdate();

      // Очищаем вызовы инициализации
      jest.clearAllMocks();

      // Ждем автообновления
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150));
      });

      expect(mockRecommendationEngine.getRecommendations).toHaveBeenCalled();
      expect(mockEnhancedAnalytics.analyzeUserBehavior).toHaveBeenCalled();
    });

    it("должен отключать автообновление", async () => {
      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId, {
          autoRefresh: false,
        })
      );

      await waitForNextUpdate();

      // Очищаем вызовы инициализации
      jest.clearAllMocks();

      // Ждем достаточно времени для автообновления
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(
        mockRecommendationEngine.getRecommendations
      ).not.toHaveBeenCalled();
      expect(mockEnhancedAnalytics.analyzeUserBehavior).not.toHaveBeenCalled();
    });
  });

  describe("Обработка ошибок", () => {
    it("должен обрабатывать ошибки A/B тестирования", async () => {
      mockAbTesting.getVariant.mockRejectedValue(new Error("Variant error"));

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      const variant = await result.current[1].getVariant("test-1");
      expect(variant).toBeNull();
    });

    it("должен обрабатывать ошибки ML рекомендаций", async () => {
      mockRecommendationEngine.getRecommendations.mockRejectedValue(
        new Error("Recommendation error")
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      const recommendations = await result.current[1].getRecommendations();
      expect(recommendations).toEqual([]);
    });

    it("должен обрабатывать ошибки аналитики", async () => {
      mockEnhancedAnalytics.analyzeUserBehavior.mockRejectedValue(
        new Error("Analytics error")
      );

      const { result, waitForNextUpdate } = renderHook(() =>
        useEnhancedPersonalization(userId)
      );

      await waitForNextUpdate();

      await expect(result.current[1].analyzeBehavior()).rejects.toThrow(
        "Analytics error"
      );
    });
  });
});
