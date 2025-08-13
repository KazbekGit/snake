import AsyncStorage from "@react-native-async-storage/async-storage";

// Типы для прогресса
export interface UserProgress {
  userId: string;
  topics: {
    [topicId: string]: TopicProgress;
  };
  lastActivity: string;
  totalStudyTime: number;
  completedTopics: string[];
  testScores: {
    [topicId: string]: number;
  };
}

export interface TopicProgress {
  topicId: string;
  completedBlocks: number;
  totalBlocks: number;
  lastBlockIndex: number;
  testCompleted: boolean;
  testScore?: number;
  lastStudied: string;
  studyTime: number;
}

// Ключи для AsyncStorage
const STORAGE_KEYS = {
  USER_PROGRESS: "user_progress",
  USER_ID: "user_id",
  SETTINGS: "user_settings",
};

// Генерация уникального ID пользователя
export const generateUserId = (): string => {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
};

// Получение или создание ID пользователя
export const getUserId = async (): Promise<string> => {
  try {
    const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    if (userId) {
      return userId;
    }

    const newUserId = generateUserId();
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, newUserId);
    return newUserId;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return generateUserId();
  }
};

// Получение прогресса пользователя
export const getUserProgress = async (): Promise<UserProgress> => {
  try {
    const userId = await getUserId();
    const progressData = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROGRESS);

    if (progressData) {
      const progress: UserProgress = JSON.parse(progressData);
      return progress;
    }

    // Создаем новый прогресс
    const newProgress: UserProgress = {
      userId,
      topics: {},
      lastActivity: new Date().toISOString(),
      totalStudyTime: 0,
      completedTopics: [],
      testScores: {},
    };

    await saveUserProgress(newProgress);
    return newProgress;
  } catch (error) {
    console.error("Error getting user progress:", error);
    return {
      userId: await getUserId(),
      topics: {},
      lastActivity: new Date().toISOString(),
      totalStudyTime: 0,
      completedTopics: [],
      testScores: {},
    };
  }
};

// Сохранение прогресса пользователя
export const saveUserProgress = async (
  progress: UserProgress
): Promise<void> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_PROGRESS,
      JSON.stringify(progress)
    );
  } catch (error) {
    console.error("Error saving user progress:", error);
  }
};

// Обновление прогресса темы
export const updateTopicProgress = async (
  topicId: string,
  updates: Partial<TopicProgress>
): Promise<void> => {
  try {
    const progress = await getUserProgress();

    const currentTopicProgress = progress.topics[topicId] || {
      topicId,
      completedBlocks: 0,
      totalBlocks: 0,
      lastBlockIndex: 0,
      testCompleted: false,
      lastStudied: new Date().toISOString(),
      studyTime: 0,
    };

    progress.topics[topicId] = {
      ...currentTopicProgress,
      ...updates,
      lastStudied: new Date().toISOString(),
    };

    progress.lastActivity = new Date().toISOString();

    await saveUserProgress(progress);
  } catch (error) {
    console.error("Error updating topic progress:", error);
  }
};

// Отметить блок как завершенный
export const markBlockCompleted = async (
  topicId: string,
  blockIndex: number,
  totalBlocks: number
): Promise<void> => {
  try {
    const progress = await getUserProgress();
    const currentTopicProgress = progress.topics[topicId] || {
      topicId,
      completedBlocks: 0,
      totalBlocks,
      lastBlockIndex: 0,
      testCompleted: false,
      lastStudied: new Date().toISOString(),
      studyTime: 0,
    };

    // Обновляем прогресс
    const newCompletedBlocks = Math.max(
      currentTopicProgress.completedBlocks,
      blockIndex + 1
    );
    const newLastBlockIndex = Math.max(
      currentTopicProgress.lastBlockIndex,
      blockIndex
    );

    await updateTopicProgress(topicId, {
      completedBlocks: newCompletedBlocks,
      lastBlockIndex: newLastBlockIndex,
      totalBlocks,
    });
  } catch (error) {
    console.error("Error marking block completed:", error);
  }
};

// Сохранение результата теста
export const saveTestResult = async (
  topicId: string,
  score: number,
  totalQuestions: number
): Promise<void> => {
  try {
    const progress = await getUserProgress();
    const currentTopicProgress = progress.topics[topicId];

    if (currentTopicProgress) {
      const percentage = Math.round((score / totalQuestions) * 100);

      await updateTopicProgress(topicId, {
        testCompleted: true,
        testScore: percentage,
      });

      // Обновляем общие результаты
      progress.testScores[topicId] = percentage;

      // Если тема полностью завершена, добавляем в список завершенных
      if (percentage >= 70) {
        // Порог успешного завершения
        if (!progress.completedTopics.includes(topicId)) {
          progress.completedTopics.push(topicId);
        }
      }

      await saveUserProgress(progress);
    }
  } catch (error) {
    console.error("Error saving test result:", error);
  }
};

// Получение прогресса конкретной темы
export const getTopicProgress = async (
  topicId: string
): Promise<TopicProgress | null> => {
  try {
    const progress = await getUserProgress();
    return progress.topics[topicId] || null;
  } catch (error) {
    console.error("Error getting topic progress:", error);
    return null;
  }
};

// Добавление времени изучения
export const addStudyTime = async (
  topicId: string,
  minutes: number
): Promise<void> => {
  try {
    const progress = await getUserProgress();
    const currentTopicProgress = progress.topics[topicId];

    if (currentTopicProgress) {
      await updateTopicProgress(topicId, {
        studyTime: currentTopicProgress.studyTime + minutes,
      });

      // Обновляем общее время изучения
      progress.totalStudyTime += minutes;
      await saveUserProgress(progress);
    }
  } catch (error) {
    console.error("Error adding study time:", error);
  }
};

// Очистка всех данных пользователя
export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROGRESS,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.SETTINGS,
    ]);
  } catch (error) {
    console.error("Error clearing user data:", error);
  }
};

// Экспорт статистики
export const getStudyStatistics = async () => {
  try {
    const progress = await getUserProgress();

    const totalTopics = Object.keys(progress.topics).length;
    const completedTopics = progress.completedTopics.length;
    const averageScore =
      Object.values(progress.testScores).length > 0
        ? Object.values(progress.testScores).reduce((a, b) => a + b, 0) /
          Object.values(progress.testScores).length
        : 0;

    return {
      totalTopics,
      completedTopics,
      totalStudyTime: progress.totalStudyTime,
      averageScore: Math.round(averageScore),
      lastActivity: progress.lastActivity,
    };
  } catch (error) {
    console.error("Error getting study statistics:", error);
    return {
      totalTopics: 0,
      completedTopics: 0,
      totalStudyTime: 0,
      averageScore: 0,
      lastActivity: new Date().toISOString(),
    };
  }
};

// Сброс прогресса конкретной темы
export const resetTopicProgress = async (topicId: string): Promise<void> => {
  try {
    const progress = await getUserProgress();
    if (progress.topics && progress.topics[topicId]) {
      delete progress.topics[topicId];
    }
    if (Array.isArray(progress.completedTopics)) {
      progress.completedTopics = progress.completedTopics.filter(
        (t) => t !== topicId
      );
    }
    if (progress.testScores && progress.testScores[topicId] !== undefined) {
      delete progress.testScores[topicId];
    }
    progress.lastActivity = new Date().toISOString();
    await saveUserProgress(progress);
  } catch (error) {
    console.error("Error resetting topic progress:", error);
  }
};
