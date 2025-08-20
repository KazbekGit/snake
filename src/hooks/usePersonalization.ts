import { useState, useEffect, useCallback } from "react";
import {
  personalizationEngine,
  UserProfile,
  Recommendation,
  LearningPath,
  StudySession,
  QuizResult,
  TopicInteraction,
} from "../utils/personalizationEngine";

export interface PersonalizationState {
  userProfile: UserProfile | null;
  recommendations: Recommendation[];
  learningPaths: LearningPath[];
  isLoading: boolean;
  isInitialized: boolean;
}

export interface PersonalizationActions {
  initializeProfile: (userId: string) => Promise<void>;
  getRecommendations: (limit?: number) => Promise<Recommendation[]>;
  createLearningPath: (goal: string, duration: number) => Promise<LearningPath>;
  updateBehavior: (
    topicId: string,
    action: TopicInteraction["action"],
    duration?: number
  ) => Promise<void>;
  addQuizResult: (result: QuizResult) => Promise<void>;
  addStudySession: (session: StudySession) => Promise<void>;
  updatePreferences: (
    preferences: Partial<UserProfile["preferences"]>
  ) => Promise<void>;
  getLearningStats: () => any;
}

export const usePersonalization = (): PersonalizationState &
  PersonalizationActions => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация профиля
  const initializeProfile = useCallback(async (userId: string) => {
    setIsLoading(true);
    try {
      const profile = await personalizationEngine.initializeUserProfile(userId);
      setUserProfile(profile);
      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получение рекомендаций
  const getRecommendations = useCallback(async (limit: number = 5) => {
    setIsLoading(true);
    try {
      const recs = await personalizationEngine.getRecommendations(limit);
      setRecommendations(recs);
      return recs;
    } catch (error) {
      console.error("Failed to get recommendations:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Создание пути обучения
  const createLearningPath = useCallback(
    async (goal: string, duration: number) => {
      setIsLoading(true);
      try {
        const path = await personalizationEngine.createLearningPath(
          goal,
          duration
        );
        setLearningPaths((prev) => [...prev, path]);
        return path;
      } catch (error) {
        console.error("Failed to create learning path:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Обновление поведения
  const updateBehavior = useCallback(
    async (
      topicId: string,
      action: TopicInteraction["action"],
      duration?: number
    ) => {
      try {
        await personalizationEngine.updateProfileFromBehavior(
          topicId,
          action,
          duration
        );
        // Обновляем локальное состояние профиля
        const updatedProfile = personalizationEngine.getUserProfile();
        if (updatedProfile) {
          setUserProfile(updatedProfile);
        }
      } catch (error) {
        console.error("Failed to update behavior:", error);
      }
    },
    []
  );

  // Добавление результата теста
  const addQuizResult = useCallback(async (result: QuizResult) => {
    try {
      await personalizationEngine.addQuizResult(result);
      // Обновляем локальное состояние профиля
      const updatedProfile = personalizationEngine.getUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error("Failed to add quiz result:", error);
    }
  }, []);

  // Добавление сессии изучения
  const addStudySession = useCallback(async (session: StudySession) => {
    try {
      await personalizationEngine.addStudySession(session);
      // Обновляем локальное состояние профиля
      const updatedProfile = personalizationEngine.getUserProfile();
      if (updatedProfile) {
        setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error("Failed to add study session:", error);
    }
  }, []);

  // Обновление предпочтений
  const updatePreferences = useCallback(
    async (preferences: Partial<UserProfile["preferences"]>) => {
      if (!userProfile) return;

      try {
        const updatedProfile = {
          ...userProfile,
          preferences: {
            ...userProfile.preferences,
            ...preferences,
          },
        };
        setUserProfile(updatedProfile);
        // TODO: Сохранить в базу данных
      } catch (error) {
        console.error("Failed to update preferences:", error);
      }
    },
    [userProfile]
  );

  // Получение статистики обучения
  const getLearningStats = useCallback(() => {
    return personalizationEngine.getLearningStats();
  }, []);

  // Автоматическая загрузка рекомендаций при инициализации
  useEffect(() => {
    if (isInitialized && userProfile) {
      getRecommendations();
    }
  }, [isInitialized, userProfile, getRecommendations]);

  return {
    // State
    userProfile,
    recommendations,
    learningPaths,
    isLoading,
    isInitialized,

    // Actions
    initializeProfile,
    getRecommendations,
    createLearningPath,
    updateBehavior,
    addQuizResult,
    addStudySession,
    updatePreferences,
    getLearningStats,
  };
};

