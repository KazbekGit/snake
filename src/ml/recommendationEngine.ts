import AsyncStorage from "@react-native-async-storage/async-storage";
import { abTesting } from "../analytics/abTesting";

// Типы для ML системы
export interface UserFeatureVector {
  userId: string;
  features: {
    // Демографические признаки
    grade: number;
    goal: string;

    // Поведенческие признаки
    totalStudyTime: number;
    averageSessionDuration: number;
    completionRate: number;
    averageScore: number;
    streakDays: number;

    // Предпочтения
    preferredTopics: string[];
    weakTopics: string[];
    strongTopics: string[];

    // Временные паттерны
    preferredTimeOfDay: string;
    studyFrequency: number;

    // Взаимодействие с контентом
    interactionPatterns: InteractionPattern[];
  };
  lastUpdated: number;
}

export interface InteractionPattern {
  topicId: string;
  interactionType: "view" | "complete" | "test" | "retry";
  timestamp: number;
  duration?: number;
  score?: number;
}

export interface TopicFeatureVector {
  topicId: string;
  features: {
    // Содержательные признаки
    difficulty: number;
    estimatedTime: number;
    section: string;
    tags: string[];

    // Популярность
    popularity: number;
    averageRating: number;
    completionRate: number;

    // Сложность
    averageScore: number;
    retryRate: number;

    // Связи с другими темами
    prerequisites: string[];
    relatedTopics: string[];
  };
}

export interface RecommendationScore {
  topicId: string;
  score: number;
  factors: {
    userPreference: number;
    contentRelevance: number;
    difficultyMatch: number;
    progressAlignment: number;
    recency: number;
    popularity: number;
  };
  explanation: string;
}

export interface MLModel {
  id: string;
  name: string;
  version: string;
  type:
    | "collaborative_filtering"
    | "content_based"
    | "hybrid"
    | "deep_learning";
  parameters: Record<string, any>;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  lastTrained: number;
  isActive: boolean;
}

// Ключи для AsyncStorage
const STORAGE_KEYS = {
  USER_FEATURES: "ml_user_features",
  TOPIC_FEATURES: "ml_topic_features",
  ML_MODELS: "ml_models",
  TRAINING_DATA: "ml_training_data",
  PREDICTIONS: "ml_predictions",
};

class RecommendationEngine {
  private static instance: RecommendationEngine;
  private models: Map<string, MLModel> = new Map();
  private userFeatures: Map<string, UserFeatureVector> = new Map();
  private topicFeatures: Map<string, TopicFeatureVector> = new Map();

  private constructor() {
    this.initialize();
  }

  static getInstance(): RecommendationEngine {
    if (!RecommendationEngine.instance) {
      RecommendationEngine.instance = new RecommendationEngine();
    }
    return RecommendationEngine.instance;
  }

  private async initialize(): Promise<void> {
    await this.loadModels();
    await this.loadFeatures();
    await this.initializeDefaultModels();
  }

  // Инициализация моделей по умолчанию
  private async initializeDefaultModels(): Promise<void> {
    const defaultModels: MLModel[] = [
      {
        id: "collaborative_filtering_v1",
        name: "Collaborative Filtering",
        version: "1.0",
        type: "collaborative_filtering",
        parameters: {
          similarityThreshold: 0.3,
          minCommonItems: 2,
          maxNeighbors: 10,
        },
        performance: {
          accuracy: 0.75,
          precision: 0.72,
          recall: 0.68,
          f1Score: 0.7,
        },
        lastTrained: Date.now(),
        isActive: true,
      },
      {
        id: "content_based_v1",
        name: "Content-Based Filtering",
        version: "1.0",
        type: "content_based",
        parameters: {
          featureWeight: 0.5,
          similarityMetric: "cosine",
          minSimilarity: 0.2,
        },
        performance: {
          accuracy: 0.68,
          precision: 0.65,
          recall: 0.62,
          f1Score: 0.63,
        },
        lastTrained: Date.now(),
        isActive: true,
      },
      {
        id: "hybrid_v1",
        name: "Hybrid Model",
        version: "1.0",
        type: "hybrid",
        parameters: {
          collaborativeWeight: 0.6,
          contentWeight: 0.4,
          ensembleMethod: "weighted_average",
        },
        performance: {
          accuracy: 0.82,
          precision: 0.79,
          recall: 0.76,
          f1Score: 0.77,
        },
        lastTrained: Date.now(),
        isActive: true,
      },
    ];

    for (const model of defaultModels) {
      if (!this.models.has(model.id)) {
        this.models.set(model.id, model);
      }
    }

    await this.saveModels();
  }

