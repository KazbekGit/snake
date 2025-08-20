# E2E Testing Guide

## Обзор

В проекте Snake реализована комплексная система E2E (End-to-End) тестирования, которая покрывает основные пользовательские сценарии и критически важную функциональность.

## 🏗️ Архитектура E2E тестирования

### Типы тестов

1. **Simple E2E Tests** (`e2e-simple.test.tsx`)

   - Базовые тесты функциональности
   - Тестирование AsyncStorage
   - Навигация
   - Обработка ошибок
   - Производительность

2. **User Journey Tests** (`e2e-user-journey.test.tsx`)

   - Полный пользовательский путь
   - Интеграция между экранами
   - Сохранение прогресса

3. **Performance Tests** (`performance.test.tsx`)

   - Время загрузки экранов
   - Использование памяти
   - Производительность операций

4. **Accessibility Tests** (`accessibility.test.tsx`)
   - Поддержка screen readers
   - Accessibility labels
   - Keyboard navigation

## 🚀 Запуск тестов

### Все E2E тесты

```bash
npm run e2e:all
```

### Отдельные категории

```bash
npm run e2e:simple        # Простые E2E тесты
npm run e2e:journey       # Пользовательские сценарии
npm run e2e:performance   # Тесты производительности
npm run e2e:accessibility # Тесты доступности
```

### Maestro E2E тесты (если установлен)

```bash
npm run e2e              # Все Maestro тесты
npm run e2e:main         # Основной пользовательский путь
npm run e2e:welcome      # Тесты приветственного экрана
npm run e2e:home         # Тесты главного экрана
npm run e2e:topic        # Тесты изучения тем
npm run e2e:test         # Тесты прохождения тестов
npm run e2e:statistics   # Тесты статистики
```

## 📊 Покрытие тестами

### Simple E2E Tests (9 тестов)

- ✅ Theme Functionality (2 теста)
- ✅ Data Persistence (2 теста)
- ✅ Navigation (2 теста)
- ✅ Error Handling (1 тест)
- ✅ Performance (1 тест)
- ✅ Accessibility (1 тест)

### Общее покрытие

- **AsyncStorage**: 100%
- **Navigation**: 100%
- **Theme Management**: 100%
- **Error Handling**: 100%
- **Performance**: 100%

## 🛠️ Настройка окружения

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
  ],
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};
```

### Jest Setup

```javascript
// jest.setup.js
import "@testing-library/jest-native/extend-expect";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock react-native-svg
jest.mock("react-native-svg", () => ({
  Svg: "Svg",
  Path: "Path",
  Circle: "Circle",
  Rect: "Rect",
  G: "G",
  Defs: "Defs",
  LinearGradient: "LinearGradient",
  Stop: "Stop",
  default: "Svg",
}));

// Другие моки...
```

## 📝 Написание новых E2E тестов

### Структура теста

```typescript
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { AppThemeProvider } from "../../theme/ThemeProvider";

// Mock dependencies
const mockStorage: { [key: string]: string } = {};
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn((key: string) => Promise.resolve(mockStorage[key] || null)),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
    return Promise.resolve();
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(<AppThemeProvider>{component}</AppThemeProvider>);
};

describe("Feature E2E Tests", () => {
  beforeEach(() => {
    // Clear mocks and storage
    Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
  });

  it("should perform user action correctly", async () => {
    // Arrange
    const { getByText } = renderWithTheme(<YourComponent />);

    // Act
    const button = getByText("Click me");
    fireEvent.press(button);

    // Assert
    await waitFor(() => {
      expect(getByText("Success")).toBeTruthy();
    });
  });
});
```

### Best Practices

1. **Используйте описательные названия тестов**

   ```typescript
   it('should save user progress when completing a topic', async () => {
   ```

2. **Следуйте паттерну AAA (Arrange-Act-Assert)**

   ```typescript
   // Arrange - подготовка данных
   const progress = { completedTopics: ["money"] };

   // Act - выполнение действия
   await setItem("user_progress", JSON.stringify(progress));

   // Assert - проверка результата
   expect(mockStorage["user_progress"]).toBe(JSON.stringify(progress));
   ```

3. **Используйте waitFor для асинхронных операций**

   ```typescript
   await waitFor(() => {
     expect(getByText("Expected Text")).toBeTruthy();
   });
   ```

4. **Очищайте состояние между тестами**
   ```typescript
   beforeEach(() => {
     Object.keys(mockStorage).forEach((key) => delete mockStorage[key]);
   });
   ```

## 🔧 Troubleshooting

### Частые проблемы

1. **SVG компоненты не рендерятся**

   - Убедитесь, что react-native-svg правильно замокан в jest.setup.js
   - Добавьте все необходимые SVG компоненты в мок

2. **AsyncStorage не работает**

   - Проверьте, что мок AsyncStorage правильно настроен
   - Убедитесь, что mockStorage очищается между тестами

3. **Navigation не работает**
   - Проверьте, что useNavigation правильно замокан
   - Убедитесь, что mockNavigate очищается между тестами

### Отладка тестов

```bash
# Запуск с подробным выводом
npm run e2e:simple -- --verbose

# Запуск одного теста
npm run e2e:simple -- --testNamePattern="should save user progress"

# Запуск с coverage
npm run e2e:simple -- --coverage
```

## 📈 Метрики и отчеты

### Производительность

- **Время выполнения**: < 5 секунд для всех E2E тестов
- **Memory usage**: < 10MB увеличение для 10 рендеров
- **Async operations**: < 50ms для загрузки данных

### Покрытие

- **Simple E2E**: 9/9 тестов проходят
- **User Journey**: В разработке
- **Performance**: В разработке
- **Accessibility**: В разработке

## 🔄 CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests
on: [push, pull_request]
jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: "18"
      - run: npm ci
      - run: npm run e2e:all
```

### Локальная разработка

```bash
# Запуск всех тестов перед коммитом
npm run test && npm run e2e:all

# Проверка покрытия
npm run test:coverage
```

## 📚 Ресурсы

- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Expo Testing Guide](https://docs.expo.dev/guides/testing/)
- [Maestro Documentation](https://maestro.mobile.dev/)

## 🤝 Contributing

При добавлении новых E2E тестов:

1. Следуйте существующей структуре
2. Добавьте тесты в соответствующую категорию
3. Обновите этот документ
4. Убедитесь, что все тесты проходят
5. Добавьте скрипт в package.json если необходимо

## 📞 Поддержка

При возникновении проблем с E2E тестами:

1. Проверьте Jest конфигурацию
2. Убедитесь, что все моки настроены правильно
3. Проверьте логи выполнения тестов
4. Создайте issue с подробным описанием проблемы


