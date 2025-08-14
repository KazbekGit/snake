// Цветовая палитра приложения
// Яркие, дружелюбные цвета для школьников

export const colors = {
  // Основные цвета (по макету)
  background: "#FAF5EF", // Светло-бежевый фон
  primary: "#E35B46", // Тёплый красный
  teal: "#2A7F80", // Глубокий бирюзовый
  yellow: "#F2B544", // Золотисто-жёлтый
  navy: "#1E3B4E", // Тёмно-синий
  // Совместимость старых имён
  primaryDark: "#C94C3B",
  secondary: "#DC2626",
  accent: "#EA580C",
  success: "#16A34A",
  warning: "#F2B544",
  error: "#DC2626",
  info: "#0891B2",

  // Градиенты
  gradients: {
    primary: ["#2563EB", "#1D4ED8"],
    secondary: ["#DC2626", "#B91C1C"],
    success: ["#16A34A", "#15803D"],
    warning: ["#CA8A04", "#A16207"],
    accent: ["#EA580C", "#C2410C"],
  },

  // Фоны
  backgroundSecondary: "#FFF8EE",
  backgroundTertiary: "#EDE6DD",
  backgroundDark: "#1E293B",

  // Текст
  text: "#1E3B4E", // Тёмно-синий как основной текст
  textSecondary: "#475569", // Серый для второстепенного текста
  textLight: "#FFFFFF", // Белый для темного фона
  textMuted: "#64748B", // Приглушенный серый

  // Карточки и элементы
  card: "#FFFFFF",
  border: "#E5DCCD",
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
    person: "#2A7F80",
    economy: "#16A34A",
    politics: "#E35B46",
    law: "#9333EA",
    social: "#EA580C",
    culture: "#0891B2",
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
};

export type ColorScheme = typeof colors;
