---
id: quickstart
title: Quickstart
slug: /quickstart
sidebar_position: 2
description: Install localize-react and ship a translated component in two minutes.
---

# Quickstart

From zero to translated UI in two minutes.

## 1. Install

```bash
npm install localize-react
# or
pnpm add localize-react
# or
yarn add localize-react
# or
bun add localize-react
```

React `>= 16.8` is a peer dependency. The library has **no other runtime dependencies**.

## 2. Define your translations

A translation tree is a plain JS object. Leaves are strings; branches are nested objects.

```ts title="src/i18n/translations.ts"
export const translations = {
  en: {
    greeting: { hello: 'Hi {{name}}!' },
    cart: {
      empty: 'Your cart is empty.',
      summary: '{{count}} items, {{total}} total',
    },
  },
  es: {
    greeting: { hello: '¡Hola {{name}}!' },
    cart: {
      empty: 'Tu carrito está vacío.',
      summary: '{{count}} artículos, {{total}} total',
    },
  },
} as const;
```

## 3. Mount the provider

```tsx title="src/App.tsx"
import { LocalizationProvider } from 'localize-react';
import { translations } from './i18n/translations';

export function App() {
  const [locale, setLocale] = React.useState('en');

  return (
    <LocalizationProvider locale={locale} translations={translations}>
      <Header onLocaleChange={setLocale} />
      <Cart />
    </LocalizationProvider>
  );
}
```

## 4. Translate, two ways

### Hook

```tsx
import { useLocalize } from 'localize-react';

export function Cart() {
  const { translate } = useLocalize();

  return (
    <>
      <h1>{translate('greeting.hello', { name: 'Alex' })}</h1>
      <p>{translate('cart.summary', { count: 3, total: '$42.00' })}</p>
    </>
  );
}
```

### Component

```tsx
import { Message } from 'localize-react';

export function CartHeader() {
  return (
    <h1>
      <Message descriptor="greeting.hello" values={{ name: 'Alex' }} />
    </h1>
  );
}
```

## 5. (Optional) Switch locale

There's no global mutable state, no monkey-patching. Just rerender the provider with a new `locale` prop:

```tsx
const [locale, setLocale] = useState('en');
return (
  <LocalizationProvider locale={locale} translations={translations}>
    <button onClick={() => setLocale(locale === 'en' ? 'es' : 'en')}>
      Toggle language
    </button>
    <App />
  </LocalizationProvider>
);
```

The internal memo cache clears automatically on locale/translations changes.

## Done.

That's the entire API surface. From here, head to:

- **[API reference](./api)** for every prop and option.
- **[Recipes](./recipes)** for Next.js / Vite / testing / formatters.
- **[Why?](./why)** for the design rationale and what's intentionally missing.
