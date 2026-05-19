---
id: interpolation
title: Interpolation
description: '{{mustache}} tokens, escaping, regex-meta safety.'
---

# Interpolation

`localize-react` uses literal `{{double-mustache}}` tokens for substitutions.

```tsx
const messages = { en: { hello: 'Hi {{name}}, you have {{count}} new mail.' } };

translate('hello', { name: 'Alex', count: 3 });
// → "Hi Alex, you have 3 new mail."
```

## What's a valid token?

The pattern is `/\{\{([^{}]+)\}\}/g` — anything between `{{` and `}}` that doesn't itself contain a brace.

| Input        | Token?                                       |
| ------------ | -------------------------------------------- |
| `{{name}}`   | ✅                                           |
| `{{ name }}` | ✅ (key is `name` — note the spaces)         |
| `{{a.b.c}}`  | ✅ (key is the literal string `a.b.c`)       |
| `{{{a}}}`    | Only `{{a}}` matches. The outer braces stay. |
| `{name}`     | ❌                                           |

Prefer simple, unspaced keys: `{{name}}`, `{{count}}`, `{{total}}`.

## Values

`values` is a `Record<string, string | number>`. Numbers are coerced via `String()` at render time. Anything else is a type error.

```tsx
translate('cart.summary', { count: 3 }); // ok
translate('cart.summary', { count: '3' }); // ok
translate('cart.summary', { count: true }); // ❌ type error
translate('cart.summary', { count: null }); // ❌ type error
```

That keeps the rendered output predictable.

## Regex-meta safety

Interpolation uses `String.prototype.replaceAll(token, value)` — a **literal** replacement, not `new RegExp(token).replace(...)`. So values containing regex meta-characters (`$&`, `$1`, etc.) render as-is, with no surprise expansion:

```tsx
translate('out', { x: '$&' }, '{{x}}');
// → "$&"  (not the entire matched substring)
```

## Missing values

If a `{{token}}` appears in the resolved string but no matching key is in `values`, the token is kept verbatim and a `console.warn` is logged:

```
[LOCALIZE-REACT] Looks like template is being used, but no value passed for  {{name}}
```

That's intentional — silent identity replacement masks bugs.

## Memoization caveat

The internal cache key includes `JSON.stringify(values)`. If your `values` object has stable shape and ordering, cache hits will be common. If you pass freshly-allocated values with random ordering on every render, you'll miss the cache (but it stays correct — never wrong, just slower).
