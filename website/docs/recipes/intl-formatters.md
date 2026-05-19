---
id: intl-formatters
title: Intl formatters
description: Pluralization, currency, dates, relative time — using the platform.
---

# Intl formatters

`localize-react` deliberately ships no number/date/plural logic. The browser already has it: `Intl.*`. Below is everything you'll typically need.

## Currency

```tsx
function Price({ amount }: { amount: number }) {
  const { locale } = useLocalize();
  const fmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  });
  return <span>{fmt.format(amount)}</span>;
}
```

Or, hoisted into the translation values:

```tsx
const { locale, translate } = useLocalize();
const total = new Intl.NumberFormat(locale, {
  style: 'currency',
  currency: 'USD',
}).format(42);

translate('cart.summary', { count: 3, total });
// → "3 items, $42.00 total"
```

## Numbers (compact, percentage…)

```tsx
new Intl.NumberFormat(locale, { notation: 'compact' }).format(12_345);
// → "12K"

new Intl.NumberFormat(locale, {
  style: 'percent',
  maximumFractionDigits: 1,
}).format(0.347);
// → "34.7%"
```

## Dates

```tsx
new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date());
// → "May 19, 2026"

new Intl.DateTimeFormat(locale, {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
}).format(date);
// → "Tue, May 19"
```

## Relative time

```tsx
function RelativeTime({ date }: { date: Date }) {
  const { locale } = useLocalize();
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const diffSec = (date.getTime() - Date.now()) / 1000;
  // Pick the right unit — quick and dirty:
  const [value, unit]: [number, Intl.RelativeTimeFormatUnit] =
    Math.abs(diffSec) < 60
      ? [Math.round(diffSec), 'second']
      : Math.abs(diffSec) < 3600
        ? [Math.round(diffSec / 60), 'minute']
        : Math.abs(diffSec) < 86400
          ? [Math.round(diffSec / 3600), 'hour']
          : [Math.round(diffSec / 86400), 'day'];
  return <span>{rtf.format(value, unit)}</span>;
}
```

## Pluralization

```ts
const translations = {
  en: {
    cart: {
      items: { one: '1 item', other: '{{count}} items' },
    },
  },
};

function CartCount({ count }: { count: number }) {
  const { locale, translate } = useLocalize();
  const key = new Intl.PluralRules(locale).select(count);
  return <>{translate(`cart.items.${key}`, { count })}</>;
}
```

`Intl.PluralRules` returns `'zero' | 'one' | 'two' | 'few' | 'many' | 'other'` — provide whichever ones your locale needs. English uses `one` and `other`; Polish uses `one`, `few`, `many`, and `other`.

## Lists

```ts
new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format([
  'Alex',
  'Maria',
  'Yuki',
]);
// → "Alex, Maria, and Yuki"
```

Pop the result into `values`:

```ts
translate('attendees.summary', { names: list });
// "Attending: Alex, Maria, and Yuki"
```

## Why not bake this into the library?

Two reasons:

1. **Cost.** Pulling in even a tiny `Intl` shim balloons the bundle. The platform ships these for free.
2. **Composability.** Doing it in user-land means you control formatting style end-to-end — no escape hatches, no special-casing in the library.

For projects that need MessageFormat / ICU semantics on top of plurals, [`@formatjs/intl-messageformat`](https://www.npmjs.com/package/@formatjs/intl-messageformat) plugs in cleanly: pre-format with it, pass the resolved string as `defaultMessage`, done.
