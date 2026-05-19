---
id: typescript
title: TypeScript
description: First-class types, plus how to type-check translation descriptors at the call site.
---

# TypeScript

The library is written in strict TypeScript 6. Types ship inside the package — there's no separate `@types/localize-react`.

## What's exported

```ts
import type {
  LocalizationContextValue,
  LocalizationProviderProps,
  MessageProps,
  TemplateValues,
  Translate,
  Translations,
} from 'localize-react';
```

The runtime exports are typed too — no `any`, no escape hatches.

## Strongly-typing descriptors

By default `translate(descriptor: string, …)` accepts any string. If you'd like the compiler to catch typos in descriptors, derive a union from your translations:

```ts title="src/i18n/typed-translate.ts"
import { useLocalize } from 'localize-react';
import type { translations } from './translations';

// Flatten { a: { b: 'x' } } → 'a.b'
type Leaves<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];

type Locale = keyof typeof translations;
type Descriptor = Leaves<(typeof translations)[Locale]>;

export function useTypedLocalize() {
  const { translate, ...rest } = useLocalize();
  return {
    ...rest,
    translate: (
      descriptor: Descriptor,
      values?: Record<string, string | number>,
      defaultMessage?: string,
    ) => translate(descriptor, values, defaultMessage),
  };
}
```

Then in your components:

```tsx
const { translate } = useTypedLocalize();

translate('greeting.hello', { name: 'Alex' }); // ✅
translate('greeting.helo'); // ❌ TS2345 — typo caught
```

You can extend the helper to constrain `values` to the placeholders found in the resolved template — see the **[advanced typing notes in the recipes index](../recipes/index.md#advanced-typing)**.

## `as const` for inference

For descriptor inference to fire, your translations must be `as const` so TypeScript reads the literal structure:

```ts
export const translations = {
  en: { greeting: { hello: 'Hi {{name}}!' } },
} as const;
```

Without `as const`, you get `{ greeting: { hello: string } }` and lose the descriptor union.

## `exactOptionalPropertyTypes`

The library is type-safe under `exactOptionalPropertyTypes: true`. That means `<LocalizationProvider locale={undefined}>` and `<LocalizationProvider />` are distinct — if you mean "no locale, treat translations as flat", omit the prop entirely.
