---
id: index
title: Recipes
slug: /recipes
description: Real-world patterns — locale switching, lazy-loading, Next.js, Vite, testing, Intl.
---

# Recipes

Patterns we keep reaching for. Each is a copy-pasteable starting point — adapt to taste.

| Recipe                                         | What it covers                                               |
| ---------------------------------------------- | ------------------------------------------------------------ |
| [Switching locales](./switching-locales.md)    | URL-driven, cookie-driven, and `localStorage`-driven setups. |
| [Lazy-loading translations](./lazy-loading.md) | Code-split locale bundles, suspense, preloading.             |
| [Next.js (App Router)](./nextjs.md)            | Server components, locale detection, route segments.         |
| [Vite + React Router](./vite.md)               | Per-route locale bundles, `import.meta.glob`.                |
| [Testing](./testing.md)                        | Render helpers, key assertions, snapshot strategies.         |
| [Intl formatters](./intl-formatters.md)        | Plurals, currency, relative time, lists — using `Intl.*`.    |

### Advanced typing

If you'd like the compiler to catch typos in descriptors, the **[TypeScript guide](../guides/typescript.md)** has a 10-line `useTypedLocalize` helper that derives a literal-union descriptor type from your translations.

### Have a recipe to add?

[Open a PR](https://github.com/yankouskia/localize-react/pulls) — recipes are the easiest contribution path.
