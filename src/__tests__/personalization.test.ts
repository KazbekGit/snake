import { abTesting } from "../analytics/abTesting";
import { recommendationEngine } from "../ml/recommendationEngine";
import { enhancedAnalytics } from "../analytics/enhancedAnalytics";
import { useEnhancedPersonalization } from "../hooks/useEnhancedPersonalization";

// Mock AsyncStorage
const mockStorage: Record<string, string> = {};

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
    return Promise.resolve();
  }),
}));

describe("Personalization Engine Integration", () => {
  const testUserId = "test-user-123";
  const testTopicId = "test-topic-456";

  beforeEach(async () => {
    // Clear all data before each test
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
    await Promise.all([
      abTesting.clearAllData(),
      recommendationEngine.clearAllData(),
      enhancedAnalytics.clearAllData(),
    ]);
  });

  describe("A/B Testing", () => {
    it("should create and manage A/B tests", async () => {
      const testId = await abTesting.createTest({
        name: "Test Algorithm",
        description: "Testing recommendation algorithms",
        status: "active",
        startDate: Date.now(),
        variants: [
          {
            id: "control",
            name: "Control",
            description: "Current algorithm",
            config: { algorithm: "basic" },
            trafficPercentage: 50,
          },
          {
            id: "experimental",
            name: "Experimental",
            description: "New algorithm",
            config: { algorithm: "advanced" },
            trafficPercentage: 50,
          },
        ],
        metrics: [
          {
            name: "completion_rate",
            type: "conversion",
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

      expect(testId).toBeDefined();

      const variant = await abTesting.getVariant(testId, testUserId);
      expect(variant).toBeDefined();
      expect(["control", "experimental"]).toContain(variant?.id);

      await abTesting.recordResult(testId, variant!.id, testUserId, {
        conversion: 1,
        engagement: 0.8,
      });

      const stats = await abTesting.getTestStats(testId);
      expect(stats.length).toBeGreaterThan(0);
    });
  });

  describe("ML Recommendations", () => {
    it("should generate recommendations", async () => {
      // Update user features
      await recommendationEngine.updateUserFeatures(testUserId, {
        preferredTopics: ["mathematics", "physics"],
        averageScore: 85,
        studyFrequency: 2.5,
      });

      // Update topic features
      await recommendationEngine.updateTopicFeatures(testTopicId, {
        difficulty: 0.7,
        popularity: 0.8,
        tags: ["mathematics"],
      });

      const recommendations = await recommendationEngine.getRecommendations(
        testUserId,
        5
      );

      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty("topicId");
      expect(recommendations[0]).toHaveProperty("score");
      expect(recommendations[0]).toHaveProperty("factors");
    });
  });

  describe("Enhanced Analytics", () => {
    it("should analyze user behavior", async () => {
      const behaviorProfile = await enhancedAnalytics.analyzeUserBehavior(
        testUserId
      );

      expect(behaviorProfile).toBeDefined();
      expect(behaviorProfile.userId).toBe(testUserId);
      expect(behaviorProfile.engagementMetrics).toBeDefined();
      expect(behaviorProfile.learningPatterns).toBeDefined();
    });

    it("should generate predictive insights", async () => {
      const insights = await enhancedAnalytics.generatePredictiveInsights(
        testUserId
      );

      expect(insights).toBeDefined();
      expect(insights.userId).toBe(testUserId);
      expect(insights.predictions).toBeDefined();
      expect(insights.recommendations).toBeDefined();
    });

    it("should analyze cohorts", async () => {
      const cohorts = await enhancedAnalytics.analyzeCohorts();

      expect(Array.isArray(cohorts)).toBe(true);
      expect(cohorts.length).toBeGreaterThan(0);
    });
  });

  describe("Integration Hook", () => {
    it("should initialize correctly", async () => {
      // This is a basic test - in a real scenario you'd use React Testing Library
      // to test the hook properly
      expect(useEnhancedPersonalization).toBeDefined();
    });
  });

  describe("End-to-End Workflow", () => {
    it("should handle complete user journey", async () => {
      // 1. Create A/B test
      const testId = await abTesting.createTest({
        name: "End-to-End Test",
        description: "Testing complete workflow",
        status: "active",
        startDate: Date.now(),
        variants: [
          {
            id: "control",
            name: "Control",
            description: "Control variant",
            config: { feature: "basic" },
            trafficPercentage: 100,
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

      // 2. Get user variant
      const variant = await abTesting.getVariant(testId, testUserId);
      expect(variant).toBeDefined();

      // 3. Update user features
      await recommendationEngine.updateUserFeatures(testUserId, {
        preferredTopics: ["test-topic"],
        averageScore: 90,
      });

      // 4. Get recommendations
      const recommendations = await recommendationEngine.getRecommendations(
        testUserId,
        3
      );
      expect(recommendations.length).toBeGreaterThan(0);

      // 5. Analyze behavior
      const behaviorProfile = await enhancedAnalytics.analyzeUserBehavior(
        testUserId
      );
      expect(behaviorProfile).toBeDefined();

      // 6. Record test results
      await abTesting.recordResult(testId, variant!.id, testUserId, {
        conversion: 1,
        engagement: 0.8,
      });

      // 7. Get test stats
      const stats = await abTesting.getTestStats(testId);
      expect(stats.length).toBeGreaterThan(0);

      // Verify all systems are working together
      expect(testId).toBeDefined();
      expect(variant).toBeDefined();
      expect(recommendations.length).toBeGreaterThan(0);
      expect(behaviorProfile).toBeDefined();
      expect(stats.length).toBeGreaterThan(0);
    });
  });
});
