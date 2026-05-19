---
id: localization-provider
title: <LocalizationProvider />
description: Mount translations into a subtree.
---

# `<LocalizationProvider />`

```ts
import { LocalizationProvider } from 'localize-react';
```

## Props

| Prop           | Type           | Default | Description                                                                                      |
| -------------- | -------------- | ------- | ------------------------------------------------------------------------------------------------ |
| `locale`       | `string`       | —       | Locale key inside `translations`. If omitted, `translations` is treated as the flat lookup tree. |
| `translations` | `Translations` | `{}`    | Required. Nested object; leaves are strings.                                                     |
| `disableCache` | `boolean`      | `false` | Bypass the internal memo cache. Use during dev when mutating translations in place.              |
| `children`     | `ReactNode`    | —       | The subtree that will see this context.                                                          |

## Example

```tsx
import { LocalizationProvider } from 'localize-react';

const translations = {
  en: { hello: 'Hi {{name}}!' },
  fr: { hello: 'Salut {{name}} !' },
};

<LocalizationProvider locale="en" translations={translations}>
  <App />
</LocalizationProvider>;
```

## Switching the locale at runtime

There's no global mutable state — just rerender the provider:

```tsx
function Shell({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = React.useState('en');
  return (
    <LocalizationProvider locale={locale} translations={translations}>
      <button onClick={() => setLocale((l) => (l === 'en' ? 'fr' : 'en'))}>
        Toggle
      </button>
      {children}
    </LocalizationProvider>
  );
}
```

The internal cache is cleared on every locale or translations change.

## Stacking providers

You can mount more than one provider — descendants see the nearest. Useful for tests or for swapping a subtree's locale without rerendering the rest:

```tsx
<LocalizationProvider locale="en" translations={translations}>
  <Header />
  <LocalizationProvider locale="fr" translations={translations}>
    <FrenchOnlySection />
  </LocalizationProvider>
</LocalizationProvider>
```

## See also

- [`useLocalize()`](./use-localize) — read the value.
- [`<Message />`](./message) — component form of `translate`.
- [Locale resolution guide](../guides/locale-resolution).
