// Типы для A/B тестирования
export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: "active" | "paused" | "completed";
  startDate: number;
  endDate?: number;
  variants: ABVariant[];
  metrics: ABMetric[];
  targetAudience: TargetAudience;
  trafficAllocation: number;
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  trafficPercentage: number;
}

export interface ABMetric {
  name: string;
  type: "conversion" | "engagement" | "retention" | "custom";
  goal: "maximize" | "minimize";
  weight: number;
}

export interface TargetAudience {
  userSegments: string[];
  conditions: AudienceCondition[];
}

export interface AudienceCondition {
  field: string;
  operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains";
  value: any;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  timestamp: number;
  metrics: Record<string, number>;
}

export interface ABTestStats {
  testId: string;
  variantId: string;
  impressions: number;
  conversions: number;
  conversionRate: number;
  averageEngagement: number;
  confidenceLevel: number;
  isSignificant: boolean;
  winner: boolean;
}

// Типы для ML системы
export interface UserFeatureVector {
  userId: string;
  features: {
    grade: number;
    goal: string;
    totalStudyTime: number;
    averageSessionDuration: number;
    completionRate: number;
    averageScore: number;
    streakDays: number;
    preferredTopics: string[];
    weakTopics: string[];
    strongTopics: string[];
    preferredTimeOfDay: string;
    studyFrequency: number;
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
    difficulty: number;
    estimatedTime: number;
    section: string;
    tags: string[];
    popularity: number;
    averageRating: number;
    completionRate: number;
    averageScore: number;
    retryRate: number;
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
  sessionFrequency: number;
  averageSessionDuration: number;
  completionRate: number;
  retentionRate: number;
  engagementScore: number;
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
  timeframe: number;
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


