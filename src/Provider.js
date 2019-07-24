import React from 'react';

const DEFAULT_LOCALE = 'en';

export const LocalizationContext = React.createContext();

export function LocalizationProvider({ children, defaultLocale = DEFAULT_LOCALE, locale = DEFAULT_LOCALE, translations = {} }) {
  function translate(key) {
    const requestedTranslation = translations[locale] && translations[locale][key];
    if (typeof requestedTranslation === 'string') return requestedTranslation;

    const fallbackTranslation = translations[defaultLocale] && translations[defaultLocale][key];
    if (typeof fallbackTranslation === 'string') return fallbackTranslation;

    return key;
  }

  return (
    <LocalizationContext.Provider value={{ defaultLocale, locale, translate, translations }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export const LocalizationConsumer = LocalizationContext.Consumer;
