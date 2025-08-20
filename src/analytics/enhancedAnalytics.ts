import AsyncStorage from "@react-native-async-storage/async-storage";
import { advancedAnalytics } from "./advancedAnalytics";
import { abTesting } from "./abTesting";
import { recommendationEngine } from "../ml/recommendationEngine";

// Типы для расширенной аналитики
export interface UserBehaviorProfile {
  userId: string;
  learningPatterns: LearningPattern[];
  engagementMetrics: EngagementMetrics;
  performanceTrends: PerformanceTrend[];
  contentPreferences: ContentPreferences;
  timePatterns: TimePatterns;
  socialPatterns: SocialPatterns;
  lastUpdated: number;
}

export interface LearningPattern {
  patternId: string;
  type:
    | "session_duration"
    | "completion_rate"
    | "retry_behavior"
    | "time_of_day"
    | "topic_sequence";
  description: string;
  confidence: number;
  data: Record<string, any>;
  lastObserved: number;
}

export interface EngagementMetrics {
  sessionFrequency: number; // Сессий в день
  averageSessionDuration: number; // В минутах
  completionRate: number; // Процент завершенных тем
  retentionRate: number; // Процент возвращающихся пользователей
  engagementScore: number; // Общий балл вовлеченности (0-100)
  motivationLevel: "high" | "medium" | "low";
  dropoffPoints: DropoffPoint[];
}

export interface DropoffPoint {
  screen: string;
  frequency: number;
  averageTimeBeforeDropoff: number;
  commonReasons: string[];
}

export interface PerformanceTrend {
  metric: string;
  values: Array<{ date: string; value: number }>;
  trend: "improving" | "declining" | "stable";
  slope: number;
  confidence: number;
}

export interface ContentPreferences {
  favoriteTopics: string[];
  avoidedTopics: string[];
  preferredDifficulty: number;
  preferredContentType: "video" | "text" | "interactive" | "quiz";
  learningStyle: "visual" | "auditory" | "kinesthetic" | "reading";
  pacePreference: "slow" | "normal" | "fast";
}

export interface TimePatterns {
  preferredStudyTimes: Array<{ hour: number; frequency: number }>;
  weeklyPattern: Array<{ day: number; sessions: number }>;
  sessionGaps: Array<{ gapHours: number; frequency: number }>;
  optimalSessionDuration: number;
  breakPatterns: BreakPattern[];
}

export interface BreakPattern {
  type: "short" | "medium" | "long";
  duration: number;
  frequency: number;
  effectiveness: number;
}

export interface SocialPatterns {
  comparisonGroup: string;
  percentileRank: number;
  competitiveSpirit: "high" | "medium" | "low";
  socialMotivation: number;
  peerInfluence: number;
}

export interface PredictiveInsights {
  userId: string;
  predictions: Prediction[];
  recommendations: InsightRecommendation[];
  riskFactors: RiskFactor[];
  opportunities: Opportunity[];
  lastUpdated: number;
}

export interface Prediction {
  type:
    | "completion_probability"
    | "dropout_risk"
    | "performance_forecast"
    | "engagement_trend";
  value: number;
  confidence: number;
  timeframe: number; // В днях
  factors: string[];
}

export interface InsightRecommendation {
  type: "intervention" | "optimization" | "motivation" | "content";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  expectedImpact: number;
  implementation: string;
}

export interface RiskFactor {
  factor: string;
  severity: "high" | "medium" | "low";
  probability: number;
  mitigation: string;
}

export interface Opportunity {
  area: string;
  potential: number;
  effort: number;
  roi: number;
  description: string;
}

export interface CohortAnalysis {
  cohortId: string;
  cohortType: "registration_date" | "goal" | "grade" | "behavior";
  cohortValue: string;
  users: string[];
  metrics: CohortMetrics;
  trends: CohortTrend[];
}

export interface CohortMetrics {
  size: number;
  retentionRate: number;
  averageEngagement: number;
  completionRate: number;
  averageScore: number;
  churnRate: number;
}

