import { renderHook, act } from '@testing-library/react-hooks';
import { advancedAnalytics } from '../../analytics/advancedAnalytics';

// Mock advancedAnalytics
jest.mock('../../analytics/advancedAnalytics', () => ({
  advancedAnalytics: {
    startStudySession: jest.fn(),
    endStudySession: jest.fn(),
    addInteraction: jest.fn(),
    startTestAttempt: jest.fn(),
    addQuestionAttempt: jest.fn(),
    completeTestAttempt: jest.fn(),
    getAnalyticsSummary: jest.fn(),
    clearAllData: jest.fn(),
  },
}));

describe('useAdvancedAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (advancedAnalytics.getAnalyticsSummary as jest.Mock).mockResolvedValue({
      profile: null,
      recommendations: [],
      weeklyStats: [],
      totalStudyTime: 0,
      averageScore: 0,
      streakDays: 0,
      topicsCompleted: 0,
    });
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    expect(result.current.isLoading).toBe(true);
    expect(result.current.analyticsData).toBe(null);
  });

  it('should load analytics data on mount', async () => {
    const mockData = {
      profile: { userId: 'user1' },
      recommendations: [{ type: 'review_weak_topic', priority: 'high' }],
      weeklyStats: [{ date: '2024-01-01', sessionsCount: 5 }],
      totalStudyTime: 3600000,
      averageScore: 85,
      streakDays: 7,
      topicsCompleted: 3,
    };
    
    (advancedAnalytics.getAnalyticsSummary as jest.Mock).mockResolvedValue(mockData);
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.analyticsData).toEqual(mockData);
  });

  it('should start study session', async () => {
    (advancedAnalytics.startStudySession as jest.Mock).mockResolvedValue('session_123');
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    await act(async () => {
      const sessionId = await result.current.startStudySession('money');
      expect(sessionId).toBe('session_123');
    });
    
    expect(advancedAnalytics.startStudySession).toHaveBeenCalledWith('money');
    expect(result.current.currentSessionId).toBe('session_123');
  });

  it('should end study session', async () => {
    (advancedAnalytics.startStudySession as jest.Mock).mockResolvedValue('session_123');
    (advancedAnalytics.endStudySession as jest.Mock).mockResolvedValue(undefined);
    (advancedAnalytics.getAnalyticsSummary as jest.Mock).mockResolvedValue({});
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.startStudySession('money');
    });
    
    await act(async () => {
      await result.current.endStudySession(3, 4);
    });
    
    expect(advancedAnalytics.endStudySession).toHaveBeenCalledWith('session_123', 3, 4);
    expect(result.current.currentSessionId).toBe(null);
  });

  it('should start test attempt', async () => {
    (advancedAnalytics.startTestAttempt as jest.Mock).mockResolvedValue('test_123');
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    await act(async () => {
      const testId = await result.current.startTestAttempt('money');
      expect(testId).toBe('test_123');
    });
    
    expect(advancedAnalytics.startTestAttempt).toHaveBeenCalledWith('money');
    expect(result.current.currentTestId).toBe('test_123');
  });

  it('should add question attempt', async () => {
    (advancedAnalytics.startTestAttempt as jest.Mock).mockResolvedValue('test_123');
    (advancedAnalytics.addQuestionAttempt as jest.Mock).mockResolvedValue(undefined);
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.startTestAttempt('money');
    });
    
    await act(async () => {
      await result.current.addQuestionAttempt(
        'question1',
        'option1',
        'option1',
        5000,
        0
      );
    });
    
    expect(advancedAnalytics.addQuestionAttempt).toHaveBeenCalledWith(
      'test_123',
      'question1',
      'option1',
      'option1',
      5000,
      0
    );
  });

  it('should complete test attempt', async () => {
    (advancedAnalytics.startTestAttempt as jest.Mock).mockResolvedValue('test_123');
    (advancedAnalytics.completeTestAttempt as jest.Mock).mockResolvedValue(undefined);
    (advancedAnalytics.getAnalyticsSummary as jest.Mock).mockResolvedValue({});
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.startTestAttempt('money');
    });
    
    await act(async () => {
      await result.current.completeTestAttempt();
    });
    
    expect(advancedAnalytics.completeTestAttempt).toHaveBeenCalledWith('test_123');
    expect(result.current.currentTestId).toBe(null);
  });

  it('should format study time correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    expect(result.current.formatStudyTime(3600000)).toBe('1ч 0м'); // 1 hour
    expect(result.current.formatStudyTime(300000)).toBe('5м'); // 5 minutes
    expect(result.current.formatStudyTime(90000)).toBe('1м'); // 1.5 minutes rounded down
  });

  it('should format score correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    expect(result.current.formatScore(85.7)).toBe('86%');
    expect(result.current.formatScore(100)).toBe('100%');
    expect(result.current.formatScore(0)).toBe('0%');
  });

  it('should get progress percentage', async () => {
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    expect(result.current.getProgressPercentage(3, 4)).toBe(75);
    expect(result.current.getProgressPercentage(0, 4)).toBe(0);
    expect(result.current.getProgressPercentage(4, 4)).toBe(100);
    expect(result.current.getProgressPercentage(1, 0)).toBe(0); // Division by zero
  });

  it('should get streak emoji', async () => {
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    expect(result.current.getStreakEmoji(0)).toBe('💪');
    expect(result.current.getStreakEmoji(1)).toBe('✨');
    expect(result.current.getStreakEmoji(3)).toBe('⚡');
    expect(result.current.getStreakEmoji(7)).toBe('🔥');
    expect(result.current.getStreakEmoji(10)).toBe('🔥');
  });

  it('should get score color', async () => {
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    expect(result.current.getScoreColor(95)).toBe('#10B981'); // green
    expect(result.current.getScoreColor(75)).toBe('#F59E0B'); // yellow
    expect(result.current.getScoreColor(60)).toBe('#F97316'); // orange
    expect(result.current.getScoreColor(30)).toBe('#EF4444'); // red
  });

  it('should get recommendations by priority', async () => {
    const mockData = {
      profile: null,
      recommendations: [
        { type: 'review_weak_topic', priority: 'high' },
        { type: 'continue_streak', priority: 'medium' },
        { type: 'try_new_topic', priority: 'low' },
      ],
      weeklyStats: [],
      totalStudyTime: 0,
      averageScore: 0,
      streakDays: 0,
      topicsCompleted: 0,
    };
    
    (advancedAnalytics.getAnalyticsSummary as jest.Mock).mockResolvedValue(mockData);
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    expect(result.current.getHighPriorityRecommendations()).toHaveLength(1);
    expect(result.current.getMediumPriorityRecommendations()).toHaveLength(1);
  });

  it('should clear all data', async () => {
    (advancedAnalytics.clearAllData as jest.Mock).mockResolvedValue(undefined);
    (advancedAnalytics.getAnalyticsSummary as jest.Mock).mockResolvedValue({});
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.clearAllData();
    });
    
    expect(advancedAnalytics.clearAllData).toHaveBeenCalled();
  });

  it('should handle errors gracefully', async () => {
    (advancedAnalytics.getAnalyticsSummary as jest.Mock).mockRejectedValue(new Error('Network error'));
    
    const { result, waitForNextUpdate } = renderHook(() => require('../useAdvancedAnalytics').useAdvancedAnalytics());
    
    await waitForNextUpdate();
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.analyticsData).toBe(null);
  });
});
