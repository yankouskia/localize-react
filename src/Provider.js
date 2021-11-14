import React, { useEffect } from "react";
import {
  buildTranslation,
  clearCache,
  memoize,
  sanitizeLocale,
} from "./helpers";

export const LocalizationContext = React.createContext();

export function LocalizationProvider({
  children,
  disableCache,
  locale,
  translations = {},
  defaultLocale,
}) {
  const sanitizedLocale = sanitizeLocale(locale, translations);
  const sanitizedDefaultLocale = defaultLocale
    ? sanitizeLocale(defaultLocale, translations)
    : undefined;
  const pureTranslations = sanitizedLocale
    ? translations[sanitizedLocale]
    : translations;
  const pureDefaultTranslations = sanitizedDefaultLocale
    ? translations[sanitizedDefaultLocale]
    : undefined;

  useEffect(() => {
    clearCache();
  }, [locale, translations]);

  function pureTranslateFn(key, values, defaultMessage) {
    if (!pureTranslations || !key) return defaultMessage || key;

    const possibleValue = pureTranslations[key];

    if (typeof possibleValue === "string") {
      if (!values) return possibleValue;

      return buildTranslation(possibleValue, values);
    }

    const fallbackTranslation =
      typeof defaultMessage === "string"
        ? defaultMessage
        : pureDefaultTranslations
        ? pureDefaultTranslations[key] || key
        : key;

    const complexKeyArray = key.split(".");
    if (complexKeyArray.length === 1)
      return buildTranslation(fallbackTranslation, values);

    let finalValue = pureTranslations[complexKeyArray[0]];
    for (let i = 1; i < complexKeyArray.length; i++) {
      if (finalValue) {
        finalValue = finalValue[complexKeyArray[i]];
      }
    }

    return typeof finalValue === "string"
      ? buildTranslation(finalValue, values)
      : buildTranslation(fallbackTranslation, values);
  }

  const translate = disableCache ? pureTranslateFn : memoize(pureTranslateFn);

  return (
    <LocalizationContext.Provider value={{ locale, translate, translations }}>
      {children}
    </LocalizationContext.Provider>
  );
}

export const LocalizationConsumer = LocalizationContext.Consumer;
