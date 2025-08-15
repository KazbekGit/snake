import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useI18n } from '../hooks/useI18n';
import { ds } from './theme';

interface LanguageSwitcherProps {
  style?: any;
}

export function LanguageSwitcher({ style }: LanguageSwitcherProps) {
  const { locale, changeLocale } = useI18n();

  const handleLanguageChange = () => {
    const newLocale = locale === 'ru' ? 'en' : 'ru';
    changeLocale(newLocale);
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleLanguageChange}
      activeOpacity={0.7}
    >
      <View style={styles.languageContainer}>
        <Text style={[styles.languageText, locale === 'ru' && styles.activeLanguage]}>
          RU
        </Text>
        <Text style={styles.separator}>|</Text>
        <Text style={[styles.languageText, locale === 'en' && styles.activeLanguage]}>
          EN
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: ds.spacing.sm,
    paddingVertical: ds.spacing.xs,
    borderRadius: ds.radius.md,
    backgroundColor: ds.colors.surface,
    borderWidth: 1,
    borderColor: ds.colors.border,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
    color: ds.colors.textSecondary,
    paddingHorizontal: ds.spacing.xs,
  },
  activeLanguage: {
    color: ds.colors.primary,
    fontWeight: '600',
  },
  separator: {
    fontSize: 14,
    color: ds.colors.textSecondary,
    marginHorizontal: ds.spacing.xs,
  },
});
