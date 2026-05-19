---
id: vite
title: Vite + React Router
description: Per-locale code-splits via import.meta.glob.
---

# Vite + React Router

Vite's `import.meta.glob` makes per-locale code-splits a one-liner.

## Discovering locale bundles

```ts title="src/i18n/load.ts"
// Each JSON becomes its own chunk; the import is async by default.
const loaders = import.meta.glob<{ default: Record<string, unknown> }>(
  './locales/*.json',
);

export async function loadLocale(locale: string) {
  const loader = loaders[`./locales/${locale}.json`];
  if (!loader) throw new Error(`Unknown locale: ${locale}`);
  const mod = await loader();
  return mod.default;
}
```

## Suspense provider

```tsx title="src/i18n/Provider.tsx"
import { LocalizationProvider } from 'localize-react';
import { use, type ReactNode } from 'react';
import { loadLocale } from './load';

const cache = new Map<string, Promise<Record<string, unknown>>>();

function get(locale: string) {
  let p = cache.get(locale);
  if (!p) {
    p = loadLocale(locale);
    cache.set(locale, p);
  }
  return p;
}

export function I18nProvider({
  locale,
  children,
}: {
  locale: string;
  children: ReactNode;
}) {
  const tree = use(get(locale));
  return (
    <LocalizationProvider locale={locale} translations={{ [locale]: tree }}>
      {children}
    </LocalizationProvider>
  );
}
```

## Router wiring

```tsx title="src/main.tsx"
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useParams,
} from 'react-router-dom';
import { Suspense } from 'react';
import { I18nProvider } from './i18n/Provider';
import { Home } from './pages/Home';

function LocaleShell() {
  const { locale = 'en' } = useParams();
  return (
    <Suspense fallback="Loading…">
      <I18nProvider locale={locale}>
        <Outlet />
      </I18nProvider>
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/:locale',
    element: <LocaleShell />,
    children: [{ index: true, element: <Home /> }],
  },
]);

createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
);
```

## Result

- Visiting `/en` loads only `en.json`.
- Switching to `/fr` triggers a single network request for `fr.json`, then hydrates.
- The main bundle stays tiny — only `localize-react` plus your app code.

## Static-import alternative (no Suspense)

If your translation files are small, just import them statically and skip lazy-loading entirely:

```ts
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

export const translations = { en, es, fr };
```

Less moving parts, instant locale switches, slightly larger initial bundle.
