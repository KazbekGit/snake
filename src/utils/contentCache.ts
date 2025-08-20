import AsyncStorage from "@react-native-async-storage/async-storage";
import { TopicContent } from "../content/schema";

const CACHE_KEYS = {
  TOPICS: "cached_topics",
  IMAGES: "cached_images",
  LAST_SYNC: "last_sync_timestamp",
  CACHE_VERSION: "cache_version",
} as const;

const CACHE_VERSION = "1.0.0";
const CACHE_EXPIRY_DAYS = 7; // Кэш истекает через 7 дней

export interface CachedTopic {
  topic: TopicContent;
  timestamp: number;
  version: string;
}

export interface CachedImage {
  url: string;
  localPath: string;
  timestamp: number;
  size: number;
}

export interface CacheStats {
  topicsCount: number;
  imagesCount: number;
  totalSize: number;
  lastSync: number;
  version: string;
}

class ContentCache {
  private static instance: ContentCache;

  private constructor() {}

  static getInstance(): ContentCache {
    if (!ContentCache.instance) {
      ContentCache.instance = new ContentCache();
    }
    return ContentCache.instance;
  }

  // Кэширование тем
  async cacheTopic(topic: TopicContent): Promise<void> {
    try {
      const cachedTopics = await this.getCachedTopics();
      const cachedTopic: CachedTopic = {
        topic,
        timestamp: Date.now(),
        version: CACHE_VERSION,
      };

      cachedTopics[topic.id] = cachedTopic;
      await AsyncStorage.setItem(
        CACHE_KEYS.TOPICS,
        JSON.stringify(cachedTopics)
      );

      console.log(`Topic cached: ${topic.id}`);
    } catch (error) {
      console.error("Failed to cache topic:", error);
    }
  }

  async getCachedTopic(topicId: string): Promise<TopicContent | null> {
    try {
      const cachedTopics = await this.getCachedTopics();
      const cached = cachedTopics[topicId];

      if (!cached) {
        return null;
      }

      // Проверяем версию кэша
      if (cached.version !== CACHE_VERSION) {
        console.log(
          `Cache version mismatch for topic ${topicId}, removing from cache`
        );
        await this.removeCachedTopic(topicId);
        return null;
      }

      // Проверяем срок действия кэша
      const isExpired =
        Date.now() - cached.timestamp > CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      if (isExpired) {
        console.log(`Cache expired for topic ${topicId}, removing from cache`);
        await this.removeCachedTopic(topicId);
        return null;
      }

      return cached.topic;
    } catch (error) {
      console.error("Failed to get cached topic:", error);
      return null;
    }
  }

  async getCachedTopics(): Promise<Record<string, CachedTopic>> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.TOPICS);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error("Failed to get cached topics:", error);
      return {};
    }
  }

  async removeCachedTopic(topicId: string): Promise<void> {
    try {
      const cachedTopics = await this.getCachedTopics();
      delete cachedTopics[topicId];
      await AsyncStorage.setItem(
        CACHE_KEYS.TOPICS,
        JSON.stringify(cachedTopics)
      );
    } catch (error) {
      console.error("Failed to remove cached topic:", error);
    }
  }

  // Кэширование изображений
  async cacheImage(
    url: string,
    localPath: string,
    size: number
  ): Promise<void> {
    try {
      const cachedImages = await this.getCachedImages();
      const cachedImage: CachedImage = {
        url,
        localPath,
        timestamp: Date.now(),
        size,
      };

      cachedImages[url] = cachedImage;
      await AsyncStorage.setItem(
        CACHE_KEYS.IMAGES,
        JSON.stringify(cachedImages)
      );

      console.log(`Image cached: ${url}`);
    } catch (error) {
      console.error("Failed to cache image:", error);
    }
  }

  async getCachedImage(url: string): Promise<string | null> {
    try {
      const cachedImages = await this.getCachedImages();
      const cached = cachedImages[url];

      if (!cached) {
        return null;
      }

      // Проверяем срок действия кэша изображений (30 дней)
      const imageCacheExpiry = 30 * 24 * 60 * 60 * 1000;
      const isExpired = Date.now() - cached.timestamp > imageCacheExpiry;

      if (isExpired) {
        console.log(`Image cache expired for ${url}, removing from cache`);
        await this.removeCachedImage(url);
        return null;
      }

      return cached.localPath;
    } catch (error) {
      console.error("Failed to get cached image:", error);
      return null;
    }
  }

  async getCachedImages(): Promise<Record<string, CachedImage>> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEYS.IMAGES);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.error("Failed to get cached images:", error);
      return {};
    }
  }

  async removeCachedImage(url: string): Promise<void> {
    try {
      const cachedImages = await this.getCachedImages();
      delete cachedImages[url];
      await AsyncStorage.setItem(
        CACHE_KEYS.IMAGES,
        JSON.stringify(cachedImages)
      );
    } catch (error) {
      console.error("Failed to remove cached image:", error);
    }
  }

  // Управление синхронизацией
  async setLastSyncTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
    } catch (error) {
      console.error("Failed to set last sync timestamp:", error);
    }
  }

  async getLastSyncTimestamp(): Promise<number> {
    try {
      const timestamp = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (error) {
      console.error("Failed to get last sync timestamp:", error);
      return 0;
    }
  }

  // Статистика кэша
  async getCacheStats(): Promise<CacheStats> {
    try {
      const [cachedTopics, cachedImages, lastSync] = await Promise.all([
        this.getCachedTopics(),
        this.getCachedImages(),
        this.getLastSyncTimestamp(),
      ]);

      const totalSize = Object.values(cachedImages).reduce(
        (sum, img) => sum + img.size,
        0
      );

      return {
        topicsCount: Object.keys(cachedTopics).length,
        imagesCount: Object.keys(cachedImages).length,
        totalSize,
        lastSync,
        version: CACHE_VERSION,
      };
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      return {
        topicsCount: 0,
        imagesCount: 0,
        totalSize: 0,
        lastSync: 0,
        version: CACHE_VERSION,
      };
    }
  }

  // Очистка кэша
  async clearCache(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(CACHE_KEYS.TOPICS),
        AsyncStorage.removeItem(CACHE_KEYS.IMAGES),
        AsyncStorage.removeItem(CACHE_KEYS.LAST_SYNC),
      ]);
      console.log("Cache cleared successfully");
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  }

  // Очистка устаревших данных
  async cleanupExpiredCache(): Promise<void> {
    try {
      const [cachedTopics, cachedImages] = await Promise.all([
        this.getCachedTopics(),
        this.getCachedImages(),
      ]);

      const now = Date.now();
      const topicExpiry = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
      const imageExpiry = 30 * 24 * 60 * 60 * 1000;

      // Очистка устаревших тем
      for (const [topicId, cached] of Object.entries(cachedTopics)) {
        if (
          now - cached.timestamp > topicExpiry ||
          cached.version !== CACHE_VERSION
        ) {
          await this.removeCachedTopic(topicId);
        }
      }

      // Очистка устаревших изображений
      for (const [url, cached] of Object.entries(cachedImages)) {
        if (now - cached.timestamp > imageExpiry) {
          await this.removeCachedImage(url);
        }
      }

      console.log("Expired cache cleaned up");
    } catch (error) {
      console.error("Failed to cleanup expired cache:", error);
    }
  }
}

export const contentCache = ContentCache.getInstance();

