// Экспорт всех данных приложения
export { moneyTopic, moneyTopicData } from "./topics/money";

// Моковые данные для демонстрации
export const mockTopics = {
  money: {
    id: "money",
    title: "Деньги",
    description: "Изучаем природу денег, их функции и роль в экономике",
    progress: 0,
    isCompleted: false,
  },
  inflation: {
    id: "inflation",
    title: "Инфляция",
    description: "Понятие инфляции, её причины и последствия",
    progress: 0,
    isCompleted: false,
  },
  banking: {
    id: "banking",
    title: "Банковская система",
    description: "Структура банковской системы и её функции",
    progress: 0,
    isCompleted: false,
  },
};

// Данные для демонстрации прогресса
export const mockUserProgress = {
  totalSections: 6,
  completedSections: 2,
  totalTopics: 48,
  completedTopics: 12,
  xp: 1250,
  level: 3,
  streak: 5,
  currentGrade: 9,
  currentGoal: "ege",
};

