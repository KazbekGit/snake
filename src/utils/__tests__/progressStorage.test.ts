import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getUserProgress,
  saveUserProgress,
  updateTopicProgress,
  markBlockCompleted,
  saveTestResult,
  getTopicProgress,
  addStudyTime,
  clearUserData,
  getStudyStatistics,
  generateUserId,
  getUserId,
  resetTopicProgress,
} from "../progressStorage";

// Мокаем AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  multiRemove: jest.fn(),
}));

describe("Progress Storage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Очищаем AsyncStorage перед каждым тестом
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe("generateUserId", () => {
    it("should generate unique user IDs", () => {
      const id1 = generateUserId();
      const id2 = generateUserId();

      expect(id1).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(id2).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(id1).not.toBe(id2);
    });
  });

  describe("getUserId", () => {
    it("should return existing user ID if stored", async () => {
      const existingUserId = "user_1234567890_abc123";
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(existingUserId);

      const result = await getUserId();

      expect(result).toBe(existingUserId);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith("user_id");
    });

    it("should create and store new user ID if none exists", async () => {
      const newUserId = "user_1234567890_abc123";
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getUserId();

      expect(result).toMatch(/^user_\d+_[a-z0-9]+$/);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith("user_id", result);
    });
  });

  describe("getUserProgress", () => {
    it("should return existing progress if stored", async () => {
      const existingProgress = {
        userId: "user_123",
        topics: {},
        lastActivity: "2023-01-01T00:00:00.000Z",
        totalStudyTime: 120,
        completedTopics: [],
        testScores: {},
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(existingProgress)
      );

      const result = await getUserProgress();

      expect(result).toEqual(existingProgress);
    });

    it("should create new progress if none exists", async () => {
      const result = await getUserProgress();

      expect(result).toHaveProperty("userId");
      expect(result).toHaveProperty("topics");
      expect(result).toHaveProperty("lastActivity");
      expect(result).toHaveProperty("totalStudyTime");
      expect(result).toHaveProperty("completedTopics");
      expect(result).toHaveProperty("testScores");
      expect(result.topics).toEqual({});
      expect(result.totalStudyTime).toBe(0);
      expect(result.completedTopics).toEqual([]);
      expect(result.testScores).toEqual({});
    });
  });

  describe("updateTopicProgress", () => {
    it("should update topic progress correctly", async () => {
      const topicId = "topic_123";
      const updates = {
        completedBlocks: 2,
        totalBlocks: 5,
        lastBlockIndex: 1,
      };

      await updateTopicProgress(topicId, updates);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("markBlockCompleted", () => {
    it("should mark block as completed", async () => {
      const topicId = "topic_123";
      const blockIndex = 2;
      const totalBlocks = 5;

      await markBlockCompleted(topicId, blockIndex, totalBlocks);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("saveTestResult", () => {
    it("should save test result correctly", async () => {
      // Сначала создаем прогресс темы
      const topicId = "topic_123";
      await updateTopicProgress(topicId, {
        completedBlocks: 5,
        totalBlocks: 5,
        lastBlockIndex: 4,
      });

      const score = 4;
      const totalQuestions = 5;

      await saveTestResult(topicId, score, totalQuestions);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it("should add topic to completed topics if score >= 70%", async () => {
      const topicId = "topic_123";
      await updateTopicProgress(topicId, {
        completedBlocks: 5,
        totalBlocks: 5,
        lastBlockIndex: 4,
      });

      const score = 4; // 80%
      const totalQuestions = 5;

      await saveTestResult(topicId, score, totalQuestions);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("getTopicProgress", () => {
    it("should return topic progress if exists", async () => {
      const topicId = "topic_123";
      const topicProgress = {
        topicId,
        completedBlocks: 3,
        totalBlocks: 5,
        lastBlockIndex: 2,
        testCompleted: false,
        lastStudied: "2023-01-01T00:00:00.000Z",
        studyTime: 30,
      };

      const userProgress = {
        userId: "user_123",
        topics: { [topicId]: topicProgress },
        lastActivity: "2023-01-01T00:00:00.000Z",
        totalStudyTime: 30,
        completedTopics: [],
        testScores: {},
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(userProgress)
      );

      const result = await getTopicProgress(topicId);

      expect(result).toEqual(topicProgress);
    });

    it("should return null if topic progress does not exist", async () => {
      const topicId = "topic_123";

      const result = await getTopicProgress(topicId);

      expect(result).toBeNull();
    });
  });

  describe("addStudyTime", () => {
    it("should add study time correctly", async () => {
      const topicId = "topic_123";
      await updateTopicProgress(topicId, {
        studyTime: 30,
      });

      const additionalMinutes = 15;

      await addStudyTime(topicId, additionalMinutes);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("getStudyStatistics", () => {
    it("should return correct statistics", async () => {
      const userProgress = {
        userId: "user_123",
        topics: {
          topic_1: {
            topicId: "topic_1",
            completedBlocks: 5,
            totalBlocks: 5,
            lastBlockIndex: 4,
            testCompleted: true,
            testScore: 80,
            lastStudied: "2023-01-01T00:00:00.000Z",
            studyTime: 30,
          },
          topic_2: {
            topicId: "topic_2",
            completedBlocks: 3,
            totalBlocks: 5,
            lastBlockIndex: 2,
            testCompleted: true,
            testScore: 90,
            lastStudied: "2023-01-01T00:00:00.000Z",
            studyTime: 45,
          },
        },
        lastActivity: "2023-01-01T00:00:00.000Z",
        totalStudyTime: 75,
        completedTopics: ["topic_1", "topic_2"],
        testScores: { topic_1: 80, topic_2: 90 },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(userProgress)
      );

      const result = await getStudyStatistics();

      expect(result.totalTopics).toBe(2);
      expect(result.completedTopics).toBe(2);
      expect(result.totalStudyTime).toBe(75);
      expect(result.averageScore).toBe(85);
      expect(result.lastActivity).toBe("2023-01-01T00:00:00.000Z");
    });

    it("should return default statistics if no progress exists", async () => {
      const result = await getStudyStatistics();

      expect(result.totalTopics).toBe(0);
      expect(result.completedTopics).toBe(0);
      expect(result.totalStudyTime).toBe(0);
      expect(result.averageScore).toBe(0);
      expect(result.lastActivity).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      );
    });
  });

  describe("clearUserData", () => {
    it("should clear all user data", async () => {
      await clearUserData();

      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "user_progress",
        "user_id",
        "user_settings",
      ]);
    });
  });

  describe("resetTopicProgress", () => {
    it("should remove topic progress, score and completed flag", async () => {
      const { resetTopicProgress, updateTopicProgress, saveTestResult } =
        await jest.requireActual("../progressStorage");

      // Сформируем прогресс
      await updateTopicProgress("money", {
        completedBlocks: 2,
        totalBlocks: 4,
        lastBlockIndex: 1,
      });
      await saveTestResult("money", 4, 5);

      // Сохраним фиктивное состояние в AsyncStorage
      const stored = await getUserProgress();
      await saveUserProgress(stored);

      // Сбросим прогресс
      await resetTopicProgress("money");

      const after = await getUserProgress();
      expect(after.topics["money"]).toBeUndefined();
      expect(after.completedTopics.includes("money")).toBe(false);
      expect(after.testScores["money"]).toBeUndefined();
    });
  });
});
