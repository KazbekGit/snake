export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "study" | "quiz" | "streak" | "exploration" | "mastery";
  condition: {
    type:
      | "topics_completed"
      | "questions_answered"
      | "streak_days"
      | "perfect_scores"
      | "time_spent"
      | "sections_explored";
    value: number;
    target: number;
  };
  reward: {
    type: "badge" | "points" | "unlock" | "special";
    value: number | string;
  };
  rarity: "common" | "rare" | "epic" | "legendary";
  isUnlocked: boolean;
  unlockedAt?: Date;
}

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type:
    | "complete_topics"
    | "answer_questions"
    | "study_time"
    | "perfect_score"
    | "explore_sections";
  target: number;
  reward: {
    type: "points" | "badge" | "bonus";
    value: number | string;
  };
  expiresAt: Date;
  isCompleted: boolean;
  progress: number;
}

export interface UserLevel {
  level: number;
  experience: number;
  experienceToNext: number;
  title: string;
  rewards: {
    type: "badge" | "points" | "unlock";
    value: number | string;
  }[];
}

export const ACHIEVEMENTS: Achievement[] = [
  // Достижения за изучение
  {
    id: "first_steps",
    title: "Первые шаги",
    description: "Завершите изучение первой темы",
    icon: "footsteps",
    category: "study",
    condition: {
      type: "topics_completed",
      value: 0,
      target: 1,
    },
    reward: {
      type: "badge",
      value: "first_steps_badge",
    },
    rarity: "common",
    isUnlocked: false,
  },
  {
    id: "knowledge_seeker",
    title: "Искатель знаний",
    description: "Изучите 5 тем",
    icon: "search",
    category: "study",
    condition: {
      type: "topics_completed",
      value: 0,
      target: 5,
    },
    reward: {
      type: "points",
      value: 100,
    },
    rarity: "common",
    isUnlocked: false,
  },
  {
    id: "scholar",
    title: "Ученый",
    description: "Изучите 10 тем",
    icon: "school",
    category: "study",
    condition: {
      type: "topics_completed",
      value: 0,
      target: 10,
    },
    reward: {
      type: "badge",
      value: "scholar_badge",
    },
    rarity: "rare",
    isUnlocked: false,
  },
  {
    id: "master_learner",
    title: "Мастер обучения",
    description: "Изучите 20 тем",
    icon: "trophy",
    category: "study",
    condition: {
      type: "topics_completed",
      value: 0,
      target: 20,
    },
    reward: {
      type: "badge",
      value: "master_learner_badge",
    },
    rarity: "epic",
    isUnlocked: false,
  },

  // Достижения за тесты
  {
    id: "quiz_beginner",
    title: "Начинающий тестировщик",
    description: "Ответьте на 10 вопросов",
    icon: "help-circle",
    category: "quiz",
    condition: {
      type: "questions_answered",
      value: 0,
      target: 10,
    },
    reward: {
      type: "points",
      value: 50,
    },
    rarity: "common",
    isUnlocked: false,
  },
  {
    id: "quiz_master",
    title: "Мастер тестов",
    description: "Ответьте на 100 вопросов",
    icon: "checkmark-circle",
    category: "quiz",
    condition: {
      type: "questions_answered",
      value: 0,
      target: 100,
    },
    reward: {
      type: "badge",
      value: "quiz_master_badge",
    },
    rarity: "rare",
    isUnlocked: false,
  },
  {
    id: "perfect_score",
    title: "Отличник",
    description: "Получите 100% на тесте",
    icon: "star",
    category: "quiz",
    condition: {
      type: "perfect_scores",
      value: 0,
      target: 1,
    },
    reward: {
      type: "points",
      value: 200,
    },
    rarity: "rare",
    isUnlocked: false,
  },
  {
    id: "perfect_streak",
    title: "Серия отличников",
    description: "Получите 100% на 5 тестах подряд",
    icon: "stars",
    category: "quiz",
    condition: {
      type: "perfect_scores",
      value: 0,
      target: 5,
    },
    reward: {
      type: "badge",
      value: "perfect_streak_badge",
    },
    rarity: "epic",
    isUnlocked: false,
  },

  // Достижения за серии
  {
    id: "week_warrior",
    title: "Недельный воин",
    description: "Занимайтесь 7 дней подряд",
    icon: "calendar",
    category: "streak",
    condition: {
      type: "streak_days",
      value: 0,
      target: 7,
    },
    reward: {
      type: "points",
      value: 150,
    },
    rarity: "rare",
    isUnlocked: false,
  },
  {
    id: "month_master",
    title: "Мастер месяца",
    description: "Занимайтесь 30 дней подряд",
    icon: "calendar-outline",
    category: "streak",
    condition: {
      type: "streak_days",
      value: 0,
      target: 30,
    },
    reward: {
      type: "badge",
      value: "month_master_badge",
    },
    rarity: "epic",
    isUnlocked: false,
  },

  // Достижения за время
  {
    id: "time_investor",
    title: "Инвестор времени",
    description: "Потратьте 1 час на изучение",
    icon: "time",
    category: "study",
    condition: {
      type: "time_spent",
      value: 0,
      target: 60, // минуты
    },
    reward: {
      type: "points",
      value: 75,
    },
    rarity: "common",
    isUnlocked: false,
  },
  {
    id: "dedicated_learner",
    title: "Преданный ученик",
    description: "Потратьте 10 часов на изучение",
    icon: "hourglass",
    category: "study",
    condition: {
      type: "time_spent",
      value: 0,
      target: 600, // минуты
    },
    reward: {
      type: "badge",
      value: "dedicated_learner_badge",
    },
    rarity: "rare",
    isUnlocked: false,
  },

  // Достижения за исследование
  {
    id: "explorer",
    title: "Исследователь",
    description: "Изучите все разделы",
    icon: "compass",
    category: "exploration",
    condition: {
      type: "sections_explored",
      value: 0,
      target: 6, // количество разделов
    },
    reward: {
      type: "badge",
      value: "explorer_badge",
    },
    rarity: "epic",
    isUnlocked: false,
  },
  {
    id: "knowledge_master",
    title: "Мастер знаний",
    description: "Изучите все темы во всех разделах",
    icon: "library",
    category: "mastery",
    condition: {
      type: "topics_completed",
      value: 0,
      target: 30, // примерное количество всех тем
    },
    reward: {
      type: "badge",
      value: "knowledge_master_badge",
    },
    rarity: "legendary",
    isUnlocked: false,
  },
];

