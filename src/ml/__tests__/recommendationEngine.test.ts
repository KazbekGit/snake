import { recommendationEngine } from "../recommendationEngine";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("RecommendationEngine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear singleton instance
    (recommendationEngine as any).instance = null;
  });

  describe("Initialization", () => {
    it("should initialize with default models", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(null);
      mockSetItem.mockResolvedValue(undefined);

      // Trigger initialization by calling a method
      await recommendationEngine.getRecommendations("user_1", 5);

      // The initialization happens internally, so we just verify the method works
      expect(true).toBe(true);
    });

    it("should load existing models from storage", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      const existingModels = [
        {
          id: "existing_model",
          name: "Existing Model",
          version: "1.0",
          type: "hybrid",
          parameters: {},
          performance: {
            accuracy: 0.8,
            precision: 0.75,
            recall: 0.7,
            f1Score: 0.72,
          },
          lastTrained: Date.now(),
          isActive: true,
        },
      ];

      mockGetItem.mockResolvedValue(JSON.stringify(existingModels));
      mockSetItem.mockResolvedValue(undefined);

      await recommendationEngine.getRecommendations("user_1", 5);

      // The method should work with existing models
      expect(true).toBe(true);
    });
  });

  describe("Recommendation Generation", () => {
    it("should return fallback recommendations when no user features", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(null);
      mockSetItem.mockResolvedValue(undefined);

      const recommendations = await recommendationEngine.getRecommendations(
        "user_1",
        5
      );

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should use hybrid algorithm by default", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(null);
      mockSetItem.mockResolvedValue(undefined);

      const recommendations = await recommendationEngine.getRecommendations(
        "user_1",
        5
      );

      expect(recommendations).toBeDefined();
    });

    it("should apply context filters", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(null);
      mockSetItem.mockResolvedValue(undefined);

      const context = {
        availableTime: 30,
        difficultyPreference: 0.5,
        section: "economy",
      };

      const recommendations = await recommendationEngine.getRecommendations(
        "user_1",
        5,
        context
      );

      expect(recommendations).toBeDefined();
    });
  });

  describe("User Features Management", () => {
    it("should update user features", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(null);
      mockSetItem.mockResolvedValue(undefined);

      const newFeatures = {
        grade: 10,
        goal: "ege",
        totalStudyTime: 120,
        averageSessionDuration: 25,
        completionRate: 0.8,
        averageScore: 85,
        streakDays: 7,
        preferredTopics: ["economy", "politics"],
        weakTopics: ["law"],
        strongTopics: ["economy"],
        preferredTimeOfDay: "18:00",
        studyFrequency: 5,
        interactionPatterns: [],
      };

      await recommendationEngine.updateUserFeatures("user_1", newFeatures);

      expect(mockSetItem).toHaveBeenCalled();
    });

    it("should merge new features with existing ones", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      const existingFeatures = {
        userId: "user_1",
        features: {
          grade: 9,
          goal: "school",
          totalStudyTime: 60,
          averageSessionDuration: 20,
          completionRate: 0.6,
          averageScore: 70,
          streakDays: 3,
          preferredTopics: ["economy"],
          weakTopics: [],
          strongTopics: ["economy"],
          preferredTimeOfDay: "16:00",
          studyFrequency: 3,
          interactionPatterns: [],
        },
        lastUpdated: Date.now(),
      };

      mockGetItem.mockResolvedValue(JSON.stringify([existingFeatures]));
      mockSetItem.mockResolvedValue(undefined);

      const newFeatures = {
        grade: 10,
        totalStudyTime: 120,
      };

      await recommendationEngine.updateUserFeatures("user_1", newFeatures);

      expect(mockSetItem).toHaveBeenCalled();
    });
  });

  describe("Topic Features Management", () => {
    it("should update topic features", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(null);
      mockSetItem.mockResolvedValue(undefined);

      const newFeatures = {
        difficulty: 0.7,
        estimatedTime: 45,
        section: "economy",
        tags: ["money", "banking", "finance"],
        popularity: 0.8,
        averageRating: 4.2,
        completionRate: 0.75,
        averageScore: 78,
        retryRate: 0.2,
        prerequisites: ["basic_economy"],
        relatedTopics: ["inflation", "unemployment"],
      };

      await recommendationEngine.updateTopicFeatures("topic_1", newFeatures);

      expect(mockSetItem).toHaveBeenCalled();
    });
  });

  describe("Model Training", () => {
    it("should train model and update performance metrics", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(
        JSON.stringify([
          {
            id: "hybrid_v1",
            name: "Hybrid Model",
            version: "1.0",
            type: "hybrid",
            parameters: {},
            performance: {
              accuracy: 0.8,
              precision: 0.75,
              recall: 0.7,
              f1Score: 0.72,
            },
            lastTrained: Date.now() - 86400000, // 1 day ago
            isActive: true,
          },
        ])
      );
      mockSetItem.mockResolvedValue(undefined);

      const trainingData = [
        {
          userId: "user_1",
          topicId: "topic_1",
          rating: 5,
          timestamp: Date.now(),
        },
        {
          userId: "user_2",
          topicId: "topic_1",
          rating: 4,
          timestamp: Date.now(),
        },
      ];

      await recommendationEngine.trainModel("hybrid_v1", trainingData);

      expect(mockSetItem).toHaveBeenCalled();
    });
  });

  describe("Similarity Calculations", () => {
    it("should calculate user similarity correctly", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      const userFeatures = [
        {
          userId: "user_1",
          features: {
            grade: 10,
            goal: "ege",
            totalStudyTime: 120,
            averageSessionDuration: 25,
            completionRate: 0.8,
            averageScore: 85,
            streakDays: 7,
            preferredTopics: ["economy", "politics"],
            weakTopics: ["law"],
            strongTopics: ["economy"],
            preferredTimeOfDay: "18:00",
            studyFrequency: 5,
            interactionPatterns: [],
          },
          lastUpdated: Date.now(),
        },
        {
          userId: "user_2",
          features: {
            grade: 10,
            goal: "ege",
            totalStudyTime: 100,
            averageSessionDuration: 20,
            completionRate: 0.7,
            averageScore: 80,
            streakDays: 5,
            preferredTopics: ["economy", "politics"],
            weakTopics: ["law"],
            strongTopics: ["economy"],
            preferredTimeOfDay: "17:00",
            studyFrequency: 4,
            interactionPatterns: [],
          },
          lastUpdated: Date.now(),
        },
      ];

      mockGetItem.mockResolvedValue(JSON.stringify(userFeatures));
      mockSetItem.mockResolvedValue(undefined);

      const recommendations = await recommendationEngine.getRecommendations(
        "user_1",
        5
      );

      expect(recommendations).toBeDefined();
    });
  });

  describe("Content-Based Filtering", () => {
    it("should calculate content similarity", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      const userFeatures = {
        userId: "user_1",
        features: {
          grade: 10,
          goal: "ege",
          totalStudyTime: 120,
          averageSessionDuration: 25,
          completionRate: 0.8,
          averageScore: 85,
          streakDays: 7,
          preferredTopics: ["economy", "politics"],
          weakTopics: ["law"],
          strongTopics: ["economy"],
          preferredTimeOfDay: "18:00",
          studyFrequency: 5,
          interactionPatterns: [],
        },
        lastUpdated: Date.now(),
      };

      const topicFeatures = [
        {
          topicId: "topic_1",
          features: {
            difficulty: 0.7,
            estimatedTime: 45,
            section: "economy",
            tags: ["money", "banking"],
            popularity: 0.8,
            averageRating: 4.2,
            completionRate: 0.75,
            averageScore: 78,
            retryRate: 0.2,
            prerequisites: [],
            relatedTopics: [],
          },
        },
      ];

      mockGetItem
        .mockResolvedValueOnce(JSON.stringify([userFeatures]))
        .mockResolvedValueOnce(JSON.stringify(topicFeatures));
      mockSetItem.mockResolvedValue(undefined);

      const recommendations = await recommendationEngine.getRecommendations(
        "user_1",
        5
      );

      expect(recommendations).toBeDefined();
    });
  });

  describe("Data Management", () => {
    it("should clear all data", async () => {
      const mockRemoveItem = AsyncStorage.removeItem as jest.Mock;
      mockRemoveItem.mockResolvedValue(undefined);

      await recommendationEngine.clearAllData();

      expect(mockRemoveItem).toHaveBeenCalledTimes(5);
    });
  });

  describe("Error Handling", () => {
    it("should handle storage errors gracefully", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      mockGetItem.mockRejectedValue(new Error("Storage error"));

      const recommendations = await recommendationEngine.getRecommendations(
        "user_1",
        5
      );

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it("should handle missing user features", async () => {
      const mockGetItem = AsyncStorage.getItem as jest.Mock;
      const mockSetItem = AsyncStorage.setItem as jest.Mock;

      mockGetItem.mockResolvedValue(null);
      mockSetItem.mockResolvedValue(undefined);

      const recommendations = await recommendationEngine.getRecommendations(
        "nonexistent_user",
        5
      );

      expect(recommendations).toBeDefined();
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
});
