type Dict = Record<string, string>;

const ru: Dict = {
  back: "Назад",
  startLearning: "Начать изучение",
  continueLearning: "Продолжить изучение",
  continue: "Продолжить",
  repeat: "Повторить",
  start: "Начало",
  dashboard: "Дашборд ученика",
  yourProgress: "Ваш прогресс",
  continueStudy: "Продолжить обучение",
  nextBlock: "Следующий блок",
  goToTest: "Перейти к тесту",
  testTitle: "Проверь понимание",
  resultsTitle: "Результаты теста",
  statsTitle: "Моя статистика",
};

const en: Dict = {
  back: "Back",
  startLearning: "Start learning",
  continueLearning: "Continue learning",
  continue: "Continue",
  repeat: "Review",
  start: "Start",
  dashboard: "Student dashboard",
  yourProgress: "Your progress",
  continueStudy: "Continue learning",
  nextBlock: "Next block",
  goToTest: "Go to test",
  testTitle: "Check understanding",
  resultsTitle: "Test results",
  statsTitle: "My statistics",
};

let current: Dict = ru;

export function setLocale(locale: "ru" | "en") {
  current = locale === "en" ? en : ru;
}

export function t(key: keyof typeof ru): string {
  return current[key] || key;
}
