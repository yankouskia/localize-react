---
id: use-localize
title: useLocalize()
description: The hook that returns translate, locale, and translations.
---

# `useLocalize()`

```ts
import { useLocalize } from 'localize-react';
```

## Signature

```ts
function useLocalize(): LocalizationContextValue;
```

Returns the active `{ locale, translate, translations }`. When called **outside** a provider, returns a passthrough value:

```ts
{
  locale: undefined,
  translations: {},
  translate: (descriptor, _, defaultMessage) => defaultMessage ?? descriptor,
}
```

That makes the hook safe in shared library components — they degrade gracefully when consumers forget the provider.

## Example: in a functional component

```tsx
import { useLocalize } from 'localize-react';

export function Greeting({ name }: { name: string }) {
  const { translate } = useLocalize();
  return <h1>{translate('greeting.hello', { name })}</h1>;
}
```

## Example: reading the locale

```tsx
import { useLocalize } from 'localize-react';

export function CurrencyAmount({ value }: { value: number }) {
  const { locale } = useLocalize();
  const fmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  });
  return <span>{fmt.format(value)}</span>;
}
```

The hook gives you exactly what the nearest provider was passed — handy for chaining `Intl.*` formatters.

## Example: reading the whole tree

```tsx
const { translations } = useLocalize();
// translations === the active sub-map for the resolved locale,
// or the entire root map when no locale was set.
```

Use this sparingly — typically you only want `translate`.

## See also

- [`<LocalizationProvider />`](./localization-provider) — produce the value.
- [`<Message />`](./message) — JSX-friendly alternative.
- [TypeScript guide](../guides/typescript) — typing descriptors at the call site.
