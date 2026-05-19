---
id: provider
title: The provider
description: Mount LocalizationProvider, pass translations, switch locales.
---

# `<LocalizationProvider />`

The single entry point for the library. Wrap the root of your app (or just the subtree that needs translations) with it.

## Minimum example

```tsx
import { LocalizationProvider } from 'localize-react';

<LocalizationProvider locale="en" translations={messages}>
  <App />
</LocalizationProvider>;
```

## Translation shape

A `Translations` tree is a nested object where leaves are strings:

```ts
const messages = {
  en: {
    greeting: { hello: 'Hi {{name}}!' },
    nav: { home: 'Home', settings: 'Settings' },
  },
  fr: {
    greeting: { hello: 'Salut {{name}} !' },
    nav: { home: 'Accueil', settings: 'Paramètres' },
  },
};
```

Branches can be arbitrarily deep. `translate('greeting.hello')` walks the tree on every call (memoized).

## Without a locale (flat tree)

If you have one language, you can skip the locale dimension entirely:

```tsx
<LocalizationProvider translations={{ greeting: { hello: 'Hello' } }}>
  <App />
</LocalizationProvider>
```

Now `translate('greeting.hello')` looks up directly inside the root.

## Switching locales

There is no global mutable locale. To switch, **rerender the provider** with a new `locale` prop:

```tsx
function Shell({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState('en');
  return (
    <LocalizationProvider locale={locale} translations={messages}>
      <LocaleSwitch value={locale} onChange={setLocale} />
      {children}
    </LocalizationProvider>
  );
}
```

The internal memo cache clears automatically whenever `locale` or `translations` change.

## `disableCache`

The provider memoizes translate results by `JSON.stringify(values) + descriptor + defaultMessage`. That's fine 99 % of the time. During dev — particularly when you're hot-reloading translations in place — you may want to bypass the cache:

```tsx
<LocalizationProvider disableCache translations={messages}>
  <App />
</LocalizationProvider>
```

In production, leave it off. The cache is module-scoped (a single `Object.create(null)`) and pays for itself after a few rerenders.

## Performance notes

- The provider value is memoized by `(locale, translate, translations)`. As long as you keep your `translations` reference stable (e.g. import from a module), child components won't re-render unnecessarily.
- `translate` itself is memoized by `(disableCache, pureTranslations)`. Same rule: stable inputs, stable identity.
- A new `<LocalizationProvider locale={...} translations={...}>` with the **same** props yields the **same** context value.

## See also

- **[`useLocalize()`](../api/use-localize)** — read the value.
- **[`<Message />`](../api/message)** — component form of translate.
- **[Locale resolution](./locale-resolution)** — how `En-US` becomes `en`.