  // Получение персонализированных рекомендаций
  async getRecommendations(
    userId: string,
    limit: number = 10,
    context?: Record<string, any>
  ): Promise<RecommendationScore[]> {
    // Получаем конфигурацию из A/B тестов
    const abConfig = await abTesting.getUserConfig(userId, "algorithm");
    const algorithm = abConfig?.algorithm || "hybrid";

    // Выбираем активную модель
    const activeModel = Array.from(this.models.values()).find(
      (model) => model.isActive && model.type === algorithm
    );

    if (!activeModel) {
      return this.getFallbackRecommendations(userId, limit);
    }

    // Получаем признаки пользователя
    const userFeatures = await this.getUserFeatures(userId);
    if (!userFeatures) {
      return this.getFallbackRecommendations(userId, limit);
    }

    // Генерируем рекомендации в зависимости от типа модели
    let recommendations: RecommendationScore[] = [];

    switch (activeModel.type) {
      case "collaborative_filtering":
        recommendations = await this.collaborativeFiltering(
          userId,
          userFeatures,
          limit
        );
        break;
      case "content_based":
        recommendations = await this.contentBasedFiltering(
          userId,
          userFeatures,
          limit
        );
        break;
      case "hybrid":
        recommendations = await this.hybridRecommendations(
          userId,
          userFeatures,
          limit,
          activeModel
        );
        break;
      default:
        recommendations = await this.getFallbackRecommendations(userId, limit);
    }

    // Применяем контекстные фильтры
    if (context) {
      recommendations = this.applyContextFilters(recommendations, context);
    }

    return recommendations.slice(0, limit);
  }

