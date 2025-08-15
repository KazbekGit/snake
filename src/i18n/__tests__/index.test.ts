import { t, setLocale, getLocale, ru, en } from '../index';

describe('i18n', () => {
  beforeEach(() => {
    setLocale('ru');
  });

  describe('basic translations', () => {
    it('should translate common strings', () => {
      expect(t('back')).toBe('Назад');
      expect(t('continue')).toBe('Продолжить');
      expect(t('start')).toBe('Начать');
    });

    it('should translate welcome screen strings', () => {
      expect(t('appTitle')).toBe('Обществознание');
      expect(t('appSubtitle')).toBe('Изучайте обществознание');
      expect(t('startButton')).toBe('Начать');
    });

    it('should translate home screen strings', () => {
      expect(t('continueStudy')).toBe('Продолжить обучение');
      expect(t('sectionsTitle')).toBe('Разделы обществознания');
    });

    it('should translate section titles', () => {
      expect(t('sectionsList.personSociety')).toBe('Человек и общество');
      expect(t('sectionsList.economy')).toBe('Экономика');
      expect(t('sectionsList.socialRelations')).toBe('Социальные отношения');
      expect(t('sectionsList.politics')).toBe('Политика');
      expect(t('sectionsList.law')).toBe('Право');
      expect(t('sectionsList.culture')).toBe('Духовная культура');
    });

    it('should translate section descriptions', () => {
      expect(t('sectionDescriptions.personSociety')).toBe('Изучаем природу человека, его место в обществе и основные социальные процессы');
      expect(t('sectionDescriptions.economy')).toBe('Основы экономической теории, рынок, деньги, банки и государственная экономическая политика');
      expect(t('sectionDescriptions.socialRelations')).toBe('Социальная структура, группы, семья, конфликты и социальная политика');
      expect(t('sectionDescriptions.politics')).toBe('Политическая система, государство, выборы, партии и гражданское общество');
      expect(t('sectionDescriptions.law')).toBe('Правовая система, Конституция РФ, права человека и судебная система');
      expect(t('sectionDescriptions.culture')).toBe('Культура, мораль, религия, образование, наука и искусство');
    });

    it('should translate content topics', () => {
      expect(t('contentTopics.money.title')).toBe('Деньги');
      expect(t('contentTopics.money.description')).toBe('Изучаем природу денег, их функции и виды');
    });
  });

  describe('locale management', () => {
    it('should always return Russian locale', () => {
      expect(getLocale()).toBe('ru');
      setLocale('en');
      expect(getLocale()).toBe('ru');
    });

    it('should always use Russian translations', () => {
      setLocale('en');
      expect(t('appTitle')).toBe('Обществознание'); // Still Russian
    });
  });

  describe('parameter replacement', () => {
    it('should replace parameters in strings', () => {
      expect(t('blockProgress', { current: 1, total: 5 })).toBe('Блок 1 из 5');
    });
  });

  describe('fallback behavior', () => {
    it('should return key if translation not found', () => {
      expect(t('nonexistent.key')).toBe('nonexistent.key');
    });
  });
});
