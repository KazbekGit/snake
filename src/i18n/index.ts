// Types
type Dict = Record<string, string | Record<string, any>>;

// Russian translations
const ru: Dict = {
  // Common
  back: "Назад",
  continue: "Продолжить",
  start: "Начать",
  cancel: "Отмена",
  save: "Сохранить",
  delete: "Удалить",
  edit: "Редактировать",
  close: "Закрыть",
  loading: "Загрузка...",
  error: "Ошибка",
  success: "Успешно",
  
  // Navigation
  home: "Главная",
  topics: "Темы",
  statistics: "Статистика",
  settings: "Настройки",
  
  // Welcome Screen
  appTitle: "Обществознание",
  appSubtitle: "Изучайте обществознание",
  startButton: "Начать",
  features: {
    checkmark: "✅",
    books: "📚", 
    stats: "📊"
  },
  
  // Grade Selection
  selectGrade: "Выберите класс",
  grade9: "9 класс",
  grade10: "10 класс",
  grade11: "11 класс",
  
  // Goal Selection
  selectGoal: "Выберите цель",
  oge: "Подготовка к ОГЭ",
  ege: "Подготовка к ЕГЭ",
  general: "Общее развитие",
  
  // Home Screen
  continueLearning: "Продолжить обучение",
  sections: "Разделы обществознания",
  sectionsList: {
    personSociety: "Человек и общество",
    economy: "Экономика", 
    socialRelations: "Социальные отношения",
    politics: "Политика",
    law: "Право",
    culture: "Духовная культура"
  },
  actions: {
    continue: "Продолжить",
    repeat: "Повторить",
    start: "Начать"
  },
  icons: {
    person: "👤",
    money: "💰",
    group: "👥",
    government: "🏛️",
    justice: "⚖️",
    culture: "🎨"
  },
  
  // Topic Screen
  startLearning: "Начать изучение",
  resetProgress: "Сбросить прогресс",
  topicProgress: "Прогресс темы",
  blocksCompleted: "Блоков завершено",
  
  // Content Blocks
  nextBlock: "Следующий блок",
  previousBlock: "Предыдущий блок",
  blockProgress: "Блок {current} из {total}",
  
  // Test Screen
  testTitle: "Проверь понимание",
  questionNumber: "Вопрос {current} из {total}",
  correctAnswer: "Правильно!",
  wrongAnswer: "Неправильно!",
  explanation: "Объяснение",
  continueTest: "Продолжить",
  finishTest: "Завершить тест",
  
  // Test Results
  resultsTitle: "Результаты теста",
  correctAnswers: "Правильных ответов",
  totalQuestions: "Всего вопросов",
  percentage: "Процент правильных",
  retakeTest: "Перепройти тест",
  
  // Statistics Screen
  statisticsTitle: "Общая статистика",
  completedTopics: "Завершено тем",
  studyTime: "Время изучения",
  averageScore: "Средний балл",
  lastActivity: "Последняя активность",
  
  // Statistics Actions
  exportBackup: "Экспорт резервной копии",
  resetTopicProgress: "Сбросить тему «{topic}»",
  resetAllProgress: "Сбросить прогресс по всем темам",
  clearData: "Очистить данные",
  
  // Event Log
  eventLog: "Журнал событий",
  clearEventLog: "Очистить журнал событий",
  noEvents: "Событий пока нет",
  
  // Content Topics
  contentTopics: {
    money: {
      title: "Деньги",
      description: "Изучаем природу денег",
      blocks: {
        definition: "Определение",
        functions: "Функции",
        types: "Виды",
        summary: "Итоги"
      }
    },
    market: {
      title: "Рынок", 
      description: "Изучаем рыночную экономику",
      blocks: {
        definition: "Что такое рынок?",
        supplyDemand: "Спрос и предложение",
        structures: "Типы рыночных структур",
        competition: "Роль конкуренции"
      }
    },
    humanNature: {
      title: "Природа человека",
      description: "Изучаем биологическую и социальную природу человека",
      blocks: {
        biological: "Биологическая природа человека",
        social: "Социальная природа человека", 
        needs: "Потребности человека",
        activity: "Деятельность человека"
      }
    }
  },
  
  // Quiz Questions
  quiz: {
    money: {
      question1: "Деньги — это?",
      options1: {
        equivalent: "Эквивалент",
        product: "Товар",
        service: "Услуга",
        resource: "Ресурс"
      },
      explanation1: "Деньги — это всеобщий эквивалент стоимости товаров и услуг."
    }
  },
  
  // Errors
  errors: {
    networkError: "Ошибка сети",
    loadingError: "Ошибка загрузки",
    saveError: "Ошибка сохранения",
    unknownError: "Неизвестная ошибка"
  },
  
  // Success Messages
  successMessages: {
    progressSaved: "Прогресс сохранен",
    backupExported: "Резервная копия экспортирована",
    progressReset: "Прогресс сброшен"
  }
};

