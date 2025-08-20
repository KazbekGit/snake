import { TopicContent } from "../content/schema";
import { contentCache } from "./contentCache";

export interface UserProfile {
  id: string;
  preferences: {
    difficulty: "beginner" | "intermediate" | "advanced";
    learningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
    pace: "slow" | "normal" | "fast";
    interests: string[];
  };
  progress: {
    completedTopics: string[];
    currentStreak: number;
    totalStudyTime: number;
    averageScore: number;
    lastStudyDate: number;
  };
  behavior: {
    studySessions: StudySession[];
    topicInteractions: TopicInteraction[];
    quizResults: QuizResult[];
  };
}

export interface StudySession {
  id: string;
  topicId: string;
  startTime: number;
  endTime: number;
  duration: number;
  blocksCompleted: number;
  totalBlocks: number;
}

export interface TopicInteraction {
  topicId: string;
  timestamp: number;
  action: "view" | "start" | "complete" | "pause" | "resume";
  duration?: number;
}

export interface QuizResult {
  topicId: string;
  timestamp: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  mistakes: string[];
}

export interface Recommendation {
  topicId: string;
  topic: TopicContent;
  score: number;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedTime: number;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  topics: string[];
  estimatedDuration: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  prerequisites: string[];
}

class PersonalizationEngine {
  private static instance: PersonalizationEngine;
  private userProfile: UserProfile | null = null;

  private constructor() {}

  static getInstance(): PersonalizationEngine {
    if (!PersonalizationEngine.instance) {
      PersonalizationEngine.instance = new PersonalizationEngine();
    }
    return PersonalizationEngine.instance;
  }

  // Инициализация профиля пользователя
  async initializeUserProfile(userId: string): Promise<UserProfile> {
    // TODO: Загрузить профиль из базы данных или создать новый
    this.userProfile = {
      id: userId,
      preferences: {
        difficulty: "beginner",
        learningStyle: "visual",
        pace: "normal",
        interests: [],
      },
      progress: {
        completedTopics: [],
        currentStreak: 0,
        totalStudyTime: 0,
        averageScore: 0,
        lastStudyDate: 0,
      },
      behavior: {
        studySessions: [],
        topicInteractions: [],
        quizResults: [],
      },
    };

    return this.userProfile;
  }

