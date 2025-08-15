import { t, tn, setLocale, getLocale, ru, en } from '../index';

describe('i18n', () => {
  beforeEach(() => {
    setLocale('ru');
  });

  describe('setLocale', () => {
    it('should set locale correctly', () => {
      setLocale('en');
      expect(getLocale()).toBe('en');
      
      setLocale('ru');
      expect(getLocale()).toBe('ru');
    });
  });

  describe('t function', () => {
    it('should translate simple keys', () => {
      expect(t('back')).toBe('Назад');
      expect(t('continue')).toBe('Продолжить');
      expect(t('start')).toBe('Начать');
    });

    it('should translate nested keys', () => {
      expect(t('appTitle')).toBe('Обществознание');
      expect(t('appSubtitle')).toBe('Изучайте обществознание');
      expect(t('startButton')).toBe('Начать');
    });

    it('should handle parameters', () => {
      expect(t('blockProgress', { current: 1, total: 4 })).toBe('Блок 1 из 4');
      expect(t('questionNumber', { current: 2, total: 5 })).toBe('Вопрос 2 из 5');
    });

    it('should fallback to key if translation not found', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });

    it('should switch languages correctly', () => {
      setLocale('en');
      expect(t('back')).toBe('Back');
      expect(t('continue')).toBe('Continue');
      expect(t('start')).toBe('Start');
      
      setLocale('ru');
      expect(t('back')).toBe('Назад');
      expect(t('continue')).toBe('Продолжить');
      expect(t('start')).toBe('Начать');
    });

    it('should handle complex nested structures', () => {
      expect(t('topics.money.title')).toBe('Деньги');
      expect(t('topics.money.description')).toBe('Изучаем природу денег');
      expect(t('topics.money.blocks.definition')).toBe('Определение');
    });
  });

  describe('tn function', () => {
    it('should return nested objects', () => {
      const sections = tn('sectionsList');
      expect(sections).toEqual({
        personSociety: 'Человек и общество',
        economy: 'Экономика',
        socialRelations: 'Социальные отношения',
        politics: 'Политика',
        law: 'Право',
        culture: 'Духовная культура'
      });
    });

    it('should return empty object for non-existent keys', () => {
      expect(tn('nonexistent.key')).toEqual({});
    });

    it('should handle different languages', () => {
      setLocale('en');
      const sectionsEn = tn('sectionsList');
      expect(sectionsEn).toEqual({
        personSociety: 'Person and Society',
        economy: 'Economy',
        socialRelations: 'Social Relations',
        politics: 'Politics',
        law: 'Law',
        culture: 'Spiritual Culture'
      });
    });
  });

  describe('dictionaries', () => {
    it('should have complete Russian translations', () => {
      expect(ru.appTitle).toBe('Обществознание');
      expect(ru.appSubtitle).toBe('Изучайте обществознание');
      expect(ru.startButton).toBe('Начать');
      expect(ru.back).toBe('Назад');
      expect(ru.continue).toBe('Продолжить');
    });

    it('should have complete English translations', () => {
      expect(en.appTitle).toBe('Social Studies');
      expect(en.appSubtitle).toBe('Learn social studies');
      expect(en.startButton).toBe('Start');
      expect(en.back).toBe('Back');
      expect(en.continue).toBe('Continue');
    });

    it('should have matching structure', () => {
      const ruKeys = Object.keys(ru);
      const enKeys = Object.keys(en);
      
      expect(ruKeys).toEqual(enKeys);
    });

    it('should have all required sections', () => {
      const requiredSections = [
        'appTitle', 'appSubtitle', 'startButton', 'back', 'continue',
        'sectionsList', 'actions', 'topics', 'errors', 'success'
      ];
      
      requiredSections.forEach(section => {
        expect(ru).toHaveProperty(section);
        expect(en).toHaveProperty(section);
      });
    });
  });

  describe('topic translations', () => {
    it('should translate money topic correctly', () => {
      expect(t('topics.money.title')).toBe('Деньги');
      expect(t('topics.money.description')).toBe('Изучаем природу денег');
      expect(t('topics.money.blocks.definition')).toBe('Определение');
      expect(t('topics.money.blocks.functions')).toBe('Функции');
      expect(t('topics.money.blocks.types')).toBe('Виды');
      expect(t('topics.money.blocks.summary')).toBe('Итоги');
    });

    it('should translate market topic correctly', () => {
      expect(t('topics.market.title')).toBe('Рынок');
      expect(t('topics.market.description')).toBe('Изучаем рыночную экономику');
      expect(t('topics.market.blocks.definition')).toBe('Что такое рынок?');
      expect(t('topics.market.blocks.supplyDemand')).toBe('Спрос и предложение');
    });

    it('should translate human nature topic correctly', () => {
      expect(t('topics.humanNature.title')).toBe('Природа человека');
      expect(t('topics.humanNature.description')).toBe('Изучаем биологическую и социальную природу человека');
      expect(t('topics.humanNature.blocks.biological')).toBe('Биологическая природа человека');
      expect(t('topics.humanNature.blocks.social')).toBe('Социальная природа человека');
    });
  });

  describe('quiz translations', () => {
    it('should translate quiz questions correctly', () => {
      expect(t('quiz.money.question1')).toBe('Деньги — это?');
      expect(t('quiz.money.options1.equivalent')).toBe('Эквивалент');
      expect(t('quiz.money.options1.product')).toBe('Товар');
      expect(t('quiz.money.explanation1')).toBe('Деньги — это всеобщий эквивалент стоимости товаров и услуг.');
    });
  });

  describe('error and success messages', () => {
    it('should translate error messages', () => {
      expect(t('errors.networkError')).toBe('Ошибка сети');
      expect(t('errors.loadingError')).toBe('Ошибка загрузки');
      expect(t('errors.saveError')).toBe('Ошибка сохранения');
      expect(t('errors.unknownError')).toBe('Неизвестная ошибка');
    });

    it('should translate success messages', () => {
      expect(t('success.progressSaved')).toBe('Прогресс сохранен');
      expect(t('success.backupExported')).toBe('Резервная копия экспортирована');
      expect(t('success.progressReset')).toBe('Прогресс сброшен');
    });
  });
});
