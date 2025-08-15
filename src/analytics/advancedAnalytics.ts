import AsyncStorage from '@react-native-async-storage/async-storage';

// Типы для аналитики
export interface StudySession {
  id: string;
  topicId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  blocksCompleted: number;
  totalBlocks: number;
  interactions: UserInteraction[];
}

export interface UserInteraction {
  type: 'block_view' | 'block_complete' | 'test_start' | 'test_answer' | 'test_complete' | 'topic_start' | 'topic_complete';
  timestamp: number;
  data?: Record<string, any>;
}

export interface TestAttempt {
  id: string;
  topicId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  questions: QuestionAttempt[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  mistakes: QuestionMistake[];
}

export interface QuestionAttempt {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
  hintsUsed: number;
}

export interface QuestionMistake {
  questionId: string;
  selectedAnswer: string;
  correctAnswer: string;
  topicId: string;
  timestamp: number;
  attempts: number;
}

export interface UserProfile {
  userId: string;
  grade: string;
  goal: string;
  preferredLearningTime: string;
  averageSessionDuration: number;
  totalStudyTime: number;
  topicsCompleted: number;
  averageScore: number;
  streakDays: number;
  lastActiveDate: string;
  weakTopics: string[];
  strongTopics: string[];
}

export interface LearningPattern {
  topicId: string;
  averageTimePerBlock: number;
  completionRate: number;
  mistakeFrequency: number;
  retryRate: number;
  preferredTimeOfDay: string;
  sessionFrequency: number;
}

export interface Recommendation {
  type: 'review_weak_topic' | 'continue_streak' | 'try_new_topic' | 'practice_mistakes' | 'complete_incomplete';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  topicId?: string;
  reason: string;
  estimatedTime: number;
}

// Ключи для AsyncStorage
const STORAGE_KEYS = {
  STUDY_SESSIONS: 'advanced_analytics_study_sessions',
  TEST_ATTEMPTS: 'advanced_analytics_test_attempts',
  USER_PROFILE: 'advanced_analytics_user_profile',
  LEARNING_PATTERNS: 'advanced_analytics_learning_patterns',
  QUESTION_MISTAKES: 'advanced_analytics_question_mistakes',
  DAILY_STATS: 'advanced_analytics_daily_stats',
};

class AdvancedAnalytics {
  private static instance: AdvancedAnalytics;

  private constructor() {}

  static getInstance(): AdvancedAnalytics {
    if (!AdvancedAnalytics.instance) {
      AdvancedAnalytics.instance = new AdvancedAnalytics();
    }
    return AdvancedAnalytics.instance;
  }

  // === СЕССИИ ИЗУЧЕНИЯ ===

  async startStudySession(topicId: string): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const session: StudySession = {
      id: sessionId,
      topicId,
      startTime: Date.now(),
      blocksCompleted: 0,
      totalBlocks: 0,
      interactions: [{
        type: 'topic_start',
        timestamp: Date.now(),
        data: { topicId }
      }]
    };

    const sessions = await this.getStudySessions();
    sessions.push(session);
    await this.saveStudySessions(sessions);

    return sessionId;
  }

