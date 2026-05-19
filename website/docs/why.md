---
id: why
title: Why localize-react?
slug: /why
sidebar_position: 3
description: Design philosophy, trade-offs, and what's intentionally missing.
---

# Why localize-react?

i18n libraries occupy a wide quality-vs-weight spectrum. `localize-react` lives on the "do less, do it well" end.

## The big picture

| Library             | Bundle (brotli)     | Plurals       | Number/Date fmt | Async loading | API surface                     |
| ------------------- | ------------------- | ------------- | --------------- | ------------- | ------------------------------- |
| **localize-react**  | **< 1 kB**          | ❌ (use Intl) | ❌ (use Intl)   | DIY           | 1 provider, 1 hook, 1 component |
| react-intl          | ~40 kB              | ✅ (ICU)      | ✅              | DIY           | ~20 components/hooks            |
| react-i18next       | ~30 kB              | ✅            | Plugin          | ✅            | Large                           |
| Lingui              | ~7 kB runtime + CLI | ✅ (ICU)      | ✅              | DIY           | Component + macro               |
| FormatJS / polyglot | varies              | ✅            | ✅              | DIY           | Medium                          |

(Sizes are rough; verify with [bundlejs](https://bundlejs.com) for your exact import graph.)

If you need ICU plurals, automated message extraction, or a TMS-integrated workflow — **use one of the bigger libraries**. They're great. `localize-react` is for the rest of us.

## What's intentionally missing

### No pluralization

Plurals are locale-specific and surprisingly hard. Polish has three plural forms, Arabic has six. The right tool is `Intl.PluralRules`:

```tsx
const pr = new Intl.PluralRules(locale);
const key = pr.select(count); // 'one' | 'other' | …
const msg = translate(`cart.items.${key}`, { count });
```

You ship the rule table in the runtime (it's free); `localize-react` just looks up `cart.items.one` vs `cart.items.other`.

### No number/date formatting

Same story. The browser already ships `Intl.NumberFormat`, `Intl.DateTimeFormat`, `Intl.RelativeTimeFormat`. Use them; pre-format and pass the resulting strings into `values`.

See the **[Intl formatters recipe](./recipes/intl-formatters)** for ready-to-paste examples.

### No ICU MessageFormat

ICU is an excellent format. It's also a 5–10 kB parser. If you need it, use `react-intl` or `@formatjs/intl-messageformat` standalone — they're designed for it.

`localize-react` does flat string templates with `{{mustache}}` tokens. That's enough for `Hi {{name}}, you have {{count}} messages`.

### No async loading

Pass a different `translations` prop. Use dynamic `import()` to code-split locale bundles per-route. See the **[lazy-loading recipe](./recipes/lazy-loading)**.

### No automated extraction

Translation keys live in your source. If you want extraction, run [Lingui](https://lingui.dev/) or [`@formatjs/cli`](https://formatjs.io/docs/tooling/cli) against your codebase — they emit `*.json` you can feed straight in.

## When it _isn't_ the right choice

- You need **ICU MessageFormat** and `select`/`plural` markers.
- You have a **TMS** (Crowdin/Lokalise/Phrase) workflow with `.po` or XLIFF round-tripping.
- You need **right-to-left** auto-mirroring, locale-aware **typography**, **bidi isolation** wrappers.
- You're already shipping `react-intl` and don't want to rewrite.

For those, prefer the heavier libraries. For everything else, `localize-react` keeps your bundle, your runtime, and your mental model small.

## When it _is_ the right choice

- A side project or marketing site that needs 2–10 languages.
- An app where bundle size matters and the bulk of translations are flat strings with a few placeholders.
- A library or design-system component that doesn't want to pin its consumers to a specific i18n stack.
- A migration from a heavier framework where you've realized you're using 5 % of its API.
