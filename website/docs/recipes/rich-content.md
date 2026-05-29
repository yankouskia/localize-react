---
id: rich-content
title: Rich content in translations (links, components, formatting)
description: Use the RichMessage component to embed React nodes — links, components, formatted spans — directly inside a translated sentence without breaking the word order.
---

# Rich content in translations

The default `<Message />` returns a `string`, which is perfect for headings, labels, and form copy. But every real product eventually needs something like this:

> By signing up, you agree to our **Terms of Service**.

…where part of the sentence is interactive (a link, a button, a tooltip) **and** the surrounding text still has to translate per locale. In German the word order is different. In Japanese the link sits in the middle of a particle. Splitting the sentence apart in JSX:

```tsx
<>
  By signing up, you agree to our <Link to="/terms">Terms</Link>.
</>
```

…stops translating the moment the layout has to change.

`<RichMessage />` solves this. It returns a `ReactNode` and accepts `string | number | ReactNode` as `values`, so you put the link **into the translation** and let the translator decide where the link goes.

## Quick start

```tsx
import { LocalizationProvider, RichMessage } from 'localize-react';

const translations = {
  en: { signup: { terms: 'By signing up, you agree to our {{link}}.' } },
  de: {
    signup: { terms: 'Mit der Anmeldung stimmen Sie unseren {{link}} zu.' },
  },
};

function Footer() {
  return (
    <p>
      <RichMessage
        descriptor="signup.terms"
        values={{ link: <a href="/terms">Terms of Service</a> }}
      />
    </p>
  );
}

function App() {
  return (
    <LocalizationProvider locale="de" translations={translations}>
      <Footer />
    </LocalizationProvider>
  );
}
```

Rendered output for `de`:

```html
<p>
  Mit der Anmeldung stimmen Sie unseren
  <a href="/terms">Terms of Service</a> zu.
</p>
```

`<Message />` could not have done this — TypeScript would reject the React node in `values` (the typed signature only accepts `string | number`), and if you cast around it the value would coerce to the literal string `[object Object]` at render time.

## Mixing strings, numbers, and components

A single template can have any combination:

```tsx
<RichMessage
  descriptor="cart.summary"
  values={{
    count: 3,
    total: <strong>$42.00</strong>,
  }}
/>
```

```
3 items, <strong>$42.00</strong> total
```

Strings and numbers are coerced via `String()` exactly like `<Message />`. Anything else is passed through to React verbatim.

## Same token used twice

```tsx
// en: '{{user}} and {{user}} agree.'
<RichMessage descriptor="agreement" values={{ user: <em>Alex</em> }} />
```

`<RichMessage />` wraps every part in its own keyed `Fragment`, so re-using a single React element across two occurrences does not produce duplicate-key warnings.

## With the typed factory

`createLocalization()` exposes `RichMessage` alongside `Message`. Same descriptor / value narrowing as the string-only typed surface — just with `string | number | ReactNode` at every token slot:

```tsx
import { createLocalization } from 'localize-react';

const translations = {
  en: { signup: { terms: 'By signing up, you agree to our {{link}}.' } },
} as const;

const { LocalizationProvider, RichMessage } = createLocalization(translations);

function Footer() {
  return (
    <p>
      <RichMessage
        descriptor="signup.terms"
        values={{ link: <a href="/terms">Terms</a> }}
      />
    </p>
  );
}
```

If you typo `descriptor` or forget the `link` value, the compiler flags it — exactly the same guarantees as the typed `<Message />`, just with a wider `values` type.

## When to use which

| Component         | Returns     | `values` types                  | Use when…                                                                                                           |
| ----------------- | ----------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `<Message />`     | `string`    | `string \| number`              | The output is plain text (titles, labels, alt text, attribute values).                                              |
| `<RichMessage />` | `ReactNode` | `string \| number \| ReactNode` | A sentence needs to host a link, a component, or some inline formatting whose position must follow the translation. |

Use the helper directly when you want to inspect or transform the parts before rendering:

```tsx
import { buildRichTranslation } from 'localize-react';

const parts = buildRichTranslation('Hi {{name}}', {
  name: <strong>Alex</strong>,
});
// → ['Hi ', <strong>Alex</strong>, '']
```

Each entry is either a literal text fragment or one of the values you passed in, in render order.

## Caveats

- **Tokens are still `{{name}}`.** The grammar is exactly the same as the string interpolator — `{{` and `}}` are reserved, and nested braces are not parsed.
- **Each value should be renderable as a React child.** Anything `ReactNode` accepts works (elements, strings, numbers, null/undefined). Plain functions are passed through and will surface as React's normal "Functions are not valid as a React child" error.
- **Coercion only applies to `string` and `number`.** Other renderable primitives (`boolean`, `null`, `undefined`) are passed through; React renders most of them as nothing.
- **Children are wrapped with index-based keys.** If a translation reorders tokens between locales, a stateful component (controlled input, popover, animating element) at the same position can keep its identity across a locale switch — avoid putting components whose state must follow a specific token directly into `values`; render a stable wrapper around them.
- **The translation cache is process-wide.** If two `LocalizationProvider`s (typed or untyped) mount different translation trees with overlapping descriptors, the second tree may temporarily see the first tree's template in its `<RichMessage />` lookup until the next locale/translations change clears the cache — set `disableCache` on the outer provider when mounting more than one.