export interface CohortTrend {
  period: string;
  retentionRate: number;
  engagementScore: number;
  completionRate: number;
}

// Ключи для AsyncStorage
const STORAGE_KEYS = {
  BEHAVIOR_PROFILES: "enhanced_analytics_behavior_profiles",
  PREDICTIVE_INSIGHTS: "enhanced_analytics_predictive_insights",
  COHORT_ANALYSIS: "enhanced_analytics_cohort_analysis",
  ENGAGEMENT_EVENTS: "enhanced_analytics_engagement_events",
  PERFORMANCE_DATA: "enhanced_analytics_performance_data",
};

class EnhancedAnalytics {
  private static instance: EnhancedAnalytics;
  private behaviorProfiles: Map<string, UserBehaviorProfile> = new Map();
  private predictiveInsights: Map<string, PredictiveInsights> = new Map();
  private cohortAnalyses: Map<string, CohortAnalysis> = new Map();

  private constructor() {
    this.initialize();
  }

  static getInstance(): EnhancedAnalytics {
    if (!EnhancedAnalytics.instance) {
      EnhancedAnalytics.instance = new EnhancedAnalytics();
    }
    return EnhancedAnalytics.instance;
  }

  private async initialize(): Promise<void> {
    await this.loadData();
    await this.initializeDefaultCohorts();
  }

  // Инициализация когорт по умолчанию
  private async initializeDefaultCohorts(): Promise<void> {
    const defaultCohorts: CohortAnalysis[] = [
      {
        cohortId: "ege_students",
        cohortType: "goal",
        cohortValue: "ege",
        users: [],
        metrics: {
          size: 0,
          retentionRate: 0,
          averageEngagement: 0,
          completionRate: 0,
          averageScore: 0,
          churnRate: 0,
        },
        trends: [],
      },
      {
        cohortId: "school_students",
        cohortType: "goal",
        cohortValue: "school",
        users: [],
        metrics: {
          size: 0,
          retentionRate: 0,
          averageEngagement: 0,
          completionRate: 0,
          averageScore: 0,
          churnRate: 0,
        },
        trends: [],
      },
      {
        cohortId: "high_engagement",
        cohortType: "behavior",
        cohortValue: "high_engagement",
        users: [],
        metrics: {
          size: 0,
          retentionRate: 0,
          averageEngagement: 0,
          completionRate: 0,
          averageScore: 0,
          churnRate: 0,
        },
        trends: [],
      },
    ];

    for (const cohort of defaultCohorts) {
      if (!this.cohortAnalyses.has(cohort.cohortId)) {
        this.cohortAnalyses.set(cohort.cohortId, cohort);
      }
    }

    await this.saveCohortAnalyses();
  }

  // Анализ поведения пользователя
  async analyzeUserBehavior(userId: string): Promise<UserBehaviorProfile> {
    const sessions = await advancedAnalytics.getStudySessions();
    const attempts = await advancedAnalytics.getTestAttempts();
    const userSessions = sessions.filter((s) => s.userId === userId);
    const userAttempts = attempts.filter((a) => a.userId === userId);

    const profile: UserBehaviorProfile = {
      userId,
      learningPatterns: await this.identifyLearningPatterns(
        userId,
        userSessions,
        userAttempts
      ),
      engagementMetrics: await this.calculateEngagementMetrics(
        userId,
        userSessions,
        userAttempts
      ),
      performanceTrends: await this.calculatePerformanceTrends(
        userId,
        userAttempts
      ),
      contentPreferences: await this.analyzeContentPreferences(
        userId,
        userSessions,
        userAttempts
      ),
      timePatterns: await this.analyzeTimePatterns(userId, userSessions),
      socialPatterns: await this.analyzeSocialPatterns(userId),
      lastUpdated: Date.now(),
    };

    this.behaviorProfiles.set(userId, profile);
    await this.saveBehaviorProfiles();

    return profile;
  }

