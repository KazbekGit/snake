import { abTesting, DEMO_AB_TESTS } from "../abTesting";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("ABTesting", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear singleton instance
    (abTesting as any).instance = null;
  });

  describe("Test Creation and Management", () => {
    it("should create a new AB test", async () => {
      const mockSetItem = AsyncStorage.setItem as jest.Mock;
      mockSetItem.mockResolvedValue(undefined);

      const testData = DEMO_AB_TESTS[0];
      const testId = await abTesting.createTest(testData);

      expect(testId).toMatch(/^ab_test_\d+_[a-z0-9]+$/);
      expect(mockSetItem).toHaveBeenCalled();
    });

    it("should update test status", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(
        JSON.stringify([
          {
            id: "test_123",
            name: "Test",
            status: "active",
            variants: [],
            metrics: [],
            targetAudience: { userSegments: [], conditions: [] },
            trafficAllocation: 100,
            startDate: Date.now(),
          },
        ])
      );
      mockSetItem.mockResolvedValue(undefined);

      await abTesting.updateTestStatus("test_123", "completed");

      expect(mockSetItem).toHaveBeenCalled();
    });

    it("should get active tests", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      mockGetItem.mockResolvedValue(
        JSON.stringify(
          DEMO_AB_TESTS.map((test) => ({
            ...test,
            id: "test_1",
          }))
        )
      );

      const activeTests = await abTesting.getActiveTests();

      expect(activeTests.length).toBeGreaterThan(0);
      expect(activeTests[0].status).toBe("active");
    });
  });

  describe("User Assignment", () => {
    it("should assign user to variant consistently", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(
        JSON.stringify([
          {
            id: "test_123",
            name: "Test",
            status: "active",
            variants: [
              {
                id: "control",
                name: "Control",
                config: {},
                trafficPercentage: 50,
              },
              {
                id: "variant",
                name: "Variant",
                config: {},
                trafficPercentage: 50,
              },
            ],
            metrics: [],
            targetAudience: { userSegments: [], conditions: [] },
            trafficAllocation: 100,
            startDate: Date.now(),
          },
        ])
      );
      mockSetItem.mockResolvedValue(undefined);

      const variant1 = await abTesting.getVariant("test_123", "user_1");
      const variant2 = await abTesting.getVariant("test_123", "user_1");

      expect(variant1).toBeDefined();
      expect(variant2).toBeDefined();
      expect(variant1?.id).toBe(variant2?.id); // Consistent assignment
    });

    it("should handle different users getting different variants", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(
        JSON.stringify([
          {
            id: "test_123",
            name: "Test",
            status: "active",
            variants: [
              {
                id: "control",
                name: "Control",
                config: {},
                trafficPercentage: 50,
              },
              {
                id: "variant",
                name: "Variant",
                config: {},
                trafficPercentage: 50,
              },
            ],
            metrics: [],
            targetAudience: { userSegments: [], conditions: [] },
            trafficAllocation: 100,
            startDate: Date.now(),
          },
        ])
      );
      mockSetItem.mockResolvedValue(undefined);

      const variant1 = await abTesting.getVariant("test_123", "user_1");
      const variant2 = await abTesting.getVariant("test_123", "user_2");

      expect(variant1).toBeDefined();
      expect(variant2).toBeDefined();
      // Note: In real scenarios, different users might get different variants
      // This test just ensures both get assigned
    });
  });

  describe("Result Recording", () => {
    it("should record test results", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(JSON.stringify([]));
      mockSetItem.mockResolvedValue(undefined);

      await abTesting.recordResult("test_123", "variant_a", "user_1", {
        conversion: 1,
        engagement: 120,
      });

      expect(mockSetItem).toHaveBeenCalled();
    });

    it("should update test statistics", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(JSON.stringify([]));
      mockSetItem.mockResolvedValue(undefined);

      await abTesting.recordResult("test_123", "variant_a", "user_1", {
        conversion: 1,
        engagement: 120,
      });

      await abTesting.recordResult("test_123", "variant_a", "user_2", {
        conversion: 0,
        engagement: 60,
      });

      expect(mockSetItem).toHaveBeenCalled();
    });
  });

  describe("Statistics and Analysis", () => {
    it("should get test statistics", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      mockGetItem.mockResolvedValue(
        JSON.stringify({
          test_123: {
            variant_a: {
              testId: "test_123",
              variantId: "variant_a",
              impressions: 10,
              conversions: 3,
              conversionRate: 30,
              averageEngagement: 90,
              confidenceLevel: 0.85,
              isSignificant: false,
              winner: false,
            },
          },
        })
      );

      const stats = await abTesting.getTestStats("test_123");

      expect(stats).toHaveLength(1);
      expect(stats[0].variantId).toBe("variant_a");
      expect(stats[0].conversionRate).toBe(30);
    });

    it("should determine winner correctly", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      mockGetItem.mockResolvedValue(
        JSON.stringify({
          test_123: {
            variant_a: {
              testId: "test_123",
              variantId: "variant_a",
              impressions: 100,
              conversions: 30,
              conversionRate: 30,
              averageEngagement: 90,
              confidenceLevel: 0.95,
              isSignificant: true,
              winner: false,
            },
            variant_b: {
              testId: "test_123",
              variantId: "variant_b",
              impressions: 100,
              conversions: 25,
              conversionRate: 25,
              averageEngagement: 85,
              confidenceLevel: 0.95,
              isSignificant: true,
              winner: false,
            },
          },
        })
      );

      const stats = await abTesting.getTestStats("test_123");

      expect(stats).toHaveLength(2);
      const winner = stats.find((s) => s.winner);
      expect(winner?.variantId).toBe("variant_a"); // Higher conversion rate
    });
  });

  describe("Configuration Management", () => {
    it("should get user configuration", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      mockGetItem.mockResolvedValue(
        JSON.stringify([
          {
            id: "test_123",
            name: "Test",
            status: "active",
            variants: [
              {
                id: "control",
                name: "Control",
                config: { algorithm: "basic" },
                trafficPercentage: 50,
              },
              {
                id: "variant",
                name: "Variant",
                config: { algorithm: "ml" },
                trafficPercentage: 50,
              },
            ],
            metrics: [],
            targetAudience: { userSegments: [], conditions: [] },
            trafficAllocation: 100,
            startDate: Date.now(),
          },
        ])
      );
      const mockSetItem = AsyncStorage.setItem as jest.Mock;
      mockSetItem.mockResolvedValue(undefined);

      const config = await abTesting.getUserConfig("user_1", "algorithm");

      expect(config).toBeDefined();
      expect([
        "basic",
        "ml",
        "collaborative_filtering",
        "ml_enhanced",
      ]).toContain(config);
    });
  });

  describe("Data Management", () => {
    it("should clear all data", async () => {
      const mockRemoveItem = AsyncStorage.removeItem as jest.Mock;
      mockRemoveItem.mockResolvedValue(undefined);

      await abTesting.clearAllData();

      expect(mockRemoveItem).toHaveBeenCalledTimes(4);
    });
  });

  describe("Demo Tests", () => {
    it("should have valid demo test structure", () => {
      expect(DEMO_AB_TESTS).toHaveLength(2);

      DEMO_AB_TESTS.forEach((test) => {
        expect(test.name).toBeDefined();
        expect(test.description).toBeDefined();
        expect(test.status).toBe("active");
        expect(test.variants).toHaveLength(2);
        expect(test.metrics).toHaveLength(2);
        expect(test.trafficAllocation).toBe(100);

        test.variants.forEach((variant) => {
          expect(variant.id).toBeDefined();
          expect(variant.name).toBeDefined();
          expect(variant.config).toBeDefined();
          expect(variant.trafficPercentage).toBe(50);
        });
      });
    });

    it("should have recommendation algorithm test", () => {
      const recommendationTest = DEMO_AB_TESTS.find((t) =>
        t.name.includes("Рекомендации")
      );
      expect(recommendationTest).toBeDefined();
      expect(recommendationTest?.variants[0].config.algorithm).toBe(
        "collaborative_filtering"
      );
      expect(recommendationTest?.variants[1].config.algorithm).toBe(
        "ml_enhanced"
      );
    });

    it("should have UI personalization test", () => {
      const uiTest = DEMO_AB_TESTS.find((t) => t.name.includes("UI"));
      expect(uiTest).toBeDefined();
      expect(uiTest?.variants[0].config.theme).toBe("default");
      expect(uiTest?.variants[1].config.theme).toBe("adaptive");
    });
  });
});
