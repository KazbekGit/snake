// Цветовая палитра приложения
// Яркие, дружелюбные цвета для школьников

export const colors = {
  // Основные цвета
  primary: "#2563EB", // Темно-синий
  primaryDark: "#1D4ED8", // Еще более темный синий
  secondary: "#DC2626", // Красный
  accent: "#EA580C", // Оранжевый
  success: "#16A34A", // Зеленый
  warning: "#CA8A04", // Желтый
  error: "#DC2626", // Красный для ошибок
  info: "#0891B2", // Голубой

  // Градиенты
  gradients: {
    primary: ["#2563EB", "#1D4ED8"],
    secondary: ["#DC2626", "#B91C1C"],
    success: ["#16A34A", "#15803D"],
    warning: ["#CA8A04", "#A16207"],
    accent: ["#EA580C", "#C2410C"],
  },

  // Фоны
  background: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  backgroundTertiary: "#E2E8F0",
  backgroundDark: "#1E293B",

  // Текст
  text: "#1E293B", // Темно-синий для основного текста
  textSecondary: "#475569", // Серый для второстепенного текста
  textLight: "#FFFFFF", // Белый для темного фона
  textMuted: "#64748B", // Приглушенный серый

  // Карточки и элементы
  card: "#FFFFFF",
  border: "#E2E8F0",
  shadow: "rgba(0, 0, 0, 0.1)",

  // Статусы
  status: {
    completed: "#16A34A",
    inProgress: "#CA8A04",
    notStarted: "#94A3B8",
    error: "#DC2626",
  },

  // Разделы (каждый раздел имеет свой цвет)
  sections: {
    person: "#2563EB", // Человек и общество - синий
    economy: "#16A34A", // Экономика - зеленый
    politics: "#DC2626", // Политика - красный
    law: "#9333EA", // Право - фиолетовый
    social: "#EA580C", // Социальные отношения - оранжевый
    culture: "#0891B2", // Духовная культура - бирюзовый
  },

  // Уровни сложности
  difficulty: {
    easy: "#16A34A",
    medium: "#CA8A04",
    hard: "#DC2626",
  },

  // Редкость достижений
  rarity: {
    common: "#94A3B8",
    rare: "#0891B2",
    epic: "#9333EA",
    legendary: "#CA8A04",
  },

  // Премиум функции
  premium: "#CA8A04",
} as const;

export type ColorScheme = typeof colors;
