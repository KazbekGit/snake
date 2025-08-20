import AsyncStorage from "@react-native-async-storage/async-storage";
import { contentCache } from "../contentCache";
import { TopicContent } from "../../content/schema";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockTopic: TopicContent = {
  id: "test-topic",
  sectionId: "test-section",
  title: "Test Topic",
  description: "Test description",
  coverImage: "https://example.com/image.jpg",
  contentBlocks: [],
  quiz: { questions: [] },
};

describe("ContentCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  describe("cacheTopic", () => {
    it("should cache a topic successfully", async () => {
      await contentCache.cacheTopic(mockTopic);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        "cached_topics",
        expect.stringContaining("test-topic")
      );
    });

    it("should handle caching errors gracefully", async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      await expect(contentCache.cacheTopic(mockTopic)).resolves.not.toThrow();
    });
  });

  describe("getCachedTopic", () => {
    it("should return null for non-existent topic", async () => {
      const result = await contentCache.getCachedTopic("non-existent");
      expect(result).toBeNull();
    });

    it("should return cached topic if valid", async () => {
      const cachedData = {
        "test-topic": {
          topic: mockTopic,
          timestamp: Date.now(),
          version: "1.0.0",
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData)
      );

      const result = await contentCache.getCachedTopic("test-topic");
      expect(result).toEqual(mockTopic);
    });

    it("should return null for expired topic", async () => {
      const cachedData = {
        "test-topic": {
          topic: mockTopic,
          timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // 8 days ago
          version: "1.0.0",
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData)
      );

      const result = await contentCache.getCachedTopic("test-topic");
      expect(result).toBeNull();
    });

    it("should return null for outdated version", async () => {
      const cachedData = {
        "test-topic": {
          topic: mockTopic,
          timestamp: Date.now(),
          version: "0.9.0", // Old version
        },
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cachedData)
      );

      const result = await contentCache.getCachedTopic("test-topic");
      expect(result).toBeNull();
    });
  });

  describe("getCacheStats", () => {
    it("should return correct cache statistics", async () => {
      const cachedTopics = {
        topic1: { topic: mockTopic, timestamp: Date.now(), version: "1.0.0" },
        topic2: { topic: mockTopic, timestamp: Date.now(), version: "1.0.0" },
      };

      const cachedImages = {
        image1: {
          url: "url1",
          localPath: "path1",
          timestamp: Date.now(),
          size: 1024,
        },
        image2: {
          url: "url2",
          localPath: "path2",
          timestamp: Date.now(),
          size: 2048,
        },
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(cachedTopics))
        .mockResolvedValueOnce(JSON.stringify(cachedImages))
        .mockResolvedValueOnce("1234567890");

      const stats = await contentCache.getCacheStats();

      expect(stats.topicsCount).toBe(2);
      expect(stats.imagesCount).toBe(2);
      expect(stats.totalSize).toBe(3072);
      expect(stats.version).toBe("1.0.0");
    });

    it("should handle errors and return default stats", async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(
        new Error("Storage error")
      );

      const stats = await contentCache.getCacheStats();

      expect(stats.topicsCount).toBe(0);
      expect(stats.imagesCount).toBe(0);
      expect(stats.totalSize).toBe(0);
      expect(stats.version).toBe("1.0.0");
    });
  });

  describe("clearCache", () => {
    it("should clear all cache data", async () => {
      await contentCache.clearCache();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("cached_topics");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith("cached_images");
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        "last_sync_timestamp"
      );
    });
  });

  describe("cleanupExpiredCache", () => {
    it("should remove expired topics and images", async () => {
      const cachedTopics = {
        "expired-topic": {
          topic: mockTopic,
          timestamp: Date.now() - 8 * 24 * 60 * 60 * 1000, // Expired
          version: "1.0.0",
        },
        "valid-topic": {
          topic: mockTopic,
          timestamp: Date.now(),
          version: "1.0.0",
        },
      };

      const cachedImages = {
        "expired-image": {
          url: "expired",
          localPath: "path",
          timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000, // Expired
          size: 1024,
        },
        "valid-image": {
          url: "valid",
          localPath: "path",
          timestamp: Date.now(),
          size: 1024,
        },
      };

      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(cachedTopics))
        .mockResolvedValueOnce(JSON.stringify(cachedImages));

      await contentCache.cleanupExpiredCache();

      // Should call setItem to update the cache after cleanup
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });
});

