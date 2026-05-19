<div align="center">

<a href="https://yankouskia.github.io/localize-react">
  <img src="./website/static/img/logo.svg" alt="localize-react" width="96" height="96" />
</a>

# localize-react

### **React i18n, without the weight.**

Tiny, type-safe React i18n built on Context and hooks.<br/>
**< 1 kB brotli · 0 runtime deps · dual ESM + CJS · React 19 ready.**

[**Docs**](https://yankouskia.github.io/localize-react) ·
[**Quickstart**](https://yankouskia.github.io/localize-react/docs/quickstart) ·
[**API**](https://yankouskia.github.io/localize-react/docs/api) ·
[**Recipes**](https://yankouskia.github.io/localize-react/docs/recipes) ·
[**Migration v1 → v2**](https://yankouskia.github.io/localize-react/docs/migration-v2)

[![npm](https://img.shields.io/npm/v/localize-react?style=flat-square&color=cb3837&logo=npm&label=npm)](https://www.npmjs.com/package/localize-react)
[![downloads](https://img.shields.io/npm/dm/localize-react?style=flat-square&color=cb3837)](https://www.npmjs.com/package/localize-react)
[![CI](https://img.shields.io/github/actions/workflow/status/yankouskia/localize-react/ci.yml?branch=master&style=flat-square&logo=github&label=CI)](https://github.com/yankouskia/localize-react/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/codecov/c/github/yankouskia/localize-react?style=flat-square&logo=codecov)](https://codecov.io/gh/yankouskia/localize-react)
[![bundle](https://img.shields.io/bundlejs/size/localize-react?style=flat-square&color=4c1&label=brotli)](https://bundlejs.com/?q=localize-react)
[![types](https://img.shields.io/npm/types/localize-react?style=flat-square&logo=typescript)](https://github.com/yankouskia/localize-react/blob/master/src/types.ts)
[![license](https://img.shields.io/npm/l/localize-react?style=flat-square&color=blue)](LICENSE)

</div>

---

```tsx
import { LocalizationProvider, useLocalize } from 'localize-react';

const translations = {
  en: { hello: 'Hi {{name}}!' },
  es: { hello: '¡Hola {{name}}!' },
  ja: { hello: '{{name}}さん、こんにちは!' },
};

function Greeting() {
  const { translate } = useLocalize();
  return <h1>{translate('hello', { name: 'Alex' })}</h1>;
}

export default function App() {
  return (
    <LocalizationProvider locale="en" translations={translations}>
      <Greeting />
    </LocalizationProvider>
  );
}
```

That's the whole API. Three exports, no plugins, no extraction toolchain. Ship it.

---

## ✨ Why?

Most React i18n libraries are 30–80 kB and bring opinions about plural rules, ICU MessageFormat, async loading, and TMS workflows. **`localize-react` is the smallest thing that works.**

It does exactly what a frontend most often needs:

- A nested translations tree, keyed by locale.
- Dot-path lookups (`'cart.summary'`).
- `{{name}}`-style interpolation.
- A graceful fallback when keys are missing.

For everything else (plurals, currency, dates) — reach for [the platform](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl): `Intl.PluralRules`, `Intl.NumberFormat`, `Intl.DateTimeFormat`. Free, fast, already in the browser. See the [Intl formatters recipe](https://yankouskia.github.io/localize-react/docs/recipes/intl-formatters).

## 📦 Specs

| Property             | Value                                                  |
| -------------------- | ------------------------------------------------------ |
| Bundle (brotli)      | **916 B** ESM · 989 B CJS                              |
| Runtime dependencies | **0**                                                  |
| Source               | Strict **TypeScript 6**                                |
| Module formats       | ESM + CJS with proper `exports`/`types` conditions     |
| Tree-shaking         | `sideEffects: false`                                   |
| Peer range           | React `>= 16.8 < 20` (tested in CI through React 19)   |
| Node                 | `>= 20.19` (CI on 20, 22, 24 × Linux/macOS/Windows)    |
| Test coverage        | **100 %** statements · 100 % functions · 98 % branches |
| Type-checked exports | Validated by `publint` + `@arethetypeswrong/cli` in CI |

## 🚀 Install

```sh
npm install localize-react
# or: pnpm add localize-react · yarn add localize-react · bun add localize-react
```

## ⚡️ Quickstart

### 1. Define translations

```ts
export const translations = {
  en: {
    greeting: { hello: 'Hi {{name}}!' },
    cart: { summary: '{{count}} items, {{total}} total' },
  },
  es: {
    greeting: { hello: '¡Hola {{name}}!' },
    cart: { summary: '{{count}} artículos, {{total}} total' },
  },
} as const;
```

### 2. Mount the provider

```tsx
import { LocalizationProvider } from 'localize-react';
import { translations } from './i18n/translations';

export function App() {
  return (
    <LocalizationProvider locale="en" translations={translations}>
      <Shell />
    </LocalizationProvider>
  );
}
```

### 3. Translate, two ways

```tsx
import { Message, useLocalize } from 'localize-react';

// Hook
function Cart() {
  const { translate } = useLocalize();
  return <p>{translate('cart.summary', { count: 3, total: '$42.00' })}</p>;
}

// Component
function CartHeader() {
  return (
    <h1>
      <Message descriptor="greeting.hello" values={{ name: 'Alex' }} />
    </h1>
  );
}
```

That's the whole story. Full docs at **[yankouskia.github.io/localize-react](https://yankouskia.github.io/localize-react)**.

## 🧠 Concept in one screen

| Operation                | API                                                      |
| ------------------------ | -------------------------------------------------------- |
| Mount translations       | `<LocalizationProvider locale translations>`             |
| Translate (hook)         | `useLocalize().translate(descriptor, values?, default?)` |
| Translate (component)    | `<Message descriptor values? defaultMessage? />`         |
| Switch locale at runtime | Re-render with a new `locale` prop                       |
| Missing key              | Renders `defaultMessage ?? descriptor` (never throws)    |
| Nested lookup            | `translate('a.b.c')` walks the tree                      |
| Interpolation            | `{{token}}` — literal replacement, safe with regex chars |
| Locale normalization     | `En-US` → `en_us` → `en`                                 |

## 📚 Recipes

Real-world patterns, fully documented on the site:

- [Switching locales (URL / cookie / localStorage)](https://yankouskia.github.io/localize-react/docs/recipes/switching-locales)
- [Lazy-loading translation chunks with `React.use()`](https://yankouskia.github.io/localize-react/docs/recipes/lazy-loading)
- [Next.js (App Router) — `[locale]` segments + middleware](https://yankouskia.github.io/localize-react/docs/recipes/nextjs)
- [Vite + React Router — `import.meta.glob`](https://yankouskia.github.io/localize-react/docs/recipes/vite)
- [Testing — RTL render helper, descriptor coverage](https://yankouskia.github.io/localize-react/docs/recipes/testing)
- [Intl formatters — plurals, currency, dates, lists](https://yankouskia.github.io/localize-react/docs/recipes/intl-formatters)

## 🥊 How it compares

|                      | **localize-react** | react-i18next | react-intl | lingui    |
| -------------------- | ------------------ | ------------- | ---------- | --------- |
| Bundle (brotli)      | **< 1 kB**         | ~17 kB        | ~38 kB     | ~9 kB     |
| Runtime deps         | **0**              | several       | several    | one macro |
| Pluralization (CLDR) | Use `Intl`         | ✅            | ✅ (ICU)   | ✅ (ICU)  |
| Number / date format | Use `Intl`         | Optional      | ✅         | ✅        |
| ICU MessageFormat    | ❌                 | ✅            | ✅         | ✅        |
| Lazy locale loading  | DIY                | ✅            | ✅         | ✅        |
| Auto extraction      | ❌                 | ✅            | CLI        | CLI       |
| TypeScript-first     | ✅                 | ✅            | ✅         | ✅        |
| Learning curve       | **Tiny**           | Medium        | Medium     | Medium    |

Use `localize-react` when you want a hook + a tag. Reach for the others when CLDR plurals, ICU MessageFormat, or a TMS workflow matter — they're all great at what they do.

## 🛡 Production-ready

- **Types ship inside the package** — no `@types/localize-react` to chase.
- **Provenance attestation** on every published version (npm OIDC trusted publishing).
- **CodeQL** runs on every PR; CI matrix exercises Node 20/22/24 × Linux/macOS/Windows.
- **Size budget enforced** — < 2 kB ESM, < 2.5 kB CJS, checked on every PR with [`size-limit`](https://github.com/ai/size-limit).
- **No dynamic require, no eval, no regex from user input** — interpolation is literal `replaceAll`.

## 📖 v1 → v2

The runtime API is unchanged. v2 modernizes the toolchain (strict TS 6, dual ESM+CJS, React 19 peer, GitHub Actions + Changesets). One soft TypeScript regression in `exactOptionalPropertyTypes` mode — see the [migration guide](https://yankouskia.github.io/localize-react/docs/migration-v2).

## 🤝 Contributing

PRs welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the setup + release flow. Security reports: please open a private security advisory rather than a public issue.

If you'd like to support the project, [sponsoring](https://github.com/sponsors/yankouskia) helps a lot.

## 📄 License

[MIT](./LICENSE) © Aliaksandr Yankouski