  // Идентификация паттернов обучения
  private async identifyLearningPatterns(
    userId: string,
    sessions: any[],
    attempts: any[]
  ): Promise<LearningPattern[]> {
    const patterns: LearningPattern[] = [];

    // Паттерн длительности сессий
    const sessionDurations = sessions
      .map((s) => s.duration || 0)
      .filter((d) => d > 0);
    if (sessionDurations.length > 0) {
      const avgDuration =
        sessionDurations.reduce((sum, d) => sum + d, 0) /
        sessionDurations.length;
      const variance =
        sessionDurations.reduce(
          (sum, d) => sum + Math.pow(d - avgDuration, 2),
          0
        ) / sessionDurations.length;

      patterns.push({
        patternId: "session_duration_consistency",
        type: "session_duration",
        description: `Пользователь ${
          variance < 10000 ? "стабильно" : "нестабильно"
        } проводит время в приложении`,
        confidence: Math.min(0.9, 1 - variance / 100000),
        data: {
          averageDuration: avgDuration,
          variance,
          consistency: variance < 10000,
        },
        lastObserved: Date.now(),
      });
    }

    // Паттерн завершения
    const completionRates = sessions.map(
      (s) => s.blocksCompleted / Math.max(s.totalBlocks, 1)
    );
    const avgCompletionRate =
      completionRates.reduce((sum, r) => sum + r, 0) / completionRates.length;

    patterns.push({
      patternId: "completion_behavior",
      type: "completion_rate",
      description: `Средний процент завершения: ${Math.round(
        avgCompletionRate * 100
      )}%`,
      confidence: 0.85,
      data: {
        averageCompletionRate: avgCompletionRate,
        trend: avgCompletionRate > 0.7 ? "improving" : "needs_attention",
      },
      lastObserved: Date.now(),
    });

    // Паттерн повторных попыток
    const retryPattern = attempts.filter((a) =>
      a.questions.some((q) => !q.isCorrect)
    ).length;
    patterns.push({
      patternId: "retry_behavior",
      type: "retry_behavior",
      description: `Пользователь делает ${retryPattern} повторных попыток`,
      confidence: 0.8,
      data: {
        retryCount: retryPattern,
        persistence: retryPattern > 2 ? "high" : "low",
      },
      lastObserved: Date.now(),
    });

    return patterns;
  }

  // Расчет метрик вовлеченности
  private async calculateEngagementMetrics(
    userId: string,
    sessions: any[],
    attempts: any[]
  ): Promise<EngagementMetrics> {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentSessions = sessions.filter(
      (s) => s.startTime >= weekAgo.getTime()
    );
    const sessionFrequency = recentSessions.length / 7;

    const sessionDurations = sessions
      .map((s) => s.duration || 0)
      .filter((d) => d > 0);
    const averageSessionDuration =
      sessionDurations.length > 0
        ? sessionDurations.reduce((sum, d) => sum + d, 0) /
          sessionDurations.length /
          60000 // В минутах
        : 0;

    const completionRate =
      sessions.length > 0
        ? sessions.filter((s) => s.blocksCompleted === s.totalBlocks).length /
          sessions.length
        : 0;

    const engagementScore = Math.min(
      100,
      sessionFrequency * 20 + averageSessionDuration * 2 + completionRate * 40
    );

    const motivationLevel =
      engagementScore > 70 ? "high" : engagementScore > 40 ? "medium" : "low";

    return {
      sessionFrequency,
      averageSessionDuration,
      completionRate,
      retentionRate: 0.85, // TODO: Реализовать расчет
      engagementScore,
      motivationLevel,
      dropoffPoints: await this.identifyDropoffPoints(sessions),
    };
  }

