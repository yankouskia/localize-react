import React, { useEffect } from 'react';
import {
  buildTranslation,
  clearCache,
  memoize,
  sanitizeLocale,
} from './helpers';

export const LocalizationContext = React.createContext();

export function LocalizationProvider({ children, disableCache, locale, translations = {} }) {
  const sanitizedLocale = sanitizeLocale(locale, translations);
  const pureTranslations = sanitizedLocale ? translations[sanitizedLocale] : translations;

  useEffect(() => {
    clearCache();
  }, [locale, translations]);

  function pureTranslateFn(key, values) {
    if (!pureTranslations || !key) return key;

    const possibleValue = pureTranslations[key];

    if (typeof possibleValue === 'string') {
      if (!values) return possibleValue;

      return buildTranslation(possibleValue, values);
    }

    const complexKeyArray = key.split('.');
    if (complexKeyArray.length === 1) return buildTranslation(key, values);

    let finalValue = pureTranslations[complexKeyArray[0]];
    for (let i = 1; i < complexKeyArray.length; i++) {
      if (finalValue) {
        finalValue = finalValue[complexKeyArray[i]];
      }
    }

    return typeof finalValue === 'string' ? buildTranslation(finalValue, values) : buildTranslation(key, values);
  }

  const translate = disableCache ? pureTranslateFn : memoize(pureTranslateFn);

  return (
    <LocalizationContext.Provider value={{ locale, translate, translations }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export const LocalizationConsumer = LocalizationContext.Consumer;
