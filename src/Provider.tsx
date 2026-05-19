import { createContext, useEffect, useMemo } from 'react';

import {
  buildTranslation,
  clearCache,
  memoize,
  sanitizeLocale,
} from './helpers.js';
import type {
  LocalizationContextValue,
  LocalizationProviderProps,
  TemplateValues,
  Translate,
  Translations,
} from './types.js';

const DEFAULT_CONTEXT_VALUE: LocalizationContextValue = {
  locale: undefined,
  translate: (descriptor, _values, defaultMessage) =>
    defaultMessage ?? descriptor,
  translations: {},
};

/**
 * React context carrying the active translate function. Prefer
 * {@link useLocalize} or {@link LocalizationConsumer} in new code;
 * `static contextType = LocalizationContext` is supported for legacy
 * class components.
 */
export const LocalizationContext = createContext<LocalizationContextValue>(
  DEFAULT_CONTEXT_VALUE,
);

LocalizationContext.displayName = 'LocalizationContext';

/**
 * Provides translation data to descendants. Wrap the root of your app
 * (or the subtree that needs translations) with this component.
 *
 * @example
 * ```tsx
 * <LocalizationProvider locale="en" translations={messages}>
 *   <App />
 * </LocalizationProvider>
 * ```
 */
export function LocalizationProvider({
  children,
  disableCache = false,
  locale,
  translations = {},
}: LocalizationProviderProps): React.JSX.Element {
  const pureTranslations = useMemo<Translations>(() => {
    const sanitizedLocale = sanitizeLocale(locale, translations);
    const localeTranslations: Translations | string | undefined =
      sanitizedLocale === null ? translations : translations[sanitizedLocale];
    return localeTranslations && typeof localeTranslations === 'object'
      ? localeTranslations
      : {};
  }, [locale, translations]);

  useEffect(() => {
    clearCache();
  }, [locale, translations]);

  const translate = useMemo<Translate>(() => {
    const pureTranslate: Translate = (descriptor, values, defaultMessage) => {
      if (!descriptor) return defaultMessage ?? descriptor;

      const fallback =
        typeof defaultMessage === 'string' ? defaultMessage : descriptor;

      const direct = pureTranslations[descriptor];
      if (typeof direct === 'string') {
        return values ? buildTranslation(direct, values) : direct;
      }

      const segments = descriptor.split('.');
      if (segments.length === 1) {
        return buildTranslation(fallback, values);
      }

      const resolved = resolveNestedKey(pureTranslations, segments);
      return typeof resolved === 'string'
        ? buildTranslation(resolved, values)
        : buildTranslation(fallback, values);
    };

    return disableCache ? pureTranslate : memoize(pureTranslate);
  }, [disableCache, pureTranslations]);

  const value = useMemo<LocalizationContextValue>(
    () => ({ locale, translate, translations }),
    [locale, translate, translations],
  );

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

/**
 * Render-prop consumer for {@link LocalizationContext}. Prefer
 * {@link useLocalize} in function components.
 */
export const LocalizationConsumer = LocalizationContext.Consumer;

function resolveNestedKey(
  tree: Translations,
  segments: readonly string[],
): string | undefined {
  let cursor: string | Translations | undefined = tree;
  for (const segment of segments) {
    if (cursor === undefined || typeof cursor === 'string') return undefined;
    cursor = cursor[segment];
  }
  return typeof cursor === 'string' ? cursor : undefined;
}

// `TemplateValues` re-export keeps the file self-contained for the
// snapshot of the public type surface; do not remove without updating
// `src/index.ts`.
export type { TemplateValues };
