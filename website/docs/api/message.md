---
id: message
title: <Message />
description: The component form of translate, for JSX-first code.
---

# `<Message />`

```ts
import { Message } from 'localize-react';
```

A thin component wrapper around `translate(descriptor, values, defaultMessage)`. Returns a plain string — render it inside any text-accepting position.

## Props

| Prop             | Type                               | Required | Description                                  |
| ---------------- | ---------------------------------- | -------- | -------------------------------------------- |
| `descriptor`     | `string`                           | ✅       | The translation key.                         |
| `values`         | `Record<string, string \| number>` | optional | Interpolation values.                        |
| `defaultMessage` | `string`                           | optional | Fallback when the descriptor isn't resolved. |

## Examples

```tsx
<Message descriptor="greeting.hello" values={{ name: 'Alex' }} />
// → "Hi Alex!"

<Message
  descriptor="cart.summary"
  values={{ count: 3, total: '$42.00' }}
  defaultMessage="{{count}} items, {{total}} total"
/>
// → "3 items, $42.00 total"
```

## Hook vs. component

Both forms are first-class. Pick whichever reads better at the call site.

```tsx
// Hook — gives you a string you can compose into attributes:
const { translate } = useLocalize();
<button title={translate('subscribe.tooltip')}>...</button>

// Component — concise inside JSX text:
<h1><Message descriptor="greeting.hello" values={{ name }} /></h1>
```

Note that `<Message />` returns a `string` (not a `JSX.Element`), so it composes seamlessly inside larger JSX trees.

## See also

- [`useLocalize()`](./use-localize)
- [Interpolation guide](../guides/interpolation)
