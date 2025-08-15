import { useCallback, useEffect, useState } from 'react';
import { t, tn, setLocale, getLocale } from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCALE_STORAGE_KEY = 'app_locale';

export function useI18n() {
  const [currentLocale, setCurrentLocale] = useState<'ru' | 'en'>(getLocale());
  const [isLoading, setIsLoading] = useState(true);

  // Load saved locale on mount
  useEffect(() => {
    loadSavedLocale();
  }, []);

  const loadSavedLocale = useCallback(async () => {
    try {
      const savedLocale = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale && (savedLocale === 'ru' || savedLocale === 'en')) {
        setCurrentLocale(savedLocale);
        setLocale(savedLocale);
      }
    } catch (error) {
      console.warn('Failed to load saved locale:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const changeLocale = useCallback(async (locale: 'ru' | 'en') => {
    try {
      await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
      setCurrentLocale(locale);
      setLocale(locale);
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