  // Collaborative Filtering
  private async collaborativeFiltering(
    userId: string,
    userFeatures: UserFeatureVector,
    limit: number
  ): Promise<RecommendationScore[]> {
    const allUsers = await this.getAllUserFeatures();
    const similarUsers = this.findSimilarUsers(userFeatures, allUsers, 5);

    const recommendations: RecommendationScore[] = [];
    const topicScores: Map<string, number> = new Map();

    // Агрегируем рекомендации от похожих пользователей
    for (const similarUser of similarUsers) {
      const userTopics = similarUser.features.preferredTopics;
      for (const topicId of userTopics) {
        const currentScore = topicScores.get(topicId) || 0;
        topicScores.set(topicId, currentScore + similarUser.similarity);
      }
    }

    // Преобразуем в RecommendationScore
    for (const [topicId, score] of topicScores) {
      recommendations.push({
        topicId,
        score: score / similarUsers.length,
        factors: {
          userPreference: score / similarUsers.length,
          contentRelevance: 0.5,
          difficultyMatch: 0.5,
          progressAlignment: 0.5,
          recency: 0.5,
          popularity: 0.5,
        },
        explanation: `Рекомендуется пользователями с похожими интересами`,
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Content-Based Filtering
  private async contentBasedFiltering(
    userId: string,
    userFeatures: UserFeatureVector,
    limit: number
  ): Promise<RecommendationScore[]> {
    const allTopics = await this.getAllTopicFeatures();
    const recommendations: RecommendationScore[] = [];

    for (const topic of allTopics) {
      const score = this.calculateContentSimilarity(userFeatures, topic);

      recommendations.push({
        topicId: topic.topicId,
        score,
        factors: {
          userPreference: this.calculateUserPreference(userFeatures, topic),
          contentRelevance: this.calculateContentRelevance(userFeatures, topic),
          difficultyMatch: this.calculateDifficultyMatch(userFeatures, topic),
          progressAlignment: this.calculateProgressAlignment(
            userFeatures,
            topic
          ),
          recency: this.calculateRecency(userFeatures, topic),
          popularity: topic.features.popularity,
        },
        explanation: `Соответствует вашим интересам и уровню сложности`,
      });
    }

    return recommendations.sort((a, b) => b.score - a.score);
  }

  // Hybrid Recommendations
  private async hybridRecommendations(
    userId: string,
    userFeatures: UserFeatureVector,
    limit: number,
    model: MLModel
  ): Promise<RecommendationScore[]> {
    const collaborativeRecs = await this.collaborativeFiltering(
      userId,
      userFeatures,
      limit
    );
    const contentRecs = await this.contentBasedFiltering(
      userId,
      userFeatures,
      limit
    );

    const hybridScores: Map<string, RecommendationScore> = new Map();

    // Объединяем рекомендации
    const collaborativeWeight = model.parameters.collaborativeWeight || 0.6;
    const contentWeight = model.parameters.contentWeight || 0.4;

    // Добавляем collaborative рекомендации
    for (const rec of collaborativeRecs) {
      hybridScores.set(rec.topicId, {
        ...rec,
        score: rec.score * collaborativeWeight,
      });
    }

    // Добавляем content-based рекомендации
    for (const rec of contentRecs) {
      const existing = hybridScores.get(rec.topicId);
      if (existing) {
        existing.score += rec.score * contentWeight;
        existing.factors = this.mergeFactors(
          existing.factors,
          rec.factors,
          collaborativeWeight,
          contentWeight
        );
      } else {
        hybridScores.set(rec.topicId, {
          ...rec,
          score: rec.score * contentWeight,
        });
      }
    }

    return Array.from(hybridScores.values()).sort((a, b) => b.score - a.score);
  }

  // Fallback рекомендации
  private async getFallbackRecommendations(
    userId: string,
    limit: number
  ): Promise<RecommendationScore[]> {
    const allTopics = await this.getAllTopicFeatures();
    const recommendations: RecommendationScore[] = [];

    for (const topic of allTopics.slice(0, limit)) {
      recommendations.push({
        topicId: topic.topicId,
        score: topic.features.popularity,
        factors: {
          userPreference: 0.5,
          contentRelevance: 0.5,
          difficultyMatch: 0.5,
          progressAlignment: 0.5,
          recency: 0.5,
          popularity: topic.features.popularity,
        },
        explanation: `Популярная тема для изучения`,
      });
    }

    return recommendations;
  }

  // Поиск похожих пользователей
  private findSimilarUsers(
    userFeatures: UserFeatureVector,
    allUsers: UserFeatureVector[],
    limit: number
  ): Array<UserFeatureVector & { similarity: number }> {
    const similarities: Array<UserFeatureVector & { similarity: number }> = [];

    for (const otherUser of allUsers) {
      if (otherUser.userId === userFeatures.userId) continue;

      const similarity = this.calculateUserSimilarity(userFeatures, otherUser);
      similarities.push({ ...otherUser, similarity });
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  // Расчет схожести пользователей
  private calculateUserSimilarity(
    user1: UserFeatureVector,
    user2: UserFeatureVector
  ): number {
    let similarity = 0;
    let totalWeight = 0;

    // Схожесть по целям обучения
    if (user1.features.goal === user2.features.goal) {
      similarity += 0.3;
    }
    totalWeight += 0.3;

    // Схожесть по классу
    const gradeDiff = Math.abs(user1.features.grade - user2.features.grade);
    similarity += (1 - gradeDiff / 4) * 0.2; // Максимум 4 класса разницы
    totalWeight += 0.2;

    // Схожесть по предпочтениям
    const commonTopics = user1.features.preferredTopics.filter((topic) =>
      user2.features.preferredTopics.includes(topic)
    );
    similarity +=
      (commonTopics.length /
        Math.max(user1.features.preferredTopics.length, 1)) *
      0.3;
    totalWeight += 0.3;

    // Схожесть по поведению
    const behaviorSimilarity =
      1 -
      Math.abs(
        user1.features.averageSessionDuration -
          user2.features.averageSessionDuration
      ) /
        Math.max(
          user1.features.averageSessionDuration,
          user2.features.averageSessionDuration,
          1
        );
    similarity += behaviorSimilarity * 0.2;
    totalWeight += 0.2;

    return similarity / totalWeight;
  }

  // Расчет схожести контента
  private calculateContentSimilarity(
    userFeatures: UserFeatureVector,
    topicFeatures: TopicFeatureVector
  ): number {
    let similarity = 0;
    let totalWeight = 0;

    // Схожесть по предпочтениям
    const preferenceScore = this.calculateUserPreference(
      userFeatures,
      topicFeatures
    );
    similarity += preferenceScore * 0.4;
    totalWeight += 0.4;

    // Схожесть по сложности
    const difficultyScore = this.calculateDifficultyMatch(
      userFeatures,
      topicFeatures
    );
    similarity += difficultyScore * 0.3;
    totalWeight += 0.3;

    // Схожесть по прогрессу
    const progressScore = this.calculateProgressAlignment(
      userFeatures,
      topicFeatures
    );
    similarity += progressScore * 0.3;
    totalWeight += 0.3;

    return similarity / totalWeight;
  }

  // Расчет предпочтений пользователя
  private calculateUserPreference(
    userFeatures: UserFeatureVector,
    topicFeatures: TopicFeatureVector
  ): number {
    // Проверяем, есть ли тема в предпочтениях
    if (userFeatures.features.preferredTopics.includes(topicFeatures.topicId)) {
      return 1.0;
    }

    // Проверяем теги
    const commonTags = topicFeatures.features.tags.filter((tag) =>
      userFeatures.features.preferredTopics.some((pref) => pref.includes(tag))
    );

    return Math.min(
      commonTags.length / Math.max(topicFeatures.features.tags.length, 1),
      1.0
    );
  }

  // Расчет соответствия сложности
  private calculateDifficultyMatch(
    userFeatures: UserFeatureVector,
    topicFeatures: TopicFeatureVector
  ): number {
    const userLevel = userFeatures.features.averageScore / 100;
    const topicDifficulty = topicFeatures.features.difficulty;

    // Идеальное соответствие - когда сложность темы близка к уровню пользователя
    const diff = Math.abs(userLevel - topicDifficulty);
    return Math.max(0, 1 - diff);
  }

  // Расчет соответствия прогрессу
  private calculateProgressAlignment(
    userFeatures: UserFeatureVector,
    topicFeatures: TopicFeatureVector
  ): number {
    // Если тема уже изучена, не рекомендуем
    if (userFeatures.features.preferredTopics.includes(topicFeatures.topicId)) {
      return 0;
    }

    // Проверяем предварительные требования
    const prerequisites = topicFeatures.features.prerequisites || [];
    const completedPrerequisites = prerequisites.filter((prereq) =>
      userFeatures.features.preferredTopics.includes(prereq)
    );

    return completedPrerequisites.length / Math.max(prerequisites.length, 1);
  }

  // Расчет актуальности
  private calculateRecency(
    userFeatures: UserFeatureVector,
    topicFeatures: TopicFeatureVector
  ): number {
    // Простая логика: чем больше времени прошло с последнего изучения, тем выше актуальность
    const lastStudy = userFeatures.lastUpdated;
    const daysSinceLastStudy = (Date.now() - lastStudy) / (24 * 60 * 60 * 1000);

    return Math.min(daysSinceLastStudy / 30, 1.0); // Максимум 30 дней
  }

  // Расчет релевантности контента
  private calculateContentRelevance(
    userFeatures: UserFeatureVector,
    topicFeatures: TopicFeatureVector
  ): number {
    // Проверяем соответствие целям обучения
    if (
      userFeatures.features.goal === "ege" &&
      topicFeatures.features.difficulty > 0.7
    ) {
      return 0.9;
    }

    if (
      userFeatures.features.goal === "school" &&
      topicFeatures.features.difficulty < 0.5
    ) {
      return 0.8;
    }

    return 0.5;
  }

  // Объединение факторов
  private mergeFactors(
    factors1: RecommendationScore["factors"],
    factors2: RecommendationScore["factors"],
    weight1: number,
    weight2: number
  ): RecommendationScore["factors"] {
    return {
      userPreference:
        (factors1.userPreference * weight1 +
          factors2.userPreference * weight2) /
        (weight1 + weight2),
      contentRelevance:
        (factors1.contentRelevance * weight1 +
          factors2.contentRelevance * weight2) /
        (weight1 + weight2),
      difficultyMatch:
        (factors1.difficultyMatch * weight1 +
          factors2.difficultyMatch * weight2) /
        (weight1 + weight2),
      progressAlignment:
        (factors1.progressAlignment * weight1 +
          factors2.progressAlignment * weight2) /
        (weight1 + weight2),
      recency:
        (factors1.recency * weight1 + factors2.recency * weight2) /
        (weight1 + weight2),
      popularity:
        (factors1.popularity * weight1 + factors2.popularity * weight2) /
        (weight1 + weight2),
    };
  }

  // Применение контекстных фильтров
  private applyContextFilters(
    recommendations: RecommendationScore[],
    context: Record<string, any>
  ): RecommendationScore[] {
    let filtered = recommendations;

    // Фильтр по времени
    if (context.availableTime) {
      filtered = filtered.filter((rec) => {
        const topicFeatures = this.topicFeatures.get(rec.topicId);
        return (
          topicFeatures &&
          topicFeatures.features.estimatedTime <= context.availableTime
        );
      });
    }

    // Фильтр по сложности
    if (context.difficultyPreference) {
      filtered = filtered.filter((rec) => {
        const topicFeatures = this.topicFeatures.get(rec.topicId);
        return (
          topicFeatures &&
          Math.abs(
            topicFeatures.features.difficulty - context.difficultyPreference
          ) < 0.3
        );
      });
    }

    // Фильтр по разделу
    if (context.section) {
      filtered = filtered.filter((rec) => {
        const topicFeatures = this.topicFeatures.get(rec.topicId);
        return (
          topicFeatures && topicFeatures.features.section === context.section
        );
      });
    }

    return filtered;
  }

  // Обновление признаков пользователя
  async updateUserFeatures(
    userId: string,
    newFeatures: Partial<UserFeatureVector["features"]>
  ): Promise<void> {
    const existing = this.userFeatures.get(userId);
    const updatedFeatures: UserFeatureVector = {
      userId,
      features: {
        ...existing?.features,
        ...newFeatures,
      },
      lastUpdated: Date.now(),
    };

    this.userFeatures.set(userId, updatedFeatures);
    await this.saveUserFeatures();
  }

  // Обновление признаков темы
  async updateTopicFeatures(
    topicId: string,
    newFeatures: Partial<TopicFeatureVector["features"]>
  ): Promise<void> {
    const existing = this.topicFeatures.get(topicId);
    const updatedFeatures: TopicFeatureVector = {
      topicId,
      features: {
        ...existing?.features,
        ...newFeatures,
      },
    };

    this.topicFeatures.set(topicId, updatedFeatures);
    await this.saveTopicFeatures();
  }

  // Обучение модели
  async trainModel(modelId: string, trainingData: any[]): Promise<void> {
    const model = this.models.get(modelId);
    if (!model) return;

    // TODO: Реализовать реальное обучение модели
    // Пока просто обновляем метрики производительности
    model.performance = {
      accuracy: 0.8 + Math.random() * 0.1,
      precision: 0.75 + Math.random() * 0.1,
      recall: 0.7 + Math.random() * 0.1,
      f1Score: 0.72 + Math.random() * 0.1,
    };
    model.lastTrained = Date.now();

    await this.saveModels();
  }

  // Приватные методы для работы с хранилищем

  private async loadModels(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ML_MODELS);
      if (data) {
        const models = JSON.parse(data);
        this.models = new Map(
          models.map((model: MLModel) => [model.id, model])
        );
      }
    } catch {
      this.models = new Map();
    }
  }

  private async saveModels(): Promise<void> {
    const models = Array.from(this.models.values());
    await AsyncStorage.setItem(STORAGE_KEYS.ML_MODELS, JSON.stringify(models));
  }

  private async loadFeatures(): Promise<void> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_FEATURES);
      if (userData) {
        const userFeatures = JSON.parse(userData);
        this.userFeatures = new Map(
          userFeatures.map((uf: UserFeatureVector) => [uf.userId, uf])
        );
      }

      const topicData = await AsyncStorage.getItem(STORAGE_KEYS.TOPIC_FEATURES);
      if (topicData) {
        const topicFeatures = JSON.parse(topicData);
        this.topicFeatures = new Map(
          topicFeatures.map((tf: TopicFeatureVector) => [tf.topicId, tf])
        );
      }
    } catch {
      this.userFeatures = new Map();
      this.topicFeatures = new Map();
    }
  }

  private async saveUserFeatures(): Promise<void> {
    const userFeatures = Array.from(this.userFeatures.values());
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_FEATURES,
      JSON.stringify(userFeatures)
    );
  }

  private async saveTopicFeatures(): Promise<void> {
    const topicFeatures = Array.from(this.topicFeatures.values());
    await AsyncStorage.setItem(
      STORAGE_KEYS.TOPIC_FEATURES,
      JSON.stringify(topicFeatures)
    );
  }

  private async getUserFeatures(
    userId: string
  ): Promise<UserFeatureVector | null> {
    return this.userFeatures.get(userId) || null;
  }

  private async getAllUserFeatures(): Promise<UserFeatureVector[]> {
    return Array.from(this.userFeatures.values());
  }

  private async getAllTopicFeatures(): Promise<TopicFeatureVector[]> {
    return Array.from(this.topicFeatures.values());
  }

  // Очистка данных
  async clearAllData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.USER_FEATURES),
      AsyncStorage.removeItem(STORAGE_KEYS.TOPIC_FEATURES),
      AsyncStorage.removeItem(STORAGE_KEYS.ML_MODELS),
      AsyncStorage.removeItem(STORAGE_KEYS.TRAINING_DATA),
      AsyncStorage.removeItem(STORAGE_KEYS.PREDICTIONS),
    ]);
  }
}

export const recommendationEngine = RecommendationEngine.getInstance();
