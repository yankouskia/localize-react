---
id: intro
title: Introduction
slug: /intro
sidebar_position: 1
description: Tiny, type-safe React i18n built on Context and hooks. < 1 kB, zero dependencies, dual ESM + CJS.
---

# localize-react

> The smallest thing that works.

**`localize-react`** is a tiny React i18n library that does one thing well: turn translation keys into rendered strings, with mustache-style interpolation. No ICU MessageFormat, no plural rules, no auto-extraction toolchain. Just `<Provider>`, `useLocalize()`, and `<Message />`.

```tsx
import { LocalizationProvider, useLocalize } from 'localize-react';

const translations = {
  en: { hello: 'Hi {{name}}!' },
  es: { hello: '¡Hola {{name}}!' },
};

function Greeting() {
  const { translate } = useLocalize();
  return <h1>{translate('hello', { name: 'Alex' })}</h1>;
}

export default function App() {
  return (
    <LocalizationProvider locale="en" translations={translations}>
      <Greeting />
    </LocalizationProvider>
  );
}
```

## Why a tiny i18n library?

Most i18n libraries are 30–80 kB and bring opinions about pluralization, date/number formatting, ICU MessageFormat, lazy chunk loading, and TMS integrations. Excellent for a 50-language product — overkill for the other 90% of React apps.

`localize-react` covers the 90% case:

- A nested translations tree, keyed by locale.
- Dot-path lookups (`'cart.summary'`).
- `{{name}}`-style interpolation.
- A graceful fallback when keys are missing.
- That's it.

For everything else (plurals, currency, dates), reach for the platform: `Intl.PluralRules`, `Intl.NumberFormat`, `Intl.DateTimeFormat`. They're free, fast, and already in the browser.

## Specs at a glance

| Property        | Value                                          |
| --------------- | ---------------------------------------------- |
| Bundle (brotli) | **916 B** ESM · 989 B CJS                      |
| Runtime deps    | **0**                                          |
| Types           | Bundled, strict TypeScript 6                   |
| Module formats  | ESM + CJS, with `exports`/`types` conditions   |
| React           | `>= 16.8` (hooks era); tested through React 19 |
| Test coverage   | **100 %** statements/functions, 98 % branches  |
| Node engine     | `>= 20.19`                                     |

## Next steps

- **[Quickstart](./quickstart)** — install and ship in two minutes.
- **[Why a tiny i18n?](./why)** — the design philosophy and what's intentionally missing.
- **[Recipes](./recipes)** — Next.js, Vite, lazy loading, testing, formatting numbers/dates.
- **[API reference](./api)** — every prop, every type, every example.
