import { useCallback, useEffect, useState } from 'react';
import { t, tn, setLocale, getLocale } from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCALE_STORAGE_KEY = 'app_locale';

export function useI18n() {
  // Always use Russian for this app
  const [currentLocale, setCurrentLocale] = useState<'ru' | 'en'>('ru');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved locale on mount (but always use Russian)
  useEffect(() => {
    loadSavedLocale();
  }, []);

  const loadSavedLocale = useCallback(async () => {
    try {
      // Always set to Russian regardless of saved locale
      setCurrentLocale('ru');
      setLocale('ru');
    } catch (error) {
      console.warn('Failed to load saved locale:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changeLocale = useCallback(async (locale: 'ru' | 'en') => {
    // Always use Russian regardless of requested locale
    setCurrentLocale('ru');
    setLocale('ru');
    
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, 'ru');
    } catch (error) {
      console.error('Failed to save locale:', error);
    }
  }, []);

  const translate = useCallback((key: string, params?: Record<string, string | number>) => {
    return t(key, params);
  }, []);

  const translateNested = useCallback((key: string) => {
    return tn(key);
  }, []);

  return {
    locale: currentLocale,
    isLoading,
    changeLocale,
    t: translate,
    tn: translateNested,
  };
}
