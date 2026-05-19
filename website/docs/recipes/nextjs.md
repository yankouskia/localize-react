---
id: nextjs
title: Next.js (App Router)
description: Server-side locale detection, [locale] segments, client provider.
---

# Next.js (App Router)

A pragmatic setup: `[locale]` URL segments, server-side detection, client-side provider.

## File layout

```
app/
  [locale]/
    layout.tsx        ← reads params.locale, mounts provider
    page.tsx
i18n/
  translations/
    en.json
    es.json
    fr.json
  index.ts
middleware.ts         ← optional: redirect / to /en
```

## `i18n/index.ts`

```ts
import en from './translations/en.json';
import es from './translations/es.json';
import fr from './translations/fr.json';

export const SUPPORTED = ['en', 'es', 'fr'] as const;
export type Locale = (typeof SUPPORTED)[number];

export const translations = { en, es, fr };

export function pickLocale(input: string | undefined): Locale {
  return SUPPORTED.includes(input as Locale) ? (input as Locale) : 'en';
}
```

## `app/[locale]/layout.tsx` — client provider

```tsx
'use client';

import { LocalizationProvider } from 'localize-react';
import { type Locale, translations } from '@/i18n';

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  return (
    <html lang={params.locale}>
      <body>
        <LocalizationProvider
          locale={params.locale}
          translations={translations}
        >
          {children}
        </LocalizationProvider>
      </body>
    </html>
  );
}
```

## `middleware.ts` — redirect bare paths

```ts
import { NextResponse, type NextRequest } from 'next/server';
import { pickLocale, SUPPORTED } from '@/i18n';

export const config = { matcher: ['/((?!_next|api|.*\\..*).*)'] };

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (SUPPORTED.some((l) => pathname.startsWith(`/${l}`))) return;

  const accept = req.headers.get('accept-language') ?? 'en';
  const primary = accept.split(',')[0]?.split('-')[0];
  const locale = pickLocale(primary);

  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}
```

## Pure server-side translate (no client provider)

For static pages where you don't need a provider:

```tsx title="app/[locale]/page.tsx"
import { translations, pickLocale } from '@/i18n';

export default async function Page({ params }: { params: { locale: string } }) {
  const locale = pickLocale(params.locale);
  const t = (key: string) =>
    key
      .split('.')
      .reduce<unknown>(
        (cursor, seg) =>
          cursor && typeof cursor === 'object'
            ? (cursor as Record<string, unknown>)[seg]
            : undefined,
        translations[locale],
      ) as string | undefined;

  return <h1>{t('greeting.hello') ?? 'Hello'}</h1>;
}
```

For richer needs, render `<Message />` from a client subtree.

## App Router caveats

- `LocalizationProvider` is a client component. Mark the file `'use client'` once at the layout level; everything below it inherits the context.
- Heavy translation maps don't need to be in client-bundle if your leaves are loaded on the server — pass them down as serializable props from a server component.
