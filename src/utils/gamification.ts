import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ACHIEVEMENTS,
  DAILY_CHALLENGES,
  LEVELS,
  Achievement,
  DailyChallenge,
  UserLevel,
} from "../constants/achievements";

// Ключи для AsyncStorage
const STORAGE_KEYS = {
  ACHIEVEMENTS: "gamification_achievements",
  DAILY_CHALLENGES: "gamification_daily_challenges",
  USER_LEVEL: "gamification_user_level",
  USER_POINTS: "gamification_user_points",
  STUDY_STATS: "gamification_study_stats",
  STREAK_DATA: "gamification_streak_data",
};

// Интерфейсы для статистики
export interface StudyStats {
  topicsCompleted: number;
  questionsAnswered: number;
  timeSpent: number; // в минутах
  perfectScores: number;
  sectionsExplored: Set<string>;
  lastStudyDate: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
}

export interface UserProgress {
  level: number;
  experience: number;
  points: number;
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  studyStats: StudyStats;
  streakData: StreakData;
}

// Класс для управления геймификацией
export class GamificationManager {
  private static instance: GamificationManager;
  private userProgress: UserProgress | null = null;

  static getInstance(): GamificationManager {
    if (!GamificationManager.instance) {
      GamificationManager.instance = new GamificationManager();
    }
    return GamificationManager.instance;
  }

  // Инициализация пользовательского прогресса
  async initializeUserProgress(): Promise<UserProgress> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
      if (stored) {
        this.userProgress = JSON.parse(stored);
        return this.userProgress!;
      }

      // Создаем новый прогресс
      const initialProgress: UserProgress = {
        level: 1,
        experience: 0,
        points: 0,
        achievements: ACHIEVEMENTS.map((achievement) => ({
          ...achievement,
          isUnlocked: false,
        })),
        dailyChallenges: this.generateDailyChallenges(),
        studyStats: {
          topicsCompleted: 0,
          questionsAnswered: 0,
          timeSpent: 0,
          perfectScores: 0,
          sectionsExplored: new Set(),
          lastStudyDate: new Date().toISOString(),
        },
        streakData: {
          currentStreak: 0,
          longestStreak: 0,
          lastStudyDate: new Date().toISOString(),
        },
      };