// English translations
const en: Dict = {
  // Common
  back: "Back",
  continue: "Continue", 
  start: "Start",
  cancel: "Cancel",
  save: "Save",
  delete: "Delete",
  edit: "Edit",
  close: "Close",
  loading: "Loading...",
  error: "Error",
  success: "Success",
  
  // Navigation
  home: "Home",
  topics: "Topics",
  statistics: "Statistics", 
  settings: "Settings",
  
  // Welcome Screen
  appTitle: "Social Studies",
  appSubtitle: "Learn social studies",
  startButton: "Start",
  features: {
    checkmark: "✅",
    books: "📚",
    stats: "📊"
  },
  
  // Grade Selection
  selectGrade: "Select grade",
  grade9: "Grade 9",
  grade10: "Grade 10", 
  grade11: "Grade 11",
  
  // Goal Selection
  selectGoal: "Select goal",
  oge: "OGE preparation",
  ege: "EGE preparation",
  general: "General development",
  
  // Home Screen
  continueLearning: "Continue learning",
  sections: "Social studies sections",
  sectionsList: {
    personSociety: "Person and Society",
    economy: "Economy",
    socialRelations: "Social Relations", 
    politics: "Politics",
    law: "Law",
    culture: "Spiritual Culture"
  },
  actions: {
    continue: "Continue",
    repeat: "Review",
    start: "Start"
  },
  icons: {
    person: "👤",
    money: "💰", 
    group: "👥",
    government: "🏛️",
    justice: "⚖️",
    culture: "🎨"
  },
  
  // Topic Screen
  startLearning: "Start learning",
  resetProgress: "Reset progress",
  topicProgress: "Topic progress",
  blocksCompleted: "Blocks completed",
  
  // Content Blocks
  nextBlock: "Next block",
  previousBlock: "Previous block", 
  blockProgress: "Block {current} of {total}",
  
  // Test Screen
  testTitle: "Check understanding",
  questionNumber: "Question {current} of {total}",
  correctAnswer: "Correct!",
  wrongAnswer: "Incorrect!",
  explanation: "Explanation",
  continueTest: "Continue",
  finishTest: "Finish test",
  
  // Test Results
  resultsTitle: "Test results",
  correctAnswers: "Correct answers",
  totalQuestions: "Total questions",
  percentage: "Percentage correct",
  retakeTest: "Retake test",
  
  // Statistics Screen
  statisticsTitle: "General statistics",
  completedTopics: "Completed topics",
  studyTime: "Study time",
  averageScore: "Average score",
  lastActivity: "Last activity",
  
  // Statistics Actions
  exportBackup: "Export backup",
  resetTopicProgress: "Reset topic «{topic}»",
  resetAllProgress: "Reset all topics progress",
  clearData: "Clear data",
  
  // Event Log
  eventLog: "Event log",
  clearEventLog: "Clear event log",
  noEvents: "No events yet",
  
  // Content Topics
  contentTopics: {
    money: {
      title: "Money",
      description: "Learn about the nature of money",
      blocks: {
        definition: "Definition",
        functions: "Functions", 
        types: "Types",
        summary: "Summary"
      }
    },
    market: {
      title: "Market",
      description: "Learn about market economy",
      blocks: {
        definition: "What is a market?",
        supplyDemand: "Supply and demand",
        structures: "Market structures",
        competition: "Role of competition"
      }
    },
    humanNature: {
      title: "Human Nature", 
      description: "Learn about biological and social nature of humans",
      blocks: {
        biological: "Biological nature of humans",
        social: "Social nature of humans",
        needs: "Human needs",
        activity: "Human activity"
      }
    }
  },
  
  // Quiz Questions
  quiz: {
    money: {
      question1: "Money is?",
      options1: {
        equivalent: "Equivalent",
        product: "Product",
        service: "Service", 
        resource: "Resource"
      },
      explanation1: "Money is a universal equivalent of the value of goods and services."
    }
  },
  
  // Errors
  errors: {
    networkError: "Network error",
    loadingError: "Loading error",
    saveError: "Save error",
    unknownError: "Unknown error"
  },
  
  // Success Messages
  successMessages: {
    progressSaved: "Progress saved",
    backupExported: "Backup exported",
    progressReset: "Progress reset"
  }
};

// Current locale
let currentLocale: "ru" | "en" = "ru";
let currentDict: Dict = ru;

// Set locale
export function setLocale(locale: "ru" | "en") {
  currentLocale = locale;
  currentDict = locale === "en" ? en : ru;
}

// Get current locale
export function getLocale(): "ru" | "en" {
  return currentLocale;
}

// Translation function with nested key support
export function t(key: string, params?: Record<string, string | number>): string {
  const keys = key.split('.');
  let value: any = currentDict;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to key if translation not found
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return String(params[param] || match);
    });
  }
  
  return value;
}

// Get nested object
export function tn(key: string): Record<string, string> {
  const keys = key.split('.');
  let value: any = currentDict;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return {};
    }
  }
  
  return typeof value === 'object' ? value : {};
}

// Export dictionaries for testing
export { ru, en };