  // Идентификация точек оттока
  private async identifyDropoffPoints(
    sessions: any[]
  ): Promise<DropoffPoint[]> {
    const dropoffPoints: DropoffPoint[] = [
      {
        screen: "TheoryBlock",
        frequency: 0.3,
        averageTimeBeforeDropoff: 120000, // 2 минуты
        commonReasons: ["Сложный контент", "Длинные тексты"],
      },
      {
        screen: "MiniTest",
        frequency: 0.2,
        averageTimeBeforeDropoff: 30000, // 30 секунд
        commonReasons: ["Сложные вопросы", "Неуверенность в ответах"],
      },
    ];

    return dropoffPoints;
  }

  // Расчет трендов производительности
  private async calculatePerformanceTrends(
    userId: string,
    attempts: any[]
  ): Promise<PerformanceTrend[]> {
    const trends: PerformanceTrend[] = [];

    // Тренд среднего балла
    const scoreData = attempts.map((a) => ({
      date: new Date(a.startTime).toISOString().split("T")[0],
      value: a.score,
    }));

    if (scoreData.length > 1) {
      const trend = this.calculateTrend(scoreData.map((d) => d.value));
      trends.push({
        metric: "average_score",
        values: scoreData,
        trend:
          trend.slope > 0.5
            ? "improving"
            : trend.slope < -0.5
            ? "declining"
            : "stable",
        slope: trend.slope,
        confidence: trend.confidence,
      });
    }

    return trends;
  }

