---
id: type-safe-api
title: Type-safe API
description: A zero-runtime, fully type-safe variant of LocalizationProvider, useLocalize, and Message — descriptors and placeholder values are inferred from your translations.
---

# Type-safe API with `createLocalization()`

`createLocalization()` is a pure compile-time wrapper around the regular exports that gives you:

- **Autocomplete on descriptors** — `translate('cart.summary')` only accepts paths that actually exist in your translations.
- **Type-checked interpolation values** — every `{{token}}` in the resolved template becomes a required key on `values`. Templates without tokens accept no values (or any object).
- **Typed locales** — `<LocalizationProvider locale="en">` only accepts locale keys that are present in your translations object.

It's a thin closure around the regular `LocalizationProvider`, `useLocalize`, and `Message`. No extra state. No second cache. No runtime cost beyond a single object allocation.

## At a glance

```tsx title="src/i18n/index.tsx"
import { createLocalization } from 'localize-react';

const translations = {
  en: {
    greeting: 'Hi {{name}}!',
    cart: { summary: '{{count}} items, {{total}} total', checkout: 'Checkout' },
  },
  es: {
    greeting: '¡Hola {{name}}!',
    cart: {
      summary: '{{count}} artículos, {{total}} total',
      checkout: 'Pagar',
    },
  },
} as const;

export const { LocalizationProvider, useLocalize, Message } =
  createLocalization(translations);
```

```tsx title="src/components/Greeting.tsx"
import { useLocalize, Message } from '../i18n';

export function Greeting() {
  // Hooks must be called inside a component.
  const { translate } = useLocalize();
  //      ^? TypedTranslate<typeof translations>

  return (
    <>
      <h1>{translate('greeting', { name: 'Alex' })}</h1>
      {/*           ^ autocompletes 'greeting' | 'cart.summary' | 'cart.checkout' */}

      <Message descriptor="cart.summary" values={{ count: 3, total: '$42' }} />
    </>
  );
}
```

```tsx title="src/App.tsx"
import { LocalizationProvider } from './i18n';

export function App() {
  return (
    <LocalizationProvider locale="en">
      {/*                    ^ typed as 'en' | 'es' */}
      <Greeting />
    </LocalizationProvider>
  );
}
```

That's the entire surface.

## What the compiler catches

```tsx
const { LocalizationProvider, useLocalize } = createLocalization({
  en: { greeting: 'Hi {{name}}!', cart: { checkout: 'Checkout' } },
} as const);

function Demo() {
  // Inside a component — hooks rules apply.
  const { translate } = useLocalize();

  translate('greeting', { name: 'Alex' }); // ✅
  translate('cart.checkout'); // ✅ — no placeholders, no values required

  translate('greting'); // ❌ Type '"greting"' is not assignable
  translate('cart'); // ❌ 'cart' resolves to an object, not a leaf
  translate('greeting'); // ❌ Property 'name' is missing in values
  translate('greeting', { other: 'oops' }); // ❌ Property 'name' is missing
  return null;
}
```

Same applies to `<Message />`:

```tsx
<Message descriptor="greeting" values={{ name: 'Alex' }} />  // ✅
<Message descriptor="greeting" />                            // ❌ values is required
<Message descriptor="cart.checkout" />                       // ✅ no placeholders
```

## How it works

`createLocalization()` infers the shape of your translations from the seed object, using three exposed type utilities:

- **`TranslationPaths<T>`** — string-literal union of dot-paths to every string leaf of `T`.
- **`TranslationAt<T, P>`** — the literal template string at path `P`.
- **`ExtractTokens<S>`** — string-literal union of `{{name}}`-style placeholders found in `S`.

Together they produce a typed `translate` signature: `descriptor: P` and `values: Record<ExtractTokens<TranslationAt<…, P>>, …>` whenever the resolved template has at least one placeholder.

You can reach for these directly when you want to type your own helpers:

