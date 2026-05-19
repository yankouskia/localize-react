---
id: index
title: API reference
slug: /api
description: Every export, every prop, every type.
---

# API reference

The public surface is small. Three runtime exports, six types.

## Runtime exports

| Export                                               | Kind              | Purpose                                                  |
| ---------------------------------------------------- | ----------------- | -------------------------------------------------------- |
| [`LocalizationProvider`](./localization-provider.md) | React component   | Mount translations at the root or subtree.               |
| [`useLocalize`](./use-localize.md)                   | Hook              | Read `{ locale, translate, translations }` from context. |
| [`Message`](./message.md)                            | React component   | Render a translation by descriptor.                      |
| `LocalizationContext`                                | React context     | The underlying context (for `static contextType`).       |
| `LocalizationConsumer`                               | React render-prop | Class-component-friendly consumer.                       |

## Type exports

| Type                                                                | Notes                                                           |
| ------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`Translations`](./types.md#translations)                           | Nested translation tree.                                        |
| [`TemplateValues`](./types.md#templatevalues)                       | Interpolation map for `{{tokens}}`.                             |
| [`Translate`](./types.md#translate)                                 | The `translate(descriptor, values?, defaultMessage?)` function. |
| [`LocalizationContextValue`](./types.md#localizationcontextvalue)   | What `useLocalize()` returns.                                   |
| [`LocalizationProviderProps`](./types.md#localizationproviderprops) | Provider props.                                                 |
| [`MessageProps`](./types.md#messageprops)                           | `<Message />` props.                                            |

## Import shape

```ts
import {
  LocalizationProvider,
  useLocalize,
  Message,
  LocalizationContext,
  LocalizationConsumer,
} from 'localize-react';

import type {
  Translations,
  TemplateValues,
  Translate,
  LocalizationContextValue,
  LocalizationProviderProps,
  MessageProps,
} from 'localize-react';
```

## Compatibility

- **Module formats:** ESM (`./dist/index.mjs`) and CJS (`./dist/index.cjs`), wired up via the `exports` field with `types`/`import`/`require` conditions.
- **Types:** strict TS 6 declarations, validated with `@arethetypeswrong/cli` in CI.
- **Tree-shaking:** `sideEffects: false`; ESM consumers get dead-code elimination.
- **React:** peerDep `>=16.8 <20`. Tested in CI against React 18 and 19.
