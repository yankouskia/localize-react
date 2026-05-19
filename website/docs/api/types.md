---
id: types
title: Types
description: Every exported type with its full shape.
---

# Types

All types ship inside the package — no separate `@types/localize-react` install.

```ts
import type {
  Translations,
  TemplateValues,
  Translate,
  LocalizationContextValue,
  LocalizationProviderProps,
  MessageProps,
} from 'localize-react';
```

## `Translations`

A recursive interface — string leaves, nested branches.

```ts
interface Translations {
  readonly [key: string]: string | Translations;
}
```

## `TemplateValues`

Values bound to `{{placeholder}}` tokens. Numbers are coerced to their `String()` form at render time.

```ts
type TemplateValues = Readonly<Record<string, string | number>>;
```

## `Translate`

```ts
type Translate = (
  descriptor: string,
  values?: TemplateValues,
  defaultMessage?: string,
) => string;
```

Resolution: direct → dotted-path → `defaultMessage` → descriptor. Never throws.

## `LocalizationContextValue`

The value returned by `useLocalize()` and carried by the context.

```ts
interface LocalizationContextValue {
  readonly locale: string | undefined;
  readonly translate: Translate;
  readonly translations: Translations;
}
```

## `LocalizationProviderProps`

```ts
interface LocalizationProviderProps {
  readonly children?: ReactNode;
  readonly locale?: string;
  readonly translations: Translations;
  readonly disableCache?: boolean;
}
```

## `MessageProps`

```ts
interface MessageProps {
  readonly descriptor: string;
  readonly values?: TemplateValues;
  readonly defaultMessage?: string;
}
```

All props are `readonly` to match React's preferred prop-immutability story under `strict` + `exactOptionalPropertyTypes`.