```ts
import type { TranslationPaths, ExtractTokens } from 'localize-react';

type Descriptor = TranslationPaths<(typeof translations)['en']>;
//   ^? 'greeting' | 'cart.summary' | 'cart.checkout'

type GreetingTokens = ExtractTokens<'Hi {{name}}!'>;
//   ^? 'name'
```

## Migrating from the untyped API

A two-step move from the existing `LocalizationProvider`/`useLocalize`/`Message` exports:

```tsx title="Before"
import { LocalizationProvider, useLocalize, Message } from 'localize-react';

const translations = { en: { greeting: 'Hi {{name}}!' } };

function App() {
  return (
    <LocalizationProvider locale="en" translations={translations}>
      <Greeting />
    </LocalizationProvider>
  );
}
```

```tsx title="After"
import { createLocalization } from 'localize-react';

const translations = { en: { greeting: 'Hi {{name}}!' } } as const; // (1)

export const { LocalizationProvider, useLocalize, Message } =
  createLocalization(translations); // (2)

function App() {
  return (
    <LocalizationProvider locale="en">
      {' '}
      {/* (3) */}
      <Greeting />
    </LocalizationProvider>
  );
}
```

1. Add `as const` so the leaf templates stay as string literals.
2. Call `createLocalization()` once at the i18n boundary and re-export.
3. The typed `LocalizationProvider` no longer takes `translations` — the seed is captured by the factory. `locale` is the only required prop.

Component code (`useLocalize().translate('…')`, `<Message descriptor="…" />`) is unchanged at the call site; you only get more help from the compiler.

## Tips & limitations

- **`as const` is mandatory.** Without it, your translations widen to `{ greeting: string }`. Template literals are lost, so the placeholder inference can't see `{{name}}` — `values` becomes optional everywhere, silently. Apply `as const` at the leaves (or on the whole literal).
- **Per-locale shape only.** The factory's constraint is `Record<string, Record<string, unknown>>`. The flat shape (`{ greeting: 'Hi' }` without a `en` wrapper) keeps working with the untyped exports.
- **Only descriptors present in every locale are exposed.** Keys are deep-intersected across locale subtrees — a key that's in `'en'` but missing from `'es'` is excluded from the typed union (fail-closed). Templates are still locale-by-locale unions, so `values` must cover the placeholders any locale uses.
- **Dot-separated keys are reserved.** A translation key that contains a literal `.` (e.g. `{ 'a.b': '…' }`) collides with the path separator and can't be resolved either by the type system or at runtime. Use identifier-like keys.
- **The cache is module-scoped.** `localize-react` keeps a single process-wide memoisation cache (cleared on locale/translations change). If you mount two `createLocalization()` factories with overlapping descriptors but different templates, results from one tree can shadow the other until the cache turns over. Pass `disableCache` on the typed `LocalizationProvider` to opt out.
- **Use the typed bindings inside the typed Provider.** Outside any `<LocalizationProvider>` the underlying context falls back to a default (no translations), so `useLocalize().translations` may not actually equal the seed at runtime — the types describe the happy path.
- **Numeric values are accepted.** Each placeholder is typed as `string | number`; numbers are coerced via `String()` at render time, matching the untyped behaviour.
- **It's pure compile-time.** The factory's runtime is a single closure around the regular exports — no proxy, no second cache, no extra tree-walking.

## When to reach for the untyped API

The original exports (`LocalizationProvider`, `useLocalize`, `Message` from `localize-react`) remain fully supported. Prefer them when:

- You ship translations as `JSON` you don't statically know at build time.
- You need a flat translations shape without per-locale grouping.
- Your tree is large enough (tens of thousands of leaves) that you want to avoid the TypeScript inference cost on each call site.
- You're inside a larger app where descriptors are validated by a TMS or a separate type generator.

See [TypeScript](typescript.md) for tips on building your own descriptor union from a dynamic translations tree.
