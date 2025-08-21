import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCachedUri } from "../utils/imageCache";
import type { TopicContent } from "./schema";
import { getTopicFallback } from "./index";

const CONTENT_PREFIX = "content_cache_";
const TOPIC_PREFIX = "topic_cache_";
const SECTION_PREFIX = "section_cache_";

// Единый интерфейс для всех типов контента
export interface ContentItem {
  id: string;
  type: "topic" | "section" | "quiz";
  data: any;
  lastUpdated: number;
  version: string;
}

// Единый лоадер для всех типов контента
export class ContentLoader {
  private static instance: ContentLoader;
  private cache = new Map<string, ContentItem>();

  static getInstance(): ContentLoader {
    if (!ContentLoader.instance) {
      ContentLoader.instance = new ContentLoader();
    }
    return ContentLoader.instance;
  }

  // Загрузка топика с кешированием
  async loadTopic(topicId: string): Promise<TopicContent> {
    const cacheKey = `${TOPIC_PREFIX}${topicId}`;

    // Проверяем память
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (Date.now() - cached.lastUpdated < 24 * 60 * 60 * 1000) {
        // 24 часа
        return cached.data;
      }
    }

    // Проверяем AsyncStorage
    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw) as ContentItem;
        if (Date.now() - cached.lastUpdated < 24 * 60 * 60 * 1000) {
          this.cache.set(cacheKey, cached);
          return cached.data;
        }
      }
    } catch {}

    // Загружаем fallback
    const fallback = getTopicFallback(topicId);
    if (!fallback) {
      throw new Error(`Topic ${topicId} not found`);
    }

    // Кешируем
    const contentItem: ContentItem = {
      id: topicId,
      type: "topic",
      data: fallback,
      lastUpdated: Date.now(),
      version: "1.0.0",
    };

    this.cache.set(cacheKey, contentItem);
    await this.saveToStorage(cacheKey, contentItem);

    // Предзагружаем ассеты
    this.prefetchTopicAssets(fallback).catch(() => {});

    return fallback;
  }

  // Загрузка секции
  async loadSection(sectionId: string): Promise<any> {
    const cacheKey = `${SECTION_PREFIX}${sectionId}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!.data;
    }

    try {
      const raw = await AsyncStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw) as ContentItem;
        this.cache.set(cacheKey, cached);
        return cached.data;
      }
    } catch {}

    // Fallback для секций
    const fallback = this.getSectionFallback(sectionId);
    const contentItem: ContentItem = {
      id: sectionId,
      type: "section",
      data: fallback,
      lastUpdated: Date.now(),
      version: "1.0.0",
    };

    this.cache.set(cacheKey, contentItem);
    await this.saveToStorage(cacheKey, contentItem);

    return fallback;
  }

  // Предзагрузка ассетов топика
  private async prefetchTopicAssets(topic: TopicContent): Promise<void> {
    const urls: string[] = [];

    if (topic.coverImage) urls.push(topic.coverImage);

    for (const block of topic.contentBlocks || []) {
      if (block.media?.url) urls.push(block.media.url);
    }

    await Promise.allSettled(
      urls.map((url) => getCachedUri(url).catch(() => url))
    );
  }

  // Сохранение в AsyncStorage
  private async saveToStorage(key: string, item: ContentItem): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.warn("Failed to save content to storage:", error);
    }
  }

  // Fallback для секций
  private getSectionFallback(sectionId: string): any {
    const sections = {
      "person-society": {
        id: "person-society",
        title: "Человек и общество",
        description:
          "Изучаем природу человека, его место в обществе и основные социальные процессы",
        topics: ["human-nature", "socialization", "social-groups"],
      },
      economy: {
        id: "economy",
        title: "Экономика",
        description:
          "Основы экономической теории, рынок, деньги, банки и государственная экономическая политика",
        topics: ["money", "market", "banks", "economic-policy"],
      },
      "social-relations": {
        id: "social-relations",
        title: "Социальные отношения",
        description:
          "Социальная структура, группы, семья, конфликты и социальная политика",
        topics: ["social-structure", "family", "conflicts", "social-policy"],
      },
      politics: {
        id: "politics",
        title: "Политика",
        description:
          "Политическая система, государство, выборы, партии и гражданское общество",
        topics: ["political-system", "state", "elections", "parties"],
      },
      law: {
        id: "law",
        title: "Право",
        description:
          "Правовая система, Конституция РФ, права человека и судебная система",
        topics: ["legal-system", "constitution", "human-rights", "courts"],
      },
      "spiritual-culture": {
        id: "spiritual-culture",
        title: "Духовная культура",
        description:
          "Культура, мораль, религия, образование, наука и искусство",
        topics: [
          "culture",
          "morality",
          "religion",
          "education",
          "science",
          "art",
        ],
      },
    };

    return (
      sections[sectionId as keyof typeof sections] || {
        id: sectionId,
        title: "Неизвестная секция",
        description: "Описание недоступно",
        topics: [],
      }
    );
  }

  // Очистка кеша
  async clearCache(): Promise<void> {
    this.cache.clear();
    const keys = await AsyncStorage.getAllKeys();
    if (keys) {
      const contentKeys = keys.filter(
        (key) =>
          key.startsWith(CONTENT_PREFIX) ||
          key.startsWith(TOPIC_PREFIX) ||
          key.startsWith(SECTION_PREFIX)
      );
      await AsyncStorage.multiRemove(contentKeys);
    }
  }

  // Получение статистики кеша
  async getCacheStats(): Promise<{
    memoryItems: number;
    storageItems: number;
    totalSize: number;
  }> {
    const keys = await AsyncStorage.getAllKeys();
    const contentKeys = keys
      ? keys.filter(
          (key) =>
            key.startsWith(CONTENT_PREFIX) ||
            key.startsWith(TOPIC_PREFIX) ||
            key.startsWith(SECTION_PREFIX)
        )
      : [];

    let totalSize = 0;
    for (const key of contentKeys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) totalSize += value.length;
      } catch {}
    }

    return {
      memoryItems: this.cache.size,
      storageItems: contentKeys.length,
      totalSize,
    };
  }
}

// Экспорт синглтона
export const contentLoader = ContentLoader.getInstance();

// Обратная совместимость
export async function getCachedTopic(
  topicId: string
): Promise<TopicContent | null> {
  try {
    return await contentLoader.loadTopic(topicId);
  } catch {
    return null;
  }
}

export async function setCachedTopic(topic: TopicContent): Promise<void> {
  const contentItem: ContentItem = {
    id: topic.id,
    type: "topic",
    data: topic,
    lastUpdated: Date.now(),
    version: "1.0.0",
  };

  const cacheKey = `${TOPIC_PREFIX}${topic.id}`;
  await AsyncStorage.setItem(cacheKey, JSON.stringify(contentItem));
}

export async function prefetchTopicAssets(topic: TopicContent): Promise<void> {
  const urls: string[] = [];
  if (topic.coverImage) urls.push(topic.coverImage);
  for (const b of topic.contentBlocks || []) {
    if (b.media?.url) urls.push(b.media.url);
  }
  await Promise.all(urls.map((u) => getCachedUri(u).catch(() => u)));
}

export async function getTopicWithCache(
  topicId: string,
  fallback: TopicContent
): Promise<TopicContent> {
  try {
    return await contentLoader.loadTopic(topicId);
  } catch {
    return fallback;
  }
}
