---
id: switching-locales
title: Switching locales
description: URL, cookie, and localStorage-backed locale state.
---

# Switching locales

`localize-react` is stateless — to switch locales, rerender the provider. Where the locale **lives** is your call.

## URL parameter (recommended)

URL-driven locale means shareable links and SSR-friendliness out of the box.

```tsx
import { LocalizationProvider } from 'localize-react';
import { useSearchParams } from 'react-router-dom';
import { translations } from './i18n/translations';

const SUPPORTED = ['en', 'es', 'fr'] as const;
type Locale = (typeof SUPPORTED)[number];

function pickLocale(input: string | null): Locale {
  return SUPPORTED.includes(input as Locale) ? (input as Locale) : 'en';
}

export function I18nShell({ children }: { children: React.ReactNode }) {
  const [params, setParams] = useSearchParams();
  const locale = pickLocale(params.get('lang'));

  return (
    <LocalizationProvider locale={locale} translations={translations}>
      <LocaleSwitch
        value={locale}
        onChange={(next) => setParams({ lang: next })}
      />
      {children}
    </LocalizationProvider>
  );
}
```

## Cookie

For server-rendered apps where you can't put `?lang=` in every URL:

```tsx
import { LocalizationProvider } from 'localize-react';
import { useEffect, useState } from 'react';

export function I18nShell({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState(getCookie('locale') ?? 'en');

  useEffect(() => {
    document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`;
  }, [locale]);

  return (
    <LocalizationProvider locale={locale} translations={translations}>
      <LocaleSwitch value={locale} onChange={setLocale} />
      {children}
    </LocalizationProvider>
  );
}

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1];
}
```

For SSR, read the cookie on the server and hydrate the provider with the same value.

## `localStorage`

The cheap option for SPAs:

```tsx
const [locale, setLocale] = useState<string>(() => {
  if (typeof window === 'undefined') return 'en';
  return window.localStorage.getItem('locale') ?? 'en';
});

useEffect(() => {
  window.localStorage.setItem('locale', locale);
}, [locale]);
```

## Browser preferences as default

Use the user's accept-language hint when no preference is stored yet:

```ts
function defaultLocale(): string {
  if (typeof navigator === 'undefined') return 'en';
  const [primary] = navigator.languages ?? [navigator.language ?? 'en'];
  return primary?.toLowerCase().split(/[-_]/)[0] ?? 'en';
}
```

…and pass it as the `locale` prop. The library's locale resolver will fold `en-US` → `en` for you, but a quick `split('-')[0]` here makes the cookie/URL value tidier.
