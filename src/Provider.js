import React, { useEffect, useState } from 'react';
import {
  buildTranslation,
  clearCache,
  memoize,
  sanitizeLocale,
} from './helpers';

export const LocalizationContext = React.createContext();

export function LocalizationProvider({ children, disableCache, locale, translations = {} }) {

  const [currentLocale, setLocale] = useState(locale);

  useEffect(() => {
    if (currentLocale !== locale) {
      setLocale(locale)
    }
  }, [locale]);

  const sanitizedLocale = sanitizeLocale(currentLocale, translations);
  const pureTranslations = sanitizedLocale ? translations[sanitizedLocale] : translations;

  useEffect(() => {
    clearCache();
  }, [currentLocale, translations]);

  function pureTranslateFn(key, values, defaultMessage) {
    if (!pureTranslations || !key) return defaultMessage || key;

    const fallbackTranslation = typeof defaultMessage === 'string' ? defaultMessage : key;
    const possibleValue = pureTranslations[key];

    if (typeof possibleValue === 'string') {
      if (!values) return possibleValue;

      return buildTranslation(possibleValue, values);
    }

    const complexKeyArray = key.split('.');
    if (complexKeyArray.length === 1) return buildTranslation(fallbackTranslation, values);

    let finalValue = pureTranslations[complexKeyArray[0]];
    for (let i = 1; i < complexKeyArray.length; i++) {
      if (finalValue) {
        finalValue = finalValue[complexKeyArray[i]];
      }
    }

    return typeof finalValue === 'string' ? buildTranslation(finalValue, values) : buildTranslation(fallbackTranslation, values);
  }

  const translate = disableCache ? pureTranslateFn : memoize(pureTranslateFn);

  return (
    <LocalizationContext.Provider value={{ locale: currentLocale, translate, translations, setLocale }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export const LocalizationConsumer = LocalizationContext.Consumer;
