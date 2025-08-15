import { useState, useEffect, useCallback } from 'react';
import { advancedAnalytics, StudySession, TestAttempt, UserProfile, Recommendation } from '../analytics/advancedAnalytics';

export function useAdvancedAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentTestId, setCurrentTestId] = useState<string | null>(null);

  // Загрузка данных аналитики
  const loadAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await advancedAnalytics.getAnalyticsSummary();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Инициализация при монтировании
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  // === СЕССИИ ИЗУЧЕНИЯ ===

  const startStudySession = useCallback(async (topicId: string): Promise<string> => {
    try {
      const sessionId = await advancedAnalytics.startStudySession(topicId);
      setCurrentSessionId(sessionId);
      return sessionId;
    } catch (error) {
      console.error('Failed to start study session:', error);
      throw error;
    }
  }, []);

  const endStudySession = useCallback(async (blocksCompleted: number, totalBlocks: number): Promise<void> => {
    if (!currentSessionId) return;
    
    try {
      await advancedAnalytics.endStudySession(currentSessionId, blocksCompleted, totalBlocks);
      setCurrentSessionId(null);
      await loadAnalyticsData(); // Обновляем данные
    } catch (error) {
      console.error('Failed to end study session:', error);
      throw error;
    }
  }, [currentSessionId, loadAnalyticsData]);

  const addInteraction = useCallback(async (interaction: any): Promise<void> => {
    if (!currentSessionId) return;
    
    try {
      await advancedAnalytics.addInteraction(currentSessionId, interaction);
    } catch (error) {
      console.error('Failed to add interaction:', error);
    }
  }, [currentSessionId]);

  // === ТЕСТОВЫЕ ПОПЫТКИ ===

  const startTestAttempt = useCallback(async (topicId: string): Promise<string> => {
    try {
      const testId = await advancedAnalytics.startTestAttempt(topicId);
      setCurrentTestId(testId);
      return testId;
    } catch (error) {
      console.error('Failed to start test attempt:', error);
      throw error;
    }
  }, []);

  const addQuestionAttempt = useCallback(async (
    questionId: string,
    selectedAnswer: string,
    correctAnswer: string,
    timeSpent: number,
    hintsUsed: number = 0
  ): Promise<void> => {
    if (!currentTestId) return;
    
    try {
      await advancedAnalytics.addQuestionAttempt(
        currentTestId,
        questionId,
        selectedAnswer,
        correctAnswer,
        timeSpent,
        hintsUsed
      );
    } catch (error) {
      console.error('Failed to add question attempt:', error);
    }
  }, [currentTestId]);

  const completeTestAttempt = useCallback(async (): Promise<void> => {
    if (!currentTestId) return;
    
    try {
      await advancedAnalytics.completeTestAttempt(currentTestId);
      setCurrentTestId(null);
      await loadAnalyticsData(); // Обновляем данные
    } catch (error) {
      console.error('Failed to complete test attempt:', error);
      throw error;
    }
  }, [currentTestId, loadAnalyticsData]);

  // === ПОЛУЧЕНИЕ ДАННЫХ ===

  const getProfile = useCallback((): UserProfile | null => {
    return analyticsData?.profile || null;
  }, [analyticsData]);

  const getRecommendations = useCallback((): Recommendation[] => {
    return analyticsData?.recommendations || [];
  }, [analyticsData]);

  const getWeeklyStats = useCallback((): any[] => {
    return analyticsData?.weeklyStats || [];
  }, [analyticsData]);

  const getHighPriorityRecommendations = useCallback((): Recommendation[] => {
    return getRecommendations().filter(rec => rec.priority === 'high');
  }, [getRecommendations]);

  const getMediumPriorityRecommendations = useCallback((): Recommendation[] => {
    return getRecommendations().filter(rec => rec.priority === 'medium');
  }, [getRecommendations]);

  // === ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ===

  const formatStudyTime = useCallback((milliseconds: number): string => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  }, []);

  const formatScore = useCallback((score: number): string => {
    return `${Math.round(score)}%`;
  }, []);

  const getProgressPercentage = useCallback((completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  }, []);

  const getStreakEmoji = useCallback((streakDays: number): string => {
    if (streakDays >= 7) return '🔥';
    if (streakDays >= 3) return '⚡';
    if (streakDays >= 1) return '✨';
    return '💪';
  }, []);

  const getScoreColor = useCallback((score: number): string => {
    if (score >= 90) return '#10B981'; // green
    if (score >= 70) return '#F59E0B'; // yellow
    if (score >= 50) return '#F97316'; // orange
    return '#EF4444'; // red
  }, []);

  // === ОЧИСТКА ДАННЫХ ===

  const clearAllData = useCallback(async (): Promise<void> => {
    try {
      await advancedAnalytics.clearAllData();
      await loadAnalyticsData();
    } catch (error) {
      console.error('Failed to clear analytics data:', error);
      throw error;
    }
  }, [loadAnalyticsData]);

  return {
    // Состояние
    isLoading,
    analyticsData,
    currentSessionId,
    currentTestId,
    
    // Сессии изучения
    startStudySession,
    endStudySession,
    addInteraction,
    
    // Тестовые попытки
    startTestAttempt,
    addQuestionAttempt,
    completeTestAttempt,
    
    // Получение данных
    getProfile,
    getRecommendations,
    getWeeklyStats,
    getHighPriorityRecommendations,
    getMediumPriorityRecommendations,
    
    // Вспомогательные методы
    formatStudyTime,
    formatScore,
    getProgressPercentage,
    getStreakEmoji,
    getScoreColor,
    
    // Управление данными
    loadAnalyticsData,
    clearAllData,
  };
}