      await this.saveUserProgress(initialProgress);
      this.userProgress = initialProgress;
      return initialProgress;
    } catch (error) {
      console.error("Failed to initialize user progress:", error);
      throw error;
    }
  }

  // Получение текущего прогресса
  async getUserProgress(): Promise<UserProgress> {
    if (!this.userProgress) {
      return this.initializeUserProgress();
    }
    return this.userProgress;
  }

  // Сохранение прогресса
  private async saveUserProgress(progress: UserProgress): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify(progress)
      );
      this.userProgress = progress;
    } catch (error) {
      console.error("Failed to save user progress:", error);
      throw error;
    }
  }

  // Добавление опыта
  async addExperience(
    amount: number
  ): Promise<{ levelUp: boolean; newLevel?: number }> {
    const progress = await this.getUserProgress();
    const oldLevel = progress.level;

    progress.experience += amount;

    // Проверяем повышение уровня
    const currentLevelData = LEVELS.find((l) => l.level === progress.level);
    if (
      currentLevelData &&
      progress.experience >=
        currentLevelData.experience + currentLevelData.experienceToNext
    ) {
      progress.level++;
      await this.saveUserProgress(progress);
      return { levelUp: true, newLevel: progress.level };
    }

    await this.saveUserProgress(progress);
    return { levelUp: false };
  }

  // Добавление очков
  async addPoints(amount: number): Promise<void> {
    const progress = await this.getUserProgress();
    progress.points += amount;
    await this.saveUserProgress(progress);
  }

  // Завершение темы
  async completeTopic(
    topicId: string,
    sectionId: string
  ): Promise<Achievement[]> {
    const progress = await this.getUserProgress();
    const unlockedAchievements: Achievement[] = [];

    // Обновляем статистику
    progress.studyStats.topicsCompleted++;
    progress.studyStats.sectionsExplored.add(sectionId);
    progress.studyStats.lastStudyDate = new Date().toISOString();

    // Обновляем серию
    await this.updateStreak();

    // Проверяем достижения
    const newUnlocked = await this.checkAchievements(progress);
    unlockedAchievements.push(...newUnlocked);

    // Добавляем опыт
    const experienceGained = 50; // базовый опыт за тему
    const { levelUp } = await this.addExperience(experienceGained);

    // Добавляем очки
    await this.addPoints(25); // базовые очки за тему

    // Обновляем ежедневные вызовы
    await this.updateDailyChallenges("complete_topics", 1);

    await this.saveUserProgress(progress);
    return unlockedAchievements;
  }

  // Ответ на вопрос
  async answerQuestion(
    isCorrect: boolean,
    isPerfectScore: boolean = false
  ): Promise<Achievement[]> {
    const progress = await this.getUserProgress();
    const unlockedAchievements: Achievement[] = [];

    // Обновляем статистику
    progress.studyStats.questionsAnswered++;
    if (isPerfectScore) {
      progress.studyStats.perfectScores++;
    }

    // Проверяем достижения
    const newUnlocked = await this.checkAchievements(progress);
    unlockedAchievements.push(...newUnlocked);

    // Добавляем опыт
    const experienceGained = isCorrect ? 10 : 5;
    await this.addExperience(experienceGained);

    // Добавляем очки
    const pointsGained = isCorrect ? 10 : 2;
    await this.addPoints(pointsGained);

    // Обновляем ежедневные вызовы
    await this.updateDailyChallenges("answer_questions", 1);

    await this.saveUserProgress(progress);
    return unlockedAchievements;
  }

  // Добавление времени изучения
  async addStudyTime(minutes: number): Promise<Achievement[]> {
    const progress = await this.getUserProgress();
    const unlockedAchievements: Achievement[] = [];

    // Обновляем статистику
    progress.studyStats.timeSpent += minutes;

    // Проверяем достижения
    const newUnlocked = await this.checkAchievements(progress);
    unlockedAchievements.push(...newUnlocked);

    // Добавляем опыт
    const experienceGained = Math.floor(minutes / 5); // 1 опыт за каждые 5 минут
    await this.addExperience(experienceGained);

    // Обновляем ежедневные вызовы
    await this.updateDailyChallenges("study_time", minutes);

    await this.saveUserProgress(progress);
    return unlockedAchievements;
  }

  // Проверка достижений
  private async checkAchievements(
    progress: UserProgress
  ): Promise<Achievement[]> {
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of progress.achievements) {
      if (achievement.isUnlocked) continue;

      let shouldUnlock = false;

      switch (achievement.condition.type) {
        case "topics_completed":
          shouldUnlock =
            progress.studyStats.topicsCompleted >= achievement.condition.target;
          break;
        case "questions_answered":
          shouldUnlock =
            progress.studyStats.questionsAnswered >=
            achievement.condition.target;
          break;
        case "streak_days":
          shouldUnlock =
            progress.streakData.currentStreak >= achievement.condition.target;
          break;
        case "perfect_scores":
          shouldUnlock =
            progress.studyStats.perfectScores >= achievement.condition.target;
          break;
        case "time_spent":
          shouldUnlock =
            progress.studyStats.timeSpent >= achievement.condition.target;
          break;
        case "sections_explored":
          shouldUnlock =
            progress.studyStats.sectionsExplored.size >=
            achievement.condition.target;
          break;
      }

      if (shouldUnlock) {
        achievement.isUnlocked = true;
        achievement.unlockedAt = new Date();
        unlockedAchievements.push(achievement);

        // Выдаем награду
        if (achievement.reward.type === "points") {
          await this.addPoints(achievement.reward.value as number);
        }
      }
    }

    return unlockedAchievements;
  }

  // Обновление серии
  private async updateStreak(): Promise<void> {
    const progress = await this.getUserProgress();
    const today = new Date().toDateString();
    const lastStudyDate = new Date(
      progress.streakData.lastStudyDate
    ).toDateString();

    if (today === lastStudyDate) {
      // Уже занимались сегодня
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();

    if (lastStudyDate === yesterdayString) {
      // Продолжаем серию
      progress.streakData.currentStreak++;
    } else {
      // Прерываем серию
      progress.streakData.currentStreak = 1;
    }

    // Обновляем самую длинную серию
    if (progress.streakData.currentStreak > progress.streakData.longestStreak) {
      progress.streakData.longestStreak = progress.streakData.currentStreak;
    }

    progress.streakData.lastStudyDate = new Date().toISOString();
  }

  // Обновление ежедневных вызовов
  private async updateDailyChallenges(
    type: string,
    amount: number
  ): Promise<void> {
    const progress = await this.getUserProgress();
    const today = new Date().toDateString();

    for (const challenge of progress.dailyChallenges) {
      if (challenge.isCompleted) continue;

      // Проверяем, не истек ли вызов
      const challengeDate = new Date(challenge.expiresAt).toDateString();
      if (challengeDate !== today) {
        // Генерируем новый вызов
        const newChallenge = this.generateDailyChallenge(challenge.id);
        Object.assign(challenge, newChallenge);
      }

      // Обновляем прогресс
      if (challenge.type === type) {
        challenge.progress += amount;
        if (challenge.progress >= challenge.target) {
          challenge.isCompleted = true;
          // Выдаем награду
          if (challenge.reward.type === "points") {
            await this.addPoints(challenge.reward.value as number);
          }
        }
      }
    }
  }

  // Генерация ежедневных вызовов
  private generateDailyChallenges(): DailyChallenge[] {
    return DAILY_CHALLENGES.map((challenge) => ({
      ...challenge,
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)),
      isCompleted: false,
      progress: 0,
    }));
  }

  // Генерация одного ежедневного вызова
  private generateDailyChallenge(id: string): DailyChallenge {
    const baseChallenge = DAILY_CHALLENGES.find((c) => c.id === id);
    if (!baseChallenge) {
      throw new Error(`Unknown challenge id: ${id}`);
    }

    return {
      ...baseChallenge,
      expiresAt: new Date(new Date().setHours(23, 59, 59, 999)),
      isCompleted: false,
      progress: 0,
    };
  }

  // Получение статистики
  async getStats(): Promise<{
    totalPoints: number;
    currentLevel: number;
    experience: number;
    experienceToNext: number;
    achievementsUnlocked: number;
    totalAchievements: number;
    currentStreak: number;
    longestStreak: number;
  }> {
    const progress = await this.getUserProgress();
    const currentLevelData = LEVELS.find((l) => l.level === progress.level);

    return {
      totalPoints: progress.points,
      currentLevel: progress.level,
      experience: progress.experience,
      experienceToNext: currentLevelData?.experienceToNext || 0,
      achievementsUnlocked: progress.achievements.filter((a) => a.isUnlocked)
        .length,
      totalAchievements: progress.achievements.length,
      currentStreak: progress.streakData.currentStreak,
      longestStreak: progress.streakData.longestStreak,
    };
  }

  // Сброс прогресса (для тестирования)
  async resetProgress(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
    this.userProgress = null;
  }
}

// Экспортируем экземпляр
export const gamificationManager = GamificationManager.getInstance();
