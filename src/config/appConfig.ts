// Конфигурация приложения
export interface AppConfig {
  // Режим разработки
  isDev: boolean;

  // Персонализация
  enablePersonalization: boolean;
  enableDemoFill: boolean;
  personalizationDebounceMs: number;

  // Производительность
  enablePerfLogs: boolean;
  enableLazyLoading: boolean;

  // Аналитика
  enableAnalytics: boolean;
  enableABTesting: boolean;

  // Тестирование
  enableTestMode: boolean;
}

// Конфигурация по умолчанию
const defaultConfig: AppConfig = {
  isDev: __DEV__,
  enablePersonalization: true,
  enableDemoFill: __DEV__,
  personalizationDebounceMs: 300,
  enablePerfLogs: __DEV__,
  enableLazyLoading: true,
  enableAnalytics: true,
  enableABTesting: true,
  enableTestMode: false,
};

// Текущая конфигурация
export const appConfig: AppConfig = {
  ...defaultConfig,
  // Можно переопределить через переменные окружения или другие источники
};

// Утилиты для работы с конфигурацией
export const isDev = () => appConfig.isDev;
export const isDemoFillEnabled = () => appConfig.enableDemoFill;
export const getPersonalizationDebounce = () =>
  appConfig.personalizationDebounceMs;
export const isPerfLogsEnabled = () => appConfig.enablePerfLogs;
export const isLazyLoadingEnabled = () => appConfig.enableLazyLoading;
export const isAnalyticsEnabled = () => appConfig.enableAnalytics;
export const isABTestingEnabled = () => appConfig.enableABTesting;
export const isTestMode = () => appConfig.enableTestMode;

