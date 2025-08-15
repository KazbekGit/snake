import AsyncStorage from '@react-native-async-storage/async-storage';
import { advancedAnalytics } from '../advancedAnalytics';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('AdvancedAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  });

  describe('Study Sessions', () => {
    it('should start a study session', async () => {
      const sessionId = await advancedAnalytics.startStudySession('money');
      
      expect(sessionId).toMatch(/^session_\d+_[a-z0-9]+$/);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'advanced_analytics_study_sessions',
        expect.stringContaining('money')
      );
    });

    it('should end a study session', async () => {
      const sessionId = await advancedAnalytics.startStudySession('money');
      
      await advancedAnalytics.endStudySession(sessionId, 3, 4);
      
      // Проверяем, что setItem был вызван
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should add interactions to session', async () => {
      const sessionId = await advancedAnalytics.startStudySession('money');
      
      await advancedAnalytics.addInteraction(sessionId, {
        type: 'block_view',
        data: { blockIndex: 0 }
      });
      
      // Проверяем, что setItem был вызван
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Test Attempts', () => {
    it('should start a test attempt', async () => {
      const attemptId = await advancedAnalytics.startTestAttempt('money');
      
      expect(attemptId).toMatch(/^test_\d+_[a-z0-9]+$/);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'advanced_analytics_test_attempts',
        expect.stringContaining('money')
      );
    });

    it('should add question attempts', async () => {
      const attemptId = await advancedAnalytics.startTestAttempt('money');
      
      await advancedAnalytics.addQuestionAttempt(
        attemptId,
        'question1',
        'option1',
        'option1',
        5000,
        0
      );
      
      // Проверяем, что setItem был вызван
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should complete test attempt', async () => {
      const attemptId = await advancedAnalytics.startTestAttempt('money');
      
      await advancedAnalytics.addQuestionAttempt(
        attemptId,
        'question1',
        'option1',
        'option1',
        5000,
        0
      );
      
      await advancedAnalytics.completeTestAttempt(attemptId);
      
      // Проверяем, что setItem был вызван
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('User Profile', () => {
    it('should update user profile', async () => {
      // Создаем тестовые данные
      const sessions = [
        {
          id: 'session1',
          topicId: 'money',
          startTime: Date.now() - 60000,
          endTime: Date.now(),
          duration: 60000,
          blocksCompleted: 2,
          totalBlocks: 4,
          interactions: []
        }
      ];
      
      const attempts = [
        {
          id: 'attempt1',
          topicId: 'money',
          startTime: Date.now() - 30000,
          endTime: Date.now(),
          duration: 30000,
          questions: [],
          score: 80,
          totalQuestions: 5,
          correctAnswers: 4,
          mistakes: []
        }
      ];
      
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(sessions))
        .mockResolvedValueOnce(JSON.stringify(attempts));
      
      await advancedAnalytics.updateUserProfile();
      
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'advanced_analytics_user_profile',
        expect.stringContaining('"totalStudyTime":60000')
      );
    });
  });

  describe('Recommendations', () => {
    it('should generate recommendations', async () => {
      // Создаем тестовые данные с ошибками
      const mistakes = [
        {
          questionId: 'question1',
          selectedAnswer: 'wrong',
          correctAnswer: 'correct',
          topicId: 'money',
          timestamp: Date.now(),
          attempts: 2
        }
      ];
      
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([])) // sessions
        .mockResolvedValueOnce(JSON.stringify([])) // attempts
        .mockResolvedValueOnce(JSON.stringify([])) // user profile
        .mockResolvedValueOnce(JSON.stringify([])) // learning patterns
        .mockResolvedValueOnce(JSON.stringify(mistakes)); // question mistakes
      
      const recommendations = await advancedAnalytics.generateRecommendations();
      
      expect(recommendations.length).toBeGreaterThan(0);
      expect(recommendations[0]).toHaveProperty('type');
      expect(recommendations[0]).toHaveProperty('priority');
      expect(recommendations[0]).toHaveProperty('title');
    });
  });

  describe('Analytics Summary', () => {
    it('should get analytics summary', async () => {
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify([])) // sessions
        .mockResolvedValueOnce(JSON.stringify([])) // attempts
        .mockResolvedValueOnce(JSON.stringify([])) // user profile
        .mockResolvedValueOnce(JSON.stringify([])) // learning patterns
        .mockResolvedValueOnce(JSON.stringify([])) // question mistakes
        .mockResolvedValueOnce(JSON.stringify([])); // daily stats
      
      const summary = await advancedAnalytics.getAnalyticsSummary();
      
      expect(summary).toHaveProperty('profile');
      expect(summary).toHaveProperty('recommendations');
      expect(summary).toHaveProperty('weeklyStats');
      expect(summary).toHaveProperty('totalStudyTime');
      expect(summary).toHaveProperty('averageScore');
      expect(summary).toHaveProperty('streakDays');
      expect(summary).toHaveProperty('topicsCompleted');
    });
  });

  describe('Data Management', () => {
    it('should clear all data', async () => {
      await advancedAnalytics.clearAllData();
      
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('advanced_analytics_study_sessions');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('advanced_analytics_test_attempts');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('advanced_analytics_user_profile');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('advanced_analytics_learning_patterns');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('advanced_analytics_question_mistakes');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('advanced_analytics_daily_stats');
    });
  });

  describe('Error Handling', () => {
    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const sessions = await (advancedAnalytics as any).getStudySessions();
      expect(sessions).toEqual([]);
    });

    it('should handle invalid session ID', async () => {
      await expect(advancedAnalytics.endStudySession('invalid-id', 1, 2)).resolves.toBeUndefined();
    });

    it('should handle invalid attempt ID', async () => {
      await expect(advancedAnalytics.completeTestAttempt('invalid-id')).resolves.toBeUndefined();
    });
  });
});
