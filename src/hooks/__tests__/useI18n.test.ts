import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../useI18n';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const waitForAsync = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

describe('useI18n', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with Russian locale', async () => {
    const { result } = renderHook(() => useI18n());

    expect(result.current.locale).toBe('ru');
    
    // Wait for the effect to complete
    await waitForAsync(10);
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should always use Russian locale regardless of saved locale', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('en');
    
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    // Should always be Russian even if saved locale was English
    expect(result.current.locale).toBe('ru');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle invalid saved locale', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid');
    
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    expect(result.current.locale).toBe('ru');
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle AsyncStorage error gracefully', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));
    
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    expect(result.current.locale).toBe('ru');
    expect(result.current.isLoading).toBe(false);
  });

  it('should always save Russian locale regardless of requested locale', async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    await act(async () => {
      await result.current.changeLocale('en');
    });
    
    // Should always be Russian
    expect(result.current.locale).toBe('ru');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('app_locale', 'ru');
  });

  it('should handle locale change error', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Save error'));
    
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    await act(async () => {
      await result.current.changeLocale('en');
    });
    
    // Should still be Russian even if save fails
    expect(result.current.locale).toBe('ru');
  });

  it('should translate strings correctly', async () => {
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    expect(result.current.t('back')).toBe('Назад');
    expect(result.current.t('continue')).toBe('Продолжить');
    expect(result.current.t('start')).toBe('Начать');
  });

  it('should translate with parameters', async () => {
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    expect(result.current.t('blockProgress', { current: 1, total: 5 })).toBe('Блок 1 из 5');
  });

  it('should translate nested objects', async () => {
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
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

  it('should always use Russian translations', async () => {
    const { result } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    // Should always be Russian
    expect(result.current.locale).toBe('ru');
    expect(result.current.t('back')).toBe('Назад');
    expect(result.current.t('continue')).toBe('Продолжить');
    
    // Even if we try to switch to English, it should stay Russian
    await act(async () => {
      await result.current.changeLocale('en');
    });
    
    await waitForAsync(10);
    
    expect(result.current.locale).toBe('ru');
    expect(result.current.t('back')).toBe('Назад');
    expect(result.current.t('continue')).toBe('Продолжить');
  });

  it('should return stable function references', async () => {
    const { result, rerender } = renderHook(() => useI18n());
    
    await waitForAsync(10);
    
    const initialT = result.current.t;
    const initialChangeLocale = result.current.changeLocale;
    
    rerender();
    
    expect(result.current.t).toBe(initialT);
    expect(result.current.changeLocale).toBe(initialChangeLocale);
  });
});
