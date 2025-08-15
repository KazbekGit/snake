# Internationalization (i18n)

Система интернационализации для приложения Social Studies с поддержкой русского и английского языков.

## 📁 Структура

```
src/i18n/
├── index.ts              # Основная система i18n
├── README.md             # Эта документация
└── __tests__/
    └── index.test.ts     # Тесты системы i18n
```

## 🚀 Быстрый старт

### Импорт и использование

```typescript
import { t, tn, setLocale, getLocale } from '../i18n';

// Простой перевод
const backText = t('back'); // "Назад" или "Back"

// Перевод с параметрами
const progressText = t('blockProgress', { current: 1, total: 4 }); 
// "Блок 1 из 4" или "Block 1 of 4"

// Получение объекта переводов
const sections = tn('sectionsList');
// { personSociety: "Человек и общество", economy: "Экономика", ... }
```

### Использование в React компонентах

```typescript
import { useI18n } from '../hooks/useI18n';

function MyComponent() {
  const { t, locale, changeLocale } = useI18n();
  
  return (
    <View>
      <Text>{t('appTitle')}</Text>
      <Button 
        title={t('startButton')} 
        onPress={() => changeLocale(locale === 'ru' ? 'en' : 'ru')} 
      />
    </View>
  );
}
```

## 🔧 API

### Основные функции

#### `t(key: string, params?: Record<string, string | number>): string`
Переводит ключ в текущий язык.

```typescript
t('back') // "Назад" или "Back"
t('blockProgress', { current: 1, total: 4 }) // "Блок 1 из 4"
```

#### `tn(key: string): Record<string, string>`
Возвращает объект переводов для вложенного ключа.

```typescript
tn('sectionsList') // { personSociety: "...", economy: "...", ... }
```

#### `setLocale(locale: 'ru' | 'en'): void`
Устанавливает текущий язык.

```typescript
setLocale('en'); // Переключает на английский
```

#### `getLocale(): 'ru' | 'en'`
Возвращает текущий язык.

```typescript
const currentLang = getLocale(); // "ru" или "en"
```

### React Hook

#### `useI18n()`
Хук для работы с интернационализацией в React компонентах.

```typescript
const { 
  locale,           // Текущий язык
  isLoading,        // Загружается ли сохраненный язык
  changeLocale,     // Функция смены языка
  t,                // Функция перевода
  tn                // Функция получения объекта переводов
} = useI18n();
```

## 📝 Структура переводов

### Основные разделы

```typescript
{
  // Общие элементы
  back: "Назад",
  continue: "Продолжить",
  start: "Начать",
  
  // Навигация
  home: "Главная",
  topics: "Темы",
  statistics: "Статистика",
  
  // Экраны приложения
  appTitle: "Обществознание",
  appSubtitle: "Изучайте обществознание",
  
  // Разделы
  sectionsList: {
    personSociety: "Человек и общество",
    economy: "Экономика",
    // ...
  },
  
  // Темы
  topics: {
    money: {
      title: "Деньги",
      description: "Изучаем природу денег",
      blocks: {
        definition: "Определение",
        functions: "Функции",
        // ...
      }
    }
  },
  
  // Ошибки и сообщения
  errors: {
    networkError: "Ошибка сети",
    // ...
  },
  
  success: {
    progressSaved: "Прогресс сохранен",
    // ...
  }
}
```

### Вложенные ключи

Используйте точку для доступа к вложенным ключам:

```typescript
t('topics.money.title')           // "Деньги"
t('topics.money.blocks.definition') // "Определение"
t('sectionsList.economy')         // "Экономика"
```

### Параметры в переводах

Используйте `{paramName}` для подстановки параметров:

```typescript
// В переводе: "Блок {current} из {total}"
t('blockProgress', { current: 1, total: 4 }) // "Блок 1 из 4"

// В переводе: "Сбросить тему «{topic}»"
t('resetTopicProgress', { topic: 'Деньги' }) // "Сбросить тему «Деньги»"
```

## 🌐 Поддерживаемые языки

### Русский (ru)
- Основной язык приложения
- Полная локализация всех элементов
- Адаптированные термины для российского образования

### Английский (en)
- Международная версия
- Академическая терминология
- Соответствие международным стандартам

