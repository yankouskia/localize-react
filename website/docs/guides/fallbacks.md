---
id: fallbacks
title: Fallbacks & missing keys
description: What renders when a key isn't found, and how to design your fallback strategy.
---

# Fallbacks & missing keys

`localize-react` never throws on a missing key. Instead, it falls back in a predictable order:

1. **`defaultMessage` argument** — if you pass one, it's used (with interpolation).
2. **The descriptor itself** — if no default is provided.

```tsx
translate('not.in.tree', { name: 'Alex' }, 'Hi {{name}}!');
// → "Hi Alex!"

translate('not.in.tree');
// → "not.in.tree"
```

That last behavior is intentional. In dev, seeing `cart.summary` rendered in your UI is louder than seeing a blank string — you'll notice and add the key. In prod, your shared design-system component still renders something legible if a consumer forgets to wrap it.

## Patterns

### "English-only" descriptor as default

When your codebase has English-by-default copy and translations are layered on top:

```tsx
<Message
  descriptor="cart.summary"
  values={{ count, total }}
  defaultMessage="{{count}} items, {{total}} total"
/>
```

Now even with an empty `translations={{}}`, the UI reads as expected.

### Per-feature fallbacks

For features that are still being translated, ship the default in code and leave the locale tree blank:

```ts
const translations = {
  en: {
    /* full coverage */
  },
  fr: {
    /* most of it */
  },
  // 'de' intentionally omitted — defaults from defaultMessage will be used.
};
```

A user with `de` will see English-ish defaults rather than crash. When you're ready, drop a `de: {...}` map in.

### Catching missing keys in tests

```tsx
import { LocalizationProvider } from 'localize-react';

const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

render(
  <LocalizationProvider
    locale="de"
    translations={{
      en: {
        /* … */
      },
    }}
  >
    <App />
  </LocalizationProvider>,
);

// The provider logs a warn when the locale isn't present.
expect(warn).toHaveBeenCalledWith(
  expect.stringContaining('no translations for specified locale'),
  'de',
);
```

You can also write integration tests that walk every `descriptor` in your codebase and assert it resolves to a non-descriptor string — that catches typos before they ship.
