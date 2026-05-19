---
id: locale-resolution
title: Locale resolution
description: How En-US becomes en, and what happens when nothing matches.
---

# Locale resolution

Real-world locale strings are messy: `en-US`, `En_us`, `en`, `EN`. `localize-react` is forgiving — it tries multiple normalizations before giving up.

## Algorithm

Given `<LocalizationProvider locale={input} translations={tree}>`:

1. **Direct match.** Is `tree[input]` an object? Use it.
2. **Normalize.** Lowercase the input, replace `-` with `_`. Try again.
3. **Strip region.** Take the leading segment (`en_us` → `en`). Try again.
4. **No match.** Log a warning, render the empty map (every descriptor becomes its own fallback).

```ts
sanitizeLocale('en-US', { en: {...}, fr: {...} });   // → 'en'    (step 3)
sanitizeLocale('EN_US', { en: {...} });              // → 'en'
sanitizeLocale('zh-Hant', { zh_hant: {...} });       // → 'zh_hant' (step 2)
sanitizeLocale('klingon', { en: {...} });            // → 'klingon' + warn
```

## In practice

- Pass whatever your auth/cookie/i18n routing layer gives you — **no need to normalize beforehand**.
- Name your translation keys however you prefer (`en`, `en_us`, `en_US`); the lookup will find them.
- If you mix conventions (`en` _and_ `en_us`), the most-specific match wins.

## When nothing matches

You get a `console.warn`:

```
[LOCALIZE-REACT]: There are no translations for specified locale  klingon
```

…and `translate(...)` returns the descriptor (or `defaultMessage`) for every call. The app keeps rendering. Production users still see usable English-as-fallback strings rather than a blank page.

## Why no locale negotiation?

We deliberately don't ship full BCP 47 negotiation (CLDR matching, parent-locale chains). Two reasons:

1. **Size.** Locale negotiation tables are big.
2. **Ambiguity.** If your `en-US` users should fall back to `en`, you can ship `en` and let the simple normalizer handle it. If they should fall back to a _different_ dialect, you know your product better than a generic matcher — pick the right key explicitly.

If you need richer matching, `Intl.Locale` and `@formatjs/intl-locale-matcher` are excellent and orthogonal to this library.