  async endStudySession(sessionId: string, blocksCompleted: number, totalBlocks: number): Promise<void> {
    const sessions = await this.getStudySessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      const session = sessions[sessionIndex];
      session.endTime = Date.now();
      session.duration = session.endTime - session.startTime;
      session.blocksCompleted = blocksCompleted;
      session.totalBlocks = totalBlocks;
      session.interactions.push({
        type: 'topic_complete',
        timestamp: Date.now(),
        data: { blocksCompleted, totalBlocks }
      });

      await this.saveStudySessions(sessions);
      await this.updateUserProfile();
    }
  }

  async addInteraction(sessionId: string, interaction: Omit<UserInteraction, 'timestamp'>): Promise<void> {
    const sessions = await this.getStudySessions();
    const sessionIndex = sessions.findIndex(s => s.id === sessionId);
    
    if (sessionIndex !== -1) {
      sessions[sessionIndex].interactions.push({
        ...interaction,
        timestamp: Date.now()
      });
      await this.saveStudySessions(sessions);
    }
  }

  // === ТЕСТОВЫЕ ПОПЫТКИ ===

  async startTestAttempt(topicId: string): Promise<string> {
    const attemptId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const attempt: TestAttempt = {
      id: attemptId,
      topicId,
      startTime: Date.now(),
      questions: [],
      score: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      mistakes: []
    };

    const attempts = await this.getTestAttempts();
    attempts.push(attempt);
    await this.saveTestAttempts(attempts);

    return attemptId;
  }

  async addQuestionAttempt(
    attemptId: string, 
    questionId: string, 
    selectedAnswer: string, 
    correctAnswer: string, 
    timeSpent: number,
    hintsUsed: number = 0
  ): Promise<void> {
    const attempts = await this.getTestAttempts();
    const attemptIndex = attempts.findIndex(a => a.id === attemptId);
    
    if (attemptIndex !== -1) {
      const isCorrect = selectedAnswer === correctAnswer;
      const questionAttempt: QuestionAttempt = {
        questionId,
        selectedAnswer,
        correctAnswer,
        isCorrect,
        timeSpent,
        hintsUsed
      };

      attempts[attemptIndex].questions.push(questionAttempt);
      
      if (!isCorrect) {
        const mistake: QuestionMistake = {
          questionId,
          selectedAnswer,
          correctAnswer,
          topicId: attempts[attemptIndex].topicId,
          timestamp: Date.now(),
          attempts: 1
        };
        attempts[attemptIndex].mistakes.push(mistake);
        await this.addQuestionMistake(mistake);
      }

      await this.saveTestAttempts(attempts);
    }
  }

  async completeTestAttempt(attemptId: string): Promise<void> {
    const attempts = await this.getTestAttempts();
    const attemptIndex = attempts.findIndex(a => a.id === attemptId);
    
    if (attemptIndex !== -1) {
      const attempt = attempts[attemptIndex];
      attempt.endTime = Date.now();
      attempt.duration = attempt.endTime - attempt.startTime;
      attempt.totalQuestions = attempt.questions.length;
      attempt.correctAnswers = attempt.questions.filter(q => q.isCorrect).length;
      attempt.score = (attempt.correctAnswers / attempt.totalQuestions) * 100;

      await this.saveTestAttempts(attempts);
      await this.updateUserProfile();
      await this.updateLearningPatterns(attempt.topicId);
    }
  }

  // === ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ ===

  async updateUserProfile(): Promise<void> {
    const sessions = await this.getStudySessions();
    const attempts = await this.getTestAttempts();
    
    const totalStudyTime = sessions.reduce((total, session) => 
      total + (session.duration || 0), 0);
    
    const topicsCompleted = new Set(sessions.map(s => s.topicId)).size;
    
    const averageScore = attempts.length > 0 
      ? attempts.reduce((total, attempt) => total + attempt.score, 0) / attempts.length 
      : 0;

    const weakTopics = await this.getWeakTopics();
    const strongTopics = await this.getStrongTopics();

    const profile: UserProfile = {
      userId: 'user_1', // TODO: Get from auth
      grade: '9', // TODO: Get from settings
      goal: 'oge', // TODO: Get from settings
      preferredLearningTime: await this.getPreferredLearningTime(),
      averageSessionDuration: await this.getAverageSessionDuration(),
      totalStudyTime,
      topicsCompleted,
      averageScore,
      streakDays: await this.calculateStreakDays(),
      lastActiveDate: new Date().toISOString().split('T')[0],
      weakTopics,
      strongTopics
    };

    await this.saveUserProfile(profile);
  }

  // === АНАЛИЗ ОШИБОК ===

  async addQuestionMistake(mistake: QuestionMistake): Promise<void> {
    const mistakes = await this.getQuestionMistakes();
    const existingMistakeIndex = mistakes.findIndex(m => 
      m.questionId === mistake.questionId && m.topicId === mistake.topicId
    );

    if (existingMistakeIndex !== -1) {
      mistakes[existingMistakeIndex].attempts += 1;
      mistakes[existingMistakeIndex].timestamp = Date.now();
    } else {
      mistakes.push(mistake);
    }

    await this.saveQuestionMistakes(mistakes);
  }

  async getWeakTopics(): Promise<string[]> {
    const mistakes = await this.getQuestionMistakes();
    const topicMistakes = mistakes.reduce((acc, mistake) => {
      acc[mistake.topicId] = (acc[mistake.topicId] || 0) + mistake.attempts;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(topicMistakes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([topicId]) => topicId);
  }

  async getStrongTopics(): Promise<string[]> {
    const attempts = await this.getTestAttempts();
    const topicScores = attempts.reduce((acc, attempt) => {
      if (!acc[attempt.topicId]) {
        acc[attempt.topicId] = { total: 0, count: 0 };
      }
      acc[attempt.topicId].total += attempt.score;
      acc[attempt.topicId].count += 1;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return Object.entries(topicScores)
      .map(([topicId, { total, count }]) => ({
        topicId,
        averageScore: total / count
      }))
      .filter(topic => topic.averageScore >= 80)
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 3)
      .map(topic => topic.topicId);
  }

  // === РЕКОМЕНДАЦИИ ===

  async generateRecommendations(): Promise<Recommendation[]> {
    const profile = await this.getUserProfile();
    const recommendations: Recommendation[] = [];

    // Рекомендация по слабым темам
    if (profile && profile.weakTopics && profile.weakTopics.length > 0) {
      recommendations.push({
        type: 'review_weak_topic',
        priority: 'high',
        title: 'Повторите слабые темы',
        description: `Рекомендуем повторить темы: ${profile.weakTopics.join(', ')}`,
        topicId: profile.weakTopics[0],
        reason: 'Много ошибок в этих темах',
        estimatedTime: 15
      });
    }

    // Рекомендация по продолжению серии
    if (profile && profile.streakDays && profile.streakDays > 0) {
      recommendations.push({
        type: 'continue_streak',
        priority: 'medium',
        title: 'Продолжите серию!',
        description: `У вас ${profile.streakDays} дней подряд! Не прерывайте серию`,
        reason: 'Мотивация продолжать обучение',
        estimatedTime: 10
      });
    }

    // Рекомендация по новым темам
    const completedTopics = new Set(await this.getCompletedTopics());
    const allTopics = ['money', 'market', 'human-nature']; // TODO: Get from content
    const newTopics = allTopics.filter(topic => !completedTopics.has(topic));
    
    if (newTopics.length > 0) {
      recommendations.push({
        type: 'try_new_topic',
        priority: 'medium',
        title: 'Попробуйте новую тему',
        description: `Изучите тему: ${newTopics[0]}`,
        topicId: newTopics[0],
        reason: 'Расширьте знания',
        estimatedTime: 20
      });
    }

    // Рекомендация по практике ошибок
    const mistakes = await this.getQuestionMistakes();
    if (mistakes?.length > 0) {
      recommendations.push({
        type: 'practice_mistakes',
        priority: 'high',
        title: 'Практика ошибок',
        description: `Повторите ${mistakes.length} вопросов с ошибками`,
        reason: 'Закрепите правильные ответы',
        estimatedTime: 15
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // === СТАТИСТИКА ===

  async getDailyStats(date: string): Promise<any> {
    const sessions = await this.getStudySessions();
    const attempts = await this.getTestAttempts();
    
    const dayStart = new Date(date).getTime();
    const dayEnd = dayStart + 24 * 60 * 60 * 1000;

    const daySessions = sessions.filter(s => 
      s.startTime >= dayStart && s.startTime < dayEnd
    );
    
    const dayAttempts = attempts.filter(a => 
      a.startTime >= dayStart && a.startTime < dayEnd
    );

    return {
      date,
      sessionsCount: daySessions.length,
      totalStudyTime: daySessions.reduce((total, s) => total + (s.duration || 0), 0),
      testsCompleted: dayAttempts.length,
      averageScore: dayAttempts.length > 0 
        ? dayAttempts.reduce((total, a) => total + a.score, 0) / dayAttempts.length 
        : 0,
      topicsStudied: new Set(daySessions.map(s => s.topicId)).size
    };
  }

  async getWeeklyStats(): Promise<any[]> {
    const today = new Date();
    const stats = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      stats.push(await this.getDailyStats(dateStr));
    }
    
    return stats;
  }

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  private async getPreferredLearningTime(): Promise<string> {
    const sessions = await this.getStudySessions();
    const hourCounts = new Array(24).fill(0);
    
    sessions.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      hourCounts[hour]++;
    });
    
    const maxHour = hourCounts.indexOf(Math.max(...hourCounts));
    return `${maxHour}:00`;
  }

  private async getAverageSessionDuration(): Promise<number> {
    const sessions = await this.getStudySessions();
    const completedSessions = sessions.filter(s => s.duration);
    
    if (completedSessions.length === 0) return 0;
    
    return completedSessions.reduce((total, s) => total + (s.duration || 0), 0) / completedSessions.length;
  }

  private async calculateStreakDays(): Promise<number> {
    const sessions = await this.getStudySessions();
    const dates = [...new Set(sessions.map(s => 
      new Date(s.startTime).toISOString().split('T')[0]
    ))].sort();
    
    if (dates.length === 0) return 0;
    
    let streak = 1;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = dates.length - 1; i > 0; i--) {
      const current = new Date(dates[i]);
      const previous = new Date(dates[i - 1]);
      const diffDays = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private async getCompletedTopics(): Promise<string[]> {
    const sessions = await this.getStudySessions();
    return [...new Set(sessions.map(s => s.topicId))];
  }

  private async updateLearningPatterns(topicId: string): Promise<void> {
    const sessions = await this.getStudySessions();
    const attempts = await this.getTestAttempts();
    const mistakes = await this.getQuestionMistakes();
    
    const topicSessions = sessions.filter(s => s.topicId === topicId);
    const topicAttempts = attempts.filter(a => a.topicId === topicId);
    const topicMistakes = mistakes.filter(m => m.topicId === topicId);
    
    const pattern: LearningPattern = {
      topicId,
      averageTimePerBlock: topicSessions.length > 0 
        ? topicSessions.reduce((total, s) => total + (s.duration || 0), 0) / topicSessions.length 
        : 0,
      completionRate: topicSessions.length > 0 
        ? topicSessions.filter(s => s.blocksCompleted === s.totalBlocks).length / topicSessions.length 
        : 0,
      mistakeFrequency: topicMistakes.length / Math.max(topicAttempts.length, 1),
      retryRate: topicMistakes.filter(m => m.attempts > 1).length / Math.max(topicMistakes.length, 1),
      preferredTimeOfDay: await this.getPreferredLearningTime(),
      sessionFrequency: topicSessions.length
    };
    
    const patterns = await this.getLearningPatterns();
    const existingIndex = patterns.findIndex(p => p.topicId === topicId);
    
    if (existingIndex !== -1) {
      patterns[existingIndex] = pattern;
    } else {
      patterns.push(pattern);
    }
    
    await this.saveLearningPatterns(patterns);
  }

  // === ПРИВАТНЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С STORAGE ===

  private async getStudySessions(): Promise<StudySession[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.STUDY_SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async saveStudySessions(sessions: StudySession[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.STUDY_SESSIONS, JSON.stringify(sessions));
  }

  private async getTestAttempts(): Promise<TestAttempt[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TEST_ATTEMPTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async saveTestAttempts(attempts: TestAttempt[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TEST_ATTEMPTS, JSON.stringify(attempts));
  }

  private async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private async saveUserProfile(profile: UserProfile): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  }

  private async getLearningPatterns(): Promise<LearningPattern[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LEARNING_PATTERNS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async saveLearningPatterns(patterns: LearningPattern[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LEARNING_PATTERNS, JSON.stringify(patterns));
  }

  private async getQuestionMistakes(): Promise<QuestionMistake[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.QUESTION_MISTAKES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private async saveQuestionMistakes(mistakes: QuestionMistake[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.QUESTION_MISTAKES, JSON.stringify(mistakes));
  }

  // === ПУБЛИЧНЫЕ МЕТОДЫ ДЛЯ ДОСТУПА К ДАННЫМ ===

  async getAnalyticsSummary(): Promise<any> {
    const profile = await this.getUserProfile();
    const recommendations = await this.generateRecommendations();
    const weeklyStats = await this.getWeeklyStats();
    
    return {
      profile,
      recommendations,
      weeklyStats,
      totalStudyTime: profile?.totalStudyTime || 0,
      averageScore: profile?.averageScore || 0,
      streakDays: profile?.streakDays || 0,
      topicsCompleted: profile?.topicsCompleted || 0
    };
  }

  async clearAllData(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.STUDY_SESSIONS),
      AsyncStorage.removeItem(STORAGE_KEYS.TEST_ATTEMPTS),
      AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE),
      AsyncStorage.removeItem(STORAGE_KEYS.LEARNING_PATTERNS),
      AsyncStorage.removeItem(STORAGE_KEYS.QUESTION_MISTAKES),
      AsyncStorage.removeItem(STORAGE_KEYS.DAILY_STATS),
    ]);
  }
}

export const advancedAnalytics = AdvancedAnalytics.getInstance();
