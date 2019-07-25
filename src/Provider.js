import React from 'react';
import { sanitizeLocale, memoize } from './helpers';

export const LocalizationContext = React.createContext();

export function LocalizationProvider({ children, locale, translations = {} }) {
  const sanitizedLocale = sanitizeLocale(locale, translations);
  const pureTranslations = sanitizedLocale ? translations[sanitizedLocale] : translations;

  function pureTranslateFn(key) {
    if (!pureTranslations || !key) return key;
    if (typeof pureTranslations[key] === 'string') return pureTranslations[key];

    const complexKeyArray = key.split('.');
    if (complexKeyArray.length === 1) return key;

    let finalValue = pureTranslations[complexKeyArray[0]];
    for (let i = 1; i < complexKeyArray.length; i++) {
      if (finalValue) {
        finalValue = finalValue[complexKeyArray[i]];
      }
    }

    return typeof finalValue === 'string' ? finalValue : key;
  }

  const translate = memoize(pureTranslateFn);

  return (
    <LocalizationContext.Provider value={{ locale, translate, translations }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export const LocalizationConsumer = LocalizationContext.Consumer;