  // Анализ предпочтений контента
  private async analyzeContentPreferences(
    userId: string,
    sessions: any[],
    attempts: any[]
  ): Promise<ContentPreferences> {
    // Анализируем предпочитаемые темы
    const topicInteractions = sessions.reduce((acc, session) => {
      acc[session.topicId] = (acc[session.topicId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteTopics = Object.entries(topicInteractions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topicId]) => topicId);

    // Определяем предпочитаемую сложность
    const scores = attempts.map((a) => a.score);
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;
    const preferredDifficulty = averageScore / 100;

    return {
      favoriteTopics,
      avoidedTopics: [], // TODO: Реализовать анализ
      preferredDifficulty,
      preferredContentType: "interactive", // TODO: Реализовать анализ
      learningStyle: "visual", // TODO: Реализовать анализ
      pacePreference: "normal", // TODO: Реализовать анализ
    };
  }

  // Анализ временных паттернов
  private async analyzeTimePatterns(
    userId: string,
    sessions: any[]
  ): Promise<TimePatterns> {
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);

    sessions.forEach((session) => {
      const date = new Date(session.startTime);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
    });

    const preferredStudyTimes = hourCounts.map((count, hour) => ({
      hour,
      frequency: count,
    }));
    const weeklyPattern = dayCounts.map((sessions, day) => ({ day, sessions }));

    return {
      preferredStudyTimes,
      weeklyPattern,
      sessionGaps: [], // TODO: Реализовать анализ
      optimalSessionDuration: 30, // TODO: Реализовать анализ
      breakPatterns: [], // TODO: Реализовать анализ
    };
  }

  // Анализ социальных паттернов
  private async analyzeSocialPatterns(userId: string): Promise<SocialPatterns> {
    return {
      comparisonGroup: "grade_9_ege",
      percentileRank: 75,
      competitiveSpirit: "medium",
      socialMotivation: 0.6,
      peerInfluence: 0.4,
    };
  }

  // Генерация предиктивных инсайтов
  async generatePredictiveInsights(
    userId: string
  ): Promise<PredictiveInsights> {
    const behaviorProfile = await this.analyzeUserBehavior(userId);
    const predictions: Prediction[] = [];
    const recommendations: InsightRecommendation[] = [];
    const riskFactors: RiskFactor[] = [];
    const opportunities: Opportunity[] = [];

    // Предсказание вероятности завершения
    const completionProbability =
      this.calculateCompletionProbability(behaviorProfile);
    predictions.push({
      type: "completion_probability",
      value: completionProbability,
      confidence: 0.8,
      timeframe: 30,
      factors: ["engagement_score", "completion_rate", "motivation_level"],
    });

    // Предсказание риска оттока
    const dropoutRisk = this.calculateDropoutRisk(behaviorProfile);
    predictions.push({
      type: "dropout_risk",
      value: dropoutRisk,
      confidence: 0.75,
      timeframe: 7,
      factors: ["session_frequency", "engagement_trend", "performance_decline"],
    });

    // Рекомендации
    if (dropoutRisk > 0.7) {
      recommendations.push({
        type: "intervention",
        priority: "high",
        title: "Высокий риск оттока",
        description: "Рекомендуем персонализированную поддержку и мотивацию",
        expectedImpact: 0.3,
        implementation: "Отправить персонализированное сообщение с поддержкой",
      });
    }

    if (behaviorProfile.engagementMetrics.engagementScore < 50) {
      recommendations.push({
        type: "optimization",
        priority: "medium",
        title: "Низкая вовлеченность",
        description:
          "Оптимизировать контент и интерфейс для повышения вовлеченности",
        expectedImpact: 0.25,
        implementation: "A/B тестирование различных подходов к контенту",
      });
    }

    // Факторы риска
    if (behaviorProfile.engagementMetrics.sessionFrequency < 0.5) {
      riskFactors.push({
        factor: "Низкая частота сессий",
        severity: "medium",
        probability: 0.6,
        mitigation: "Увеличить частоту уведомлений и мотивационных сообщений",
      });
    }

    // Возможности
    if (behaviorProfile.engagementMetrics.averageScore > 80) {
      opportunities.push({
        area: "Продвинутый контент",
        potential: 0.4,
        effort: 0.3,
        roi: 1.3,
        description: "Пользователь готов к более сложному материалу",
      });
    }

    const insights: PredictiveInsights = {
      userId,
      predictions,
      recommendations,
      riskFactors,
      opportunities,
      lastUpdated: Date.now(),
    };

    this.predictiveInsights.set(userId, insights);
    await this.savePredictiveInsights();

    return insights;
  }

  // Анализ когорт
  async analyzeCohorts(): Promise<CohortAnalysis[]> {
    const allProfiles = Array.from(this.behaviorProfiles.values());

    // Обновляем когорты
    for (const cohort of this.cohortAnalyses.values()) {
      const cohortUsers = allProfiles.filter((profile) => {
        switch (cohort.cohortType) {
          case "goal":
            return profile.contentPreferences.favoriteTopics.includes(
              cohort.cohortValue
            );
          case "behavior":
            return profile.engagementMetrics.engagementScore > 70;
          default:
            return false;
        }
      });

      cohort.users = cohortUsers.map((p) => p.userId);
      cohort.metrics = this.calculateCohortMetrics(cohortUsers);
      cohort.trends = this.calculateCohortTrends(cohortUsers);
    }

    await this.saveCohortAnalyses();
    return Array.from(this.cohortAnalyses.values());
  }

  // Расчет метрик когорты
  private calculateCohortMetrics(
    profiles: UserBehaviorProfile[]
  ): CohortMetrics {
    if (profiles.length === 0) {
      return {
        size: 0,
        retentionRate: 0,
        averageEngagement: 0,
        completionRate: 0,
        averageScore: 0,
        churnRate: 0,
      };
    }

    const averageEngagement =
      profiles.reduce(
        (sum, profile) => sum + profile.engagementMetrics.engagementScore,
        0
      ) / profiles.length;

    const completionRate =
      profiles.reduce(
        (sum, profile) => sum + profile.engagementMetrics.completionRate,
        0
      ) / profiles.length;

    const retentionRate = 0.85; // TODO: Реализовать расчет

    return {
      size: profiles.length,
      retentionRate,
      averageEngagement,
      completionRate,
      averageScore: 75, // TODO: Реализовать расчет
      churnRate: 1 - retentionRate,
    };
  }

  // Расчет трендов когорты
  private calculateCohortTrends(
    profiles: UserBehaviorProfile[]
  ): CohortTrend[] {
    const trends: CohortTrend[] = [];

    // Группируем по периодам (например, по неделям)
    const weeklyData = profiles.reduce((acc, profile) => {
      const week = Math.floor(
        (Date.now() - profile.lastUpdated) / (7 * 24 * 60 * 60 * 1000)
      );
      if (!acc[week]) {
        acc[week] = [];
      }
      acc[week].push(profile);
      return acc;
    }, {} as Record<number, UserBehaviorProfile[]>);

    // Рассчитываем тренды для каждого периода
    Object.entries(weeklyData).forEach(([week, weekProfiles]) => {
      const avgEngagement =
        weekProfiles.reduce(
          (sum, profile) => sum + profile.engagementMetrics.engagementScore,
          0
        ) / weekProfiles.length;

      const avgCompletion =
        weekProfiles.reduce(
          (sum, profile) => sum + profile.engagementMetrics.completionRate,
          0
        ) / weekProfiles.length;

      trends.push({
        period: `Week ${week}`,
        retentionRate: 0.85,
        engagementScore: avgEngagement,
        completionRate: avgCompletion,
      });
    });

    return trends;
  }

  // Расчет вероятности завершения
  private calculateCompletionProbability(
    behaviorProfile: UserBehaviorProfile
  ): number {
    const { engagementMetrics, performanceTrends } = behaviorProfile;

    let probability = 0.5; // Базовая вероятность

    // Фактор вовлеченности
    probability += (engagementMetrics.engagementScore / 100) * 0.3;

    // Фактор частоты сессий
    probability += Math.min(engagementMetrics.sessionFrequency / 2, 1) * 0.2;

    // Фактор тренда производительности
    const improvingTrend = performanceTrends.find(
      (t) => t.trend === "improving"
    );
    if (improvingTrend) {
      probability += 0.1;
    }

    return Math.min(probability, 1);
  }

  // Расчет риска оттока
  private calculateDropoutRisk(behaviorProfile: UserBehaviorProfile): number {
    const { engagementMetrics, performanceTrends } = behaviorProfile;

    let risk = 0.1; // Базовый риск

    // Фактор низкой вовлеченности
    if (engagementMetrics.engagementScore < 30) {
      risk += 0.4;
    } else if (engagementMetrics.engagementScore < 50) {
      risk += 0.2;
    }

    // Фактор низкой частоты сессий
    if (engagementMetrics.sessionFrequency < 0.3) {
      risk += 0.3;
    }

    // Фактор ухудшения производительности
    const decliningTrend = performanceTrends.find(
      (t) => t.trend === "declining"
    );
    if (decliningTrend) {
      risk += 0.2;
    }

    return Math.min(risk, 1);
  }

  // Расчет трендов когорты
  private calculateCohortTrends(
    profiles: UserBehaviorProfile[]
  ): CohortTrend[] {
    // TODO: Реализовать расчет трендов по периодам
    return [
      {
        period: "week_1",
        retentionRate: 0.9,
        engagementScore: 75,
        completionRate: 0.6,
      },
      {
        period: "week_2",
        retentionRate: 0.85,
        engagementScore: 78,
        completionRate: 0.65,
      },
    ];
  }

  // Вспомогательные методы

  private calculateCompletionProbability(profile: UserBehaviorProfile): number {
    const engagementWeight = 0.4;
    const performanceWeight = 0.3;
    const consistencyWeight = 0.3;

    const engagementScore = profile.engagementMetrics.engagementScore / 100;
    const performanceScore =
      profile.performanceTrends
        .find((t) => t.metric === "average_score")
        ?.values.slice(-1)[0]?.value / 100 || 0.7;
    const consistencyScore = profile.learningPatterns.find(
      (p) => p.type === "session_duration"
    )?.data.consistency
      ? 0.9
      : 0.5;

    return (
      engagementScore * engagementWeight +
      performanceScore * performanceWeight +
      consistencyScore * consistencyWeight
    );
  }

  private calculateDropoutRisk(profile: UserBehaviorProfile): number {
    const lowEngagementRisk =
      profile.engagementMetrics.engagementScore < 40 ? 0.8 : 0.2;
    const decliningPerformanceRisk = profile.performanceTrends.find(
      (t) => t.trend === "declining"
    )
      ? 0.6
      : 0.1;
    const lowFrequencyRisk =
      profile.engagementMetrics.sessionFrequency < 0.3 ? 0.7 : 0.2;

    return Math.min(
      1,
      (lowEngagementRisk + decliningPerformanceRisk + lowFrequencyRisk) / 3
    );
  }

  private calculateTrend(values: number[]): {
    slope: number;
    confidence: number;
  } {
    if (values.length < 2) return { slope: 0, confidence: 0 };

    const n = values.length;
    const x = Array.from({ length: n }, (_, i) => i);

    const sumX = x.reduce((sum, xi) => sum + xi, 0);
    const sumY = values.reduce((sum, yi) => sum + yi, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * values[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const confidence = Math.min(0.95, 0.5 + Math.abs(slope) * 0.3);

    return { slope, confidence };
  }

  // Приватные методы для работы с хранилищем

  private async loadData(): Promise<void> {
    try {
      const behaviorData = await AsyncStorage.getItem(
        STORAGE_KEYS.BEHAVIOR_PROFILES
      );
      if (behaviorData) {
        const profiles = JSON.parse(behaviorData);
        this.behaviorProfiles = new Map(
          profiles.map((p: UserBehaviorProfile) => [p.userId, p])
        );
      }

      const insightsData = await AsyncStorage.getItem(
        STORAGE_KEYS.PREDICTIVE_INSIGHTS
      );
      if (insightsData) {
        const insights = JSON.parse(insightsData);
        this.predictiveInsights = new Map(
          insights.map((i: PredictiveInsights) => [i.userId, i])
        );
      }

      const cohortData = await AsyncStorage.getItem(
        STORAGE_KEYS.COHORT_ANALYSIS
      );
      if (cohortData) {
        const cohorts = JSON.parse(cohortData);
        this.cohortAnalyses = new Map(
          cohorts.map((c: CohortAnalysis) => [c.cohortId, c])
        );
      }
    } catch {
      this.behaviorProfiles = new Map();
      this.predictiveInsights = new Map();
      this.cohortAnalyses = new Map();
    }
  }

  private async saveBehaviorProfiles(): Promise<void> {
    const profiles = Array.from(this.behaviorProfiles.values());
    await AsyncStorage.setItem(
      STORAGE_KEYS.BEHAVIOR_PROFILES,
      JSON.stringify(profiles)
    );
  }

  private async savePredictiveInsights(): Promise<void> {
    const insights = Array.from(this.predictiveInsights.values());
    await AsyncStorage.setItem(
      STORAGE_KEYS.PREDICTIVE_INSIGHTS,
      JSON.stringify(insights)
    );
  }

  private async saveCohortAnalyses(): Promise<void> {
    const cohorts = Array.from(this.cohortAnalyses.values());
    await AsyncStorage.setItem(
      STORAGE_KEYS.COHORT_ANALYSIS,
      JSON.stringify(cohorts)
    );
  }

  // Очистка данных
  async clearAllData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.BEHAVIOR_PROFILES),
      AsyncStorage.removeItem(STORAGE_KEYS.PREDICTIVE_INSIGHTS),
      AsyncStorage.removeItem(STORAGE_KEYS.COHORT_ANALYSIS),
      AsyncStorage.removeItem(STORAGE_KEYS.ENGAGEMENT_EVENTS),
      AsyncStorage.removeItem(STORAGE_KEYS.PERFORMANCE_DATA),
    ]);
  }
}

export const enhancedAnalytics = EnhancedAnalytics.getInstance();
