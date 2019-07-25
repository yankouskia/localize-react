import React from 'react';
import { sanitizeLocale } from './helpers';

export const LocalizationContext = React.createContext();

export function LocalizationProvider({ children, locale, translations = {} }) {
  const sanitizedLocale = sanitizeLocale(locale, translations);
  const pureTranslations = sanitizedLocale ? translations[sanitizedLocale] : translations;

  function translate(key) {
    if (!pureTranslations || typeof pureTranslations[key] !== 'string') return key;
    return pureTranslations[key];
  }

  return (
    <LocalizationContext.Provider value={{ locale, translate, translations }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export const LocalizationConsumer = LocalizationContext.Consumer;
