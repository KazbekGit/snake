// Основные типы данных приложения

export interface User {
  id: string;
  name: string;
  email?: string;
  grade: number; // 8-11 класс
  goal: LearningGoal;
  registrationDate: Date;
  subscription: boolean;
  xp: number;
  level: number;
  avatar?: string;
}

export type LearningGoal = "ege" | "school" | "personal";

export interface Section {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  topics: Topic[];
  isCompleted: boolean;
  progress: number; // 0-100
}

export interface Topic {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  coverImage: string;
  order: number;
  gradeLevel: number;
  isPremium: boolean;
  contentBlocks: ContentBlock[];
  quiz: Quiz;
  isCompleted: boolean;
  progress: number;
  bestScore: number;
}

export interface ContentBlock {
  id: string;
  topicId: string;
  type: "text" | "image" | "video" | "infographic" | "mnemonic";
  title: string;
  content: string;
  mediaUrl?: string;
  order: number;
  isCompleted: boolean;
}

export interface Quiz {
  id: string;
  topicId: string;
  questions: Question[];
  timeLimit?: number; // в секундах
  passingScore: number; // минимальный балл для прохождения
}

export interface Question {
  id: string;
  quizId: string;
  type: "single" | "multiple" | "match" | "flipcard" | "text";
  text: string;
  options?: QuestionOption[];
  correctAnswer: string | string[];
  explanation?: string;
  points: number;
  order: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description: string;
  icon: string;
  category: "topic" | "section" | "streak" | "special";
  awardedAt: Date;
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface Progress {
  userId: string;
  topicId: string;
  completedBlocks: number;
  totalBlocks: number;
  score: number;
  attempts: number;
  lastAttemptDate?: Date;
  timeSpent: number; // в секундах
}

export interface TestResult {
  id: string;
  userId: string;
  topicId: string;
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  completedAt: Date;
  answers: UserAnswer[];
}

export interface UserAnswer {
  questionId: string;
  userAnswer: string | string[];
  isCorrect: boolean;
  timeSpent: number;
}

export interface AppSettings {
  notifications: boolean;
  sound: boolean;
  hapticFeedback: boolean;
  autoPlay: boolean;
  theme: "light" | "dark" | "auto";
  fontSize: "small" | "medium" | "large";
}

export interface NavigationParams {
  Home: undefined;
  Welcome: undefined;
  GradeSelection: undefined;
  GoalSelection: { grade: number };
  Section: { section: Section };
  Topic: { topic: Topic };
  Quiz: { quiz: Quiz; topicId: string };
  Results: { result: TestResult; topicId: string };
  Profile: undefined;
  Statistics: undefined;
  Achievements: undefined;
  Settings: undefined;
  Search: undefined;
  Premium: undefined;
}