## 💾 Сохранение настроек

Система автоматически сохраняет выбранный язык в AsyncStorage:

```typescript
// Ключ сохранения
const LOCALE_STORAGE_KEY = 'app_locale';

// Автоматическая загрузка при запуске
useEffect(() => {
  loadSavedLocale();
}, []);
```

## 🧪 Тестирование

### Запуск тестов

```bash
# Тесты системы i18n
npm test src/i18n/__tests__/index.test.ts

# Тесты React хука
npm test src/hooks/__tests__/useI18n.test.ts

# Все тесты
npm test
```

### Покрытие тестами

- ✅ Переводы (простые и вложенные ключи)
- ✅ Параметры в переводах
- ✅ Переключение языков
- ✅ Fallback для отсутствующих переводов
- ✅ React хук (инициализация, смена языка, сохранение)
- ✅ Обработка ошибок AsyncStorage

## 🔄 Добавление новых переводов

### 1. Добавьте переводы в словари

```typescript
// В src/i18n/index.ts
const ru: Dict = {
  // ... существующие переводы
  newSection: {
    title: "Новый раздел",
    description: "Описание нового раздела"
  }
};

const en: Dict = {
  // ... существующие переводы
  newSection: {
    title: "New Section",
    description: "Description of new section"
  }
};
```

### 2. Используйте в компонентах

```typescript
const { t } = useI18n();

return (
  <View>
    <Text>{t('newSection.title')}</Text>
    <Text>{t('newSection.description')}</Text>
  </View>
);
```

### 3. Добавьте тесты

```typescript
it('should translate new section', () => {
  expect(t('newSection.title')).toBe('Новый раздел');
  expect(t('newSection.description')).toBe('Описание нового раздела');
});
```

## 📊 Статистика переводов

### Покрытие
- **Общие элементы**: 100% (15 ключей)
- **Навигация**: 100% (4 ключа)
- **Экраны**: 100% (20+ ключей)
- **Темы**: 100% (3 темы, 12 блоков)
- **Тесты**: 100% (вопросы, ответы, объяснения)
- **Ошибки и сообщения**: 100% (8 ключей)

### Структура
- **Всего ключей**: 150+
- **Вложенных объектов**: 15
- **Параметризованных строк**: 10
- **Языков**: 2 (ru/en)

## 🎯 Лучшие практики

### 1. Используйте описательные ключи
```typescript
// ✅ Хорошо
t('topics.money.blocks.definition')

// ❌ Плохо
t('t.m.b.d')
```

### 2. Группируйте связанные переводы
```typescript
topics: {
  money: {
    title: "Деньги",
    description: "Изучаем природу денег",
    blocks: { /* ... */ }
  }
}
```

### 3. Используйте параметры для динамического контента
```typescript
// ✅ Хорошо
t('blockProgress', { current: 1, total: 4 })

// ❌ Плохо
t('blockProgress1of4')
```

### 4. Добавляйте fallback для отсутствующих переводов
```typescript
// Система автоматически возвращает ключ если перевод не найден
t('nonexistent.key') // Возвращает "nonexistent.key"
```

### 5. Тестируйте переводы
```typescript
it('should translate all required keys', () => {
  expect(t('appTitle')).toBe('Обществознание');
  expect(t('startButton')).toBe('Начать');
});
```

## 🔧 Конфигурация

### Настройка по умолчанию
- **Язык по умолчанию**: Русский (ru)
- **Ключ сохранения**: `app_locale`
- **Поддержка параметров**: ✅
- **Fallback**: Ключ перевода

### Расширение системы

Для добавления нового языка:

1. Создайте словарь переводов
2. Добавьте в `setLocale` функцию
3. Обновите типы
4. Добавьте тесты

```typescript
const es: Dict = {
  appTitle: "Estudios Sociales",
  // ...
};

export function setLocale(locale: "ru" | "en" | "es") {
  currentDict = locale === "en" ? en : locale === "es" ? es : ru;
}
```

## 📚 Ресурсы

- [React Native i18n](https://github.com/react-native-community/react-native-localize)
- [i18next](https://www.i18next.com/)
- [React i18next](https://react.i18next.com/)
- [ICU Message Format](https://formatjs.io/docs/intl-messageformat/)
