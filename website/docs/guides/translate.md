---
id: translate
title: Translating a string
description: Use translate() to resolve descriptors with interpolation and fallback.
---

# Translating a string

The `translate` function is the workhorse. Get it from `useLocalize()`:

```tsx
import { useLocalize } from 'localize-react';

const { translate } = useLocalize();
```

## Signature

```ts
translate(
  descriptor: string,
  values?: Record<string, string | number>,
  defaultMessage?: string,
): string;
```

| Argument         | Required | Purpose                                                                                           |
| ---------------- | -------- | ------------------------------------------------------------------------------------------------- |
| `descriptor`     | ✅       | The key to resolve. Dot-notation walks the tree: `'cart.summary'` → `translations.cart.summary`.  |
| `values`         | optional | `{{placeholder}}` substitutions.                                                                  |
| `defaultMessage` | optional | Fallback rendered when the descriptor isn't found. If omitted, the descriptor itself is returned. |

## Resolution algorithm

1. Look up `descriptor` directly in the active translation map. Match? Return it (with interpolation).
2. If the descriptor contains `.`, walk segments through the nested tree.
3. If nothing resolves, render `defaultMessage` if given (with interpolation), else the raw descriptor.

```tsx
translate('cart.summary', { count: 3, total: '$42' });
// → "3 items, $42 total"

translate('cart.unknown.key', undefined, 'Coming soon');
// → "Coming soon"

translate('cart.unknown.key');
// → "cart.unknown.key" (defensive: never throws)
```

## Calling without a provider

`useLocalize()` works even with no provider in the tree. You get a passthrough `translate` that returns `defaultMessage ?? descriptor`:

```tsx
function Subscribe() {
  // Works without any provider mounted above us.
  const { translate } = useLocalize();
  return <button>{translate('cta.subscribe', undefined, 'Subscribe')}</button>;
}
```

That makes the library safe to use in shared components — they degrade to English fallbacks if a consumer forgets to mount the provider.

## Composing with formatters

`translate` only does string templates. For numbers, dates, and currencies, pre-format with `Intl.*`:

```tsx
const fmt = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'USD',
});

translate('cart.summary', { count: 3, total: fmt.format(42) });
// → "3 items, $42.00 total"
```

See the **[Intl formatters recipe](../recipes/intl-formatters)** for plurals, relative time, and lists.
