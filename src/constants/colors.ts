// Цветовая палитра приложения
// Яркие, дружелюбные цвета для школьников

export const colors = {
  // Основные цвета
  primary: '#4A90E2', // Яркий синий
  secondary: '#F39C12', // Оранжевый
  accent: '#E74C3C', // Красный
  success: '#27AE60', // Зеленый
  warning: '#F1C40F', // Желтый
  info: '#3498DB', // Голубой
  
  // Градиенты
  gradients: {
    primary: ['#4A90E2', '#357ABD'],
    secondary: ['#F39C12', '#E67E22'],
    success: ['#27AE60', '#2ECC71'],
    warning: ['#F1C40F', '#F39C12'],
    accent: ['#E74C3C', '#C0392B'],
  },
  
  // Фоны
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#E9ECEF',
    dark: '#2C3E50',
  },
  
  // Текст
  text: {
    primary: '#2C3E50',
    secondary: '#6C757D',
    light: '#FFFFFF',
    muted: '#ADB5BD',
  },
  
  // Карточки и элементы
  card: {
    background: '#FFFFFF',
    border: '#E9ECEF',
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  
  // Статусы
  status: {
    completed: '#27AE60',
    inProgress: '#F39C12',
    notStarted: '#BDC3C7',
    error: '#E74C3C',
  },
  
  // Разделы (каждый раздел имеет свой цвет)
  sections: {
    person: '#4A90E2', // Человек и общество - синий
    economy: '#27AE60', // Экономика - зеленый
    politics: '#E74C3C', // Политика - красный
    law: '#9B59B6', // Право - фиолетовый
    social: '#F39C12', // Социальные отношения - оранжевый
    culture: '#1ABC9C', // Духовная культура - бирюзовый
  },
  
  // Уровни сложности
  difficulty: {
    easy: '#27AE60',
    medium: '#F39C12',
    hard: '#E74C3C',
  },
  
  // Редкость достижений
  rarity: {
    common: '#BDC3C7',
    rare: '#3498DB',
    epic: '#9B59B6',
    legendary: '#F1C40F',
  },
  
  // Премиум функции
  premium: {
    primary: '#F1C40F',
    secondary: '#F39C12',
    gradient: ['#F1C40F', '#F39C12'],
  },
} as const;

export type ColorScheme = typeof colors;
