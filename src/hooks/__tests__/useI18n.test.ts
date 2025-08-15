import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../useI18n';
import { setLocale } from '../../i18n';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('useI18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setLocale('ru');
  });

  it('should initialize with default locale', () => {
    const { result } = renderHook(() => useI18n());
    
    expect(result.current.locale).toBe('ru');
    expect(result.current.isLoading).toBe(true);
  });

  it('should load saved locale from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('en');
    
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    expect(result.current.locale).toBe('en');
    expect(result.current.isLoading).toBe(false);
    expect(AsyncStorage.getItem).toHaveBeenCalledWith('app_locale');
  });

  it('should handle invalid saved locale', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid');
    
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    expect(result.current.locale).toBe('ru'); // Default
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle AsyncStorage error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    expect(result.current.locale).toBe('ru'); // Default
    expect(result.current.isLoading).toBe(false);
  });

  it('should change locale and save to AsyncStorage', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.changeLocale('en');
    });
    
    expect(result.current.locale).toBe('en');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_locale', 'en');
  });

  it('should handle locale change error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));
    
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    act(() => {
      result.current.changeLocale('en');
    });
    
    // Should still change locale even if save fails
    expect(result.current.locale).toBe('en');
  });

  it('should translate strings correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    expect(result.current.t('back')).toBe('Назад');
    expect(result.current.t('continue')).toBe('Продолжить');
    expect(result.current.t('start')).toBe('Начать');
  });

  it('should translate with parameters', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    expect(result.current.t('blockProgress', { current: 1, total: 4 })).toBe('Блок 1 из 4');
    expect(result.current.t('questionNumber', { current: 2, total: 5 })).toBe('Вопрос 2 из 5');
  });

  it('should translate nested objects', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    const sections = result.current.tn('sectionsList');
    expect(sections).toEqual({
      personSociety: 'Человек и общество',
      economy: 'Экономика',
      socialRelations: 'Социальные отношения',
      politics: 'Политика',
      law: 'Право',
      culture: 'Духовная культура'
    });
  });

  it('should switch languages and update translations', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    // Initial Russian
    expect(result.current.t('back')).toBe('Назад');
    expect(result.current.t('continue')).toBe('Продолжить');
    
    // Switch to English
    act(() => {
      result.current.changeLocale('en');
    });
    
    expect(result.current.t('back')).toBe('Back');
    expect(result.current.t('continue')).toBe('Continue');
  });

  it('should return stable function references', async () => {
    const { result, waitForNextUpdate, rerender } = renderHook(() => useI18n());
    
    await waitForNextUpdate();
    
    const initialT = result.current.t;
    const initialTn = result.current.tn;
    const initialChangeLocale = result.current.changeLocale;
    
    rerender();
    
    expect(result.current.t).toBe(initialT);
    expect(result.current.tn).toBe(initialTn);
    expect(result.current.changeLocale).toBe(initialChangeLocale);
  });
});