  // Получение рекомендаций
  async getRecommendations(limit: number = 5): Promise<Recommendation[]> {
    if (!this.userProfile) {
      throw new Error("User profile not initialized");
    }

    const allTopics = await this.getAllAvailableTopics();
    const recommendations: Recommendation[] = [];

    for (const topic of allTopics) {
      const score = await this.calculateRecommendationScore(topic);
      const reason = this.getRecommendationReason(topic, score);
      const priority = this.getPriority(score);
      const estimatedTime = this.estimateStudyTime(topic);

      recommendations.push({
        topicId: topic.id,
        topic,
        score,
        reason,
        priority,
        estimatedTime,
      });
    }

    // Сортируем по score и возвращаем top N
    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Создание персонализированного пути обучения
  async createLearningPath(
    goal: string,
    duration: number
  ): Promise<LearningPath> {
    if (!this.userProfile) {
      throw new Error("User profile not initialized");
    }

    const allTopics = await this.getAllAvailableTopics();
    const relevantTopics = allTopics.filter((topic) =>
      this.isTopicRelevantToGoal(topic, goal)
    );

    // Сортируем темы по сложности и релевантности
    const sortedTopics = relevantTopics.sort((a, b) => {
      const aScore = this.calculateTopicRelevanceScore(a, goal);
      const bScore = this.calculateTopicRelevanceScore(b, goal);
      return bScore - aScore;
    });

    // Выбираем темы, которые помещаются в заданное время
    const selectedTopics: string[] = [];
    let totalTime = 0;

    for (const topic of sortedTopics) {
      const topicTime = this.estimateStudyTime(topic);
      if (totalTime + topicTime <= duration) {
        selectedTopics.push(topic.id);
        totalTime += topicTime;
      }
    }

    return {
      id: `path_${Date.now()}`,
      name: `Путь к цели: ${goal}`,
      description: `Персонализированный путь обучения для достижения цели "${goal}"`,
      topics: selectedTopics,
      estimatedDuration: totalTime,
      difficulty: this.userProfile.preferences.difficulty,
      prerequisites: [],
    };
  }

  // Обновление профиля на основе поведения
  async updateProfileFromBehavior(
    topicId: string,
    action: TopicInteraction["action"],
    duration?: number
  ): Promise<void> {
    if (!this.userProfile) {
      throw new Error("User profile not initialized");
    }

    const interaction: TopicInteraction = {
      topicId,
      timestamp: Date.now(),
      action,
      duration,
    };

    this.userProfile.behavior.topicInteractions.push(interaction);

    // Обновляем прогресс
    if (action === "complete") {
      if (!this.userProfile.progress.completedTopics.includes(topicId)) {
        this.userProfile.progress.completedTopics.push(topicId);
      }
    }

    // Обновляем время изучения
    if (duration) {
      this.userProfile.progress.totalStudyTime += duration;
    }

    // Обновляем дату последнего изучения
    this.userProfile.progress.lastStudyDate = Date.now();

    // TODO: Сохранить обновленный профиль в базу данных
  }

  // Добавление результата теста
  async addQuizResult(result: QuizResult): Promise<void> {
    if (!this.userProfile) {
      throw new Error("User profile not initialized");
    }

    this.userProfile.behavior.quizResults.push(result);

    // Обновляем средний балл
    const allScores = this.userProfile.behavior.quizResults.map((r) => r.score);
    this.userProfile.progress.averageScore =
      allScores.reduce((sum, score) => sum + score, 0) / allScores.length;

    // TODO: Сохранить обновленный профиль в базу данных
  }

  // Добавление сессии изучения
  async addStudySession(session: StudySession): Promise<void> {
    if (!this.userProfile) {
      throw new Error("User profile not initialized");
    }

    this.userProfile.behavior.studySessions.push(session);

    // Обновляем прогресс
    this.userProfile.progress.totalStudyTime += session.duration;

    // Обновляем streak
    const today = new Date().toDateString();
    const lastStudyDate = new Date(
      this.userProfile.progress.lastStudyDate
    ).toDateString();

    if (today === lastStudyDate) {
      // Уже изучали сегодня
    } else if (
      new Date(this.userProfile.progress.lastStudyDate).getTime() >
      Date.now() - 2 * 24 * 60 * 60 * 1000
    ) {
      // Изучали вчера - увеличиваем streak
      this.userProfile.progress.currentStreak++;
    } else {
      // Перерыв больше дня - сбрасываем streak
      this.userProfile.progress.currentStreak = 1;
    }

    this.userProfile.progress.lastStudyDate = Date.now();

    // TODO: Сохранить обновленный профиль в базу данных
  }

  // Приватные методы

  private async getAllAvailableTopics(): Promise<TopicContent[]> {
    // TODO: Получить все доступные темы из кэша или API
    // Пока возвращаем пустой массив
    return [];
  }

  private async calculateRecommendationScore(
    topic: TopicContent
  ): Promise<number> {
    if (!this.userProfile) return 0;

    let score = 0;

    // Базовый score на основе сложности
    const difficultyScore = this.getDifficultyScore(topic);
    score += difficultyScore * 0.3;

    // Score на основе интересов
    const interestScore = this.getInterestScore(topic);
    score += interestScore * 0.2;

    // Score на основе прогресса
    const progressScore = this.getProgressScore(topic);
    score += progressScore * 0.3;

    // Score на основе времени последнего изучения
    const recencyScore = this.getRecencyScore(topic);
    score += recencyScore * 0.2;

    return Math.min(score, 1.0);
  }

  private getDifficultyScore(topic: TopicContent): number {
    // TODO: Реализовать оценку сложности темы
    return 0.5;
  }

  private getInterestScore(topic: TopicContent): number {
    if (!this.userProfile) return 0;

    const userInterests = this.userProfile.preferences.interests;
    const topicKeywords = [
      topic.title.toLowerCase(),
      topic.description.toLowerCase(),
    ].join(" ");

    let score = 0;
    for (const interest of userInterests) {
      if (topicKeywords.includes(interest.toLowerCase())) {
        score += 0.2;
      }
    }

    return Math.min(score, 1.0);
  }

  private getProgressScore(topic: TopicContent): number {
    if (!this.userProfile) return 0;

    const isCompleted = this.userProfile.progress.completedTopics.includes(
      topic.id
    );
    if (isCompleted) return 0; // Не рекомендуем уже изученные темы

    // Рекомендуем темы, которые логически связаны с изученными
    const relatedTopics = this.getRelatedTopics(topic);
    const completedRelated = relatedTopics.filter((relatedTopic) =>
      this.userProfile!.progress.completedTopics.includes(relatedTopic)
    );

    return Math.min(completedRelated.length / relatedTopics.length, 1.0);
  }

  private getRecencyScore(topic: TopicContent): number {
    if (!this.userProfile) return 0;

    const lastInteraction = this.userProfile.behavior.topicInteractions
      .filter((i) => i.topicId === topic.id)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (!lastInteraction) return 1.0; // Никогда не изучали - высший приоритет

    const daysSinceLastStudy =
      (Date.now() - lastInteraction.timestamp) / (24 * 60 * 60 * 1000);

    // Чем больше времени прошло, тем выше score
    return Math.min(daysSinceLastStudy / 30, 1.0);
  }

  private getRecommendationReason(topic: TopicContent, score: number): string {
    if (score > 0.8) return "Отлично подходит для вашего уровня";
    if (score > 0.6) return "Соответствует вашим интересам";
    if (score > 0.4) return "Логично продолжение изученного";
    return "Базовые знания для дальнейшего изучения";
  }

  private getPriority(score: number): "high" | "medium" | "low" {
    if (score > 0.7) return "high";
    if (score > 0.4) return "medium";
    return "low";
  }

  private estimateStudyTime(topic: TopicContent): number {
    // Оценка времени изучения в минутах
    const baseTime = 30; // Базовое время на тему
    const blockTime = topic.contentBlocks.length * 10; // 10 минут на блок
    const quizTime = 15; // 15 минут на тест

    return baseTime + blockTime + quizTime;
  }

  private isTopicRelevantToGoal(topic: TopicContent, goal: string): boolean {
    // TODO: Реализовать проверку релевантности темы к цели
    return true;
  }

  private calculateTopicRelevanceScore(
    topic: TopicContent,
    goal: string
  ): number {
    // TODO: Реализовать расчет релевантности
    return 0.5;
  }

  private getRelatedTopics(topic: TopicContent): string[] {
    // TODO: Реализовать получение связанных тем
    return [];
  }

  // Получение статистики обучения
  getLearningStats() {
    if (!this.userProfile) return null;

    const totalSessions = this.userProfile.behavior.studySessions.length;
    const totalInteractions =
      this.userProfile.behavior.topicInteractions.length;
    const totalQuizzes = this.userProfile.behavior.quizResults.length;

    return {
      totalStudyTime: this.userProfile.progress.totalStudyTime,
      completedTopics: this.userProfile.progress.completedTopics.length,
      currentStreak: this.userProfile.progress.currentStreak,
      averageScore: this.userProfile.progress.averageScore,
      totalSessions,
      totalInteractions,
      totalQuizzes,
    };
  }

  // Получение текущего профиля
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }
}

export const personalizationEngine = PersonalizationEngine.getInstance();

