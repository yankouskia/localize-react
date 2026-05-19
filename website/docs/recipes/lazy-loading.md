---
id: lazy-loading
title: Lazy-loading translations
description: Split locale bundles, load on demand with React.Suspense.
---

# Lazy-loading translations

Translations are just an object — load it however your bundler prefers. Below is a minimal Suspense-friendly pattern.

## Per-locale chunks

```ts title="src/i18n/load.ts"
export type Locale = 'en' | 'es' | 'fr';

const loaders = {
  en: () => import('./locales/en.json'),
  es: () => import('./locales/es.json'),
  fr: () => import('./locales/fr.json'),
} as const;

const cache = new Map<Locale, Record<string, unknown>>();

export function loadLocale(locale: Locale): Promise<Record<string, unknown>> {
  const cached = cache.get(locale);
  if (cached) return Promise.resolve(cached);
  return loaders[locale]().then((mod) => {
    cache.set(locale, mod.default);
    return mod.default;
  });
}
```

## Suspending provider

```tsx title="src/i18n/SuspenseProvider.tsx"
import { LocalizationProvider } from 'localize-react';
import { use, type ReactNode } from 'react';
import { loadLocale, type Locale } from './load';

const promises = new Map<Locale, Promise<Record<string, unknown>>>();

function getResource(locale: Locale) {
  let p = promises.get(locale);
  if (!p) {
    p = loadLocale(locale);
    promises.set(locale, p);
  }
  return p;
}

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const translations = use(getResource(locale));
  return (
    <LocalizationProvider
      locale={locale}
      translations={{ [locale]: translations }}
    >
      {children}
    </LocalizationProvider>
  );
}
```

`React.use()` (React 19+) lets you read the promise synchronously and suspends the tree while it resolves.

## Mounting with Suspense

```tsx
import { Suspense } from 'react';
import { I18nProvider } from './i18n/SuspenseProvider';

export function App({ locale }: { locale: Locale }) {
  return (
    <Suspense fallback={<SplashScreen />}>
      <I18nProvider locale={locale}>
        <Shell />
      </I18nProvider>
    </Suspense>
  );
}
```

## Preloading

When the user hovers a "Switch language" button, kick off the load:

```tsx
<button onMouseEnter={() => loadLocale('fr')} onClick={() => setLocale('fr')}>
  Français
</button>
```

By the time the click registers, the bundle is usually already cached.

## React 17/18 fallback

If you're not on React 19 yet, swap `React.use(promise)` for the older [Suspense-able resource pattern](https://github.com/facebook/react/discussions/16965) — a tiny custom resource that throws the promise the first time and returns the value once resolved.