export const DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: "daily_study",
    title: "Ежедневное изучение",
    description: "Изучите 2 темы сегодня",
    type: "complete_topics",
    target: 2,
    reward: {
      type: "points",
      value: 50,
    },
    expiresAt: new Date(),
    isCompleted: false,
    progress: 0,
  },
  {
    id: "daily_quiz",
    title: "Ежедневный тест",
    description: "Ответьте на 10 вопросов",
    type: "answer_questions",
    target: 10,
    reward: {
      type: "points",
      value: 30,
    },
    expiresAt: new Date(),
    isCompleted: false,
    progress: 0,
  },
  {
    id: "daily_time",
    title: "Время знаний",
    description: "Занимайтесь 30 минут",
    type: "study_time",
    target: 30,
    reward: {
      type: "points",
      value: 40,
    },
    expiresAt: new Date(),
    isCompleted: false,
    progress: 0,
  },
];

export const LEVELS: UserLevel[] = [
  {
    level: 1,
    experience: 0,
    experienceToNext: 100,
    title: "Новичок",
    rewards: [],
  },
  {
    level: 2,
    experience: 100,
    experienceToNext: 200,
    title: "Ученик",
    rewards: [{ type: "badge", value: "level_2_badge" }],
  },
  {
    level: 3,
    experience: 300,
    experienceToNext: 400,
    title: "Студент",
    rewards: [{ type: "points", value: 100 }],
  },
  {
    level: 4,
    experience: 700,
    experienceToNext: 600,
    title: "Исследователь",
    rewards: [{ type: "badge", value: "level_4_badge" }],
  },
  {
    level: 5,
    experience: 1300,
    experienceToNext: 800,
    title: "Знаток",
    rewards: [{ type: "points", value: 200 }],
  },
  {
    level: 6,
    experience: 2100,
    experienceToNext: 1000,
    title: "Эксперт",
    rewards: [{ type: "badge", value: "level_6_badge" }],
  },
  {
    level: 7,
    experience: 3100,
    experienceToNext: 1200,
    title: "Мастер",
    rewards: [{ type: "points", value: 300 }],
  },
  {
    level: 8,
    experience: 4300,
    experienceToNext: 1500,
    title: "Гуру",
    rewards: [{ type: "badge", value: "level_8_badge" }],
  },
  {
    level: 9,
    experience: 5800,
    experienceToNext: 2000,
    title: "Мудрец",
    rewards: [{ type: "points", value: 500 }],
  },
  {
    level: 10,
    experience: 7800,
    experienceToNext: 0,
    title: "Легенда",
    rewards: [{ type: "badge", value: "legend_badge" }],
  },
];

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case "common":
      return "#6B7280";
    case "rare":
      return "#3B82F6";
    case "epic":
      return "#8B5CF6";
    case "legendary":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
};

export const getRarityName = (rarity: string): string => {
  switch (rarity) {
    case "common":
      return "Обычное";
    case "rare":
      return "Редкое";
    case "epic":
      return "Эпическое";
    case "legendary":
      return "Легендарное";
    default:
      return "Обычное";
  }
};
