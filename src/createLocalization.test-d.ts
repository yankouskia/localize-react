import { expectTypeOf, test } from 'vitest';

import type {
  ExtractTokens,
  TranslationAt,
  TranslationPaths,
  TypedLocalization,
  TypedMessageProps,
} from './createLocalization.js';

const _seed = {
  en: {
    greeting: 'Hi {{name}}!',
    cart: {
      summary: '{{count}} items, {{total}}',
      checkout: 'Checkout',
    },
  },
  es: {
    greeting: '¡Hola {{name}}!',
    cart: {
      summary: '{{count}} artículos, {{total}}',
      checkout: 'Pagar',
    },
  },
} as const;

type T = typeof _seed;
type Leaf = T['en'];

type Api = TypedLocalization<T>;
type Ctx = ReturnType<Api['useLocalize']>;
type ProviderProps = Parameters<Api['LocalizationProvider']>[0];

// ----- Type helpers -------------------------------------------------

test('TranslationPaths enumerates dot-paths to every string leaf', () => {
  expectTypeOf<TranslationPaths<Leaf>>().toEqualTypeOf<
    'greeting' | 'cart.summary' | 'cart.checkout'
  >();
});

test('TranslationAt resolves a leaf template by path', () => {
  expectTypeOf<
    TranslationAt<Leaf, 'greeting'>
  >().toEqualTypeOf<'Hi {{name}}!'>();
  expectTypeOf<
    TranslationAt<Leaf, 'cart.checkout'>
  >().toEqualTypeOf<'Checkout'>();
  expectTypeOf<
    TranslationAt<Leaf, 'cart.summary'>
  >().toEqualTypeOf<'{{count}} items, {{total}}'>();
});

test('TranslationAt returns never for a path that does not resolve to a string leaf', () => {
  expectTypeOf<TranslationAt<Leaf, 'cart'>>().toBeNever();
  expectTypeOf<TranslationAt<Leaf, 'nope'>>().toBeNever();
  expectTypeOf<TranslationAt<Leaf, 'cart.nope'>>().toBeNever();
});

test('ExtractTokens extracts every {{...}} placeholder as a literal union', () => {
  expectTypeOf<ExtractTokens<'Hi {{name}}'>>().toEqualTypeOf<'name'>();
  expectTypeOf<ExtractTokens<'Hi {{name}} ({{count}})'>>().toEqualTypeOf<
    'name' | 'count'
  >();
  expectTypeOf<ExtractTokens<'no placeholders'>>().toBeNever();
});

// ----- Typed translate / context -----------------------------------

test('useLocalize returns a context with the seed-locale union', () => {
  expectTypeOf<Ctx['locale']>().toEqualTypeOf<'en' | 'es' | undefined>();
  expectTypeOf<Ctx['translations']>().toEqualTypeOf<typeof _seed>();
});

test('translate requires values when the resolved template has placeholders', () => {
  const ctx = {} as Ctx;

  // Valid: all placeholders present.
  expectTypeOf(
    ctx.translate('greeting', { name: 'Alex' }),
  ).toEqualTypeOf<string>();
  expectTypeOf(
    ctx.translate('cart.summary', { count: 3, total: '$42' }),
  ).toEqualTypeOf<string>();

  // @ts-expect-error -- values is required because greeting has {{name}}
  ctx.translate('greeting');

  // @ts-expect-error -- 'name' must be provided
  ctx.translate('greeting', { other: 'oops' });

  // @ts-expect-error -- both 'count' and 'total' must be provided
  ctx.translate('cart.summary', { count: 1 });
});

test('translate accepts an optional values arg when there are no placeholders', () => {
  const ctx = {} as Ctx;
  expectTypeOf(ctx.translate('cart.checkout')).toEqualTypeOf<string>();
  expectTypeOf(
    ctx.translate('cart.checkout', undefined, 'Pay'),
  ).toEqualTypeOf<string>();
});

test('translate rejects unknown descriptors and non-leaf paths', () => {
  const ctx = {} as Ctx;

  // @ts-expect-error -- 'unknown' is not in the tree
  ctx.translate('unknown');

  // @ts-expect-error -- 'cart' resolves to an object, not a leaf
  ctx.translate('cart');
});

// ----- Typed Provider + Message ------------------------------------

test('LocalizationProvider locale prop is a union of seed locales', () => {
  expectTypeOf<ProviderProps['locale']>().toEqualTypeOf<
    'en' | 'es' | undefined
  >();
});

test('LocalizationProvider rejects an unknown locale literal', () => {
  // @ts-expect-error -- 'fr' is not a seed locale
  const _bad: ProviderProps = { locale: 'fr' };
  void _bad;
});

test('translate rejects a typo in a values key', () => {
  const ctx = {} as Ctx;
  // @ts-expect-error -- 'nam' is a typo for 'name'
  ctx.translate('greeting', { nam: 'Alex' });
});

test('TypedMessageProps requires values for templated descriptors', () => {
  type MessageWithGreeting = TypedMessageProps<T, 'greeting'>;
  expectTypeOf<MessageWithGreeting['values']>().toEqualTypeOf<{
    readonly name: string | number;
  }>();
});

test('TypedMessageProps makes values optional for token-free descriptors', () => {
  type MessageWithCheckout = TypedMessageProps<T, 'cart.checkout'>;
  expectTypeOf<MessageWithCheckout['values']>().toEqualTypeOf<
    Readonly<Record<string, string | number>> | undefined
  >();
});

test('TypedMessageProps rejects non-leaf and unknown descriptors', () => {
  // @ts-expect-error -- 'cart' resolves to an object, not a leaf
  type _NonLeaf = TypedMessageProps<T, 'cart'>;
  // @ts-expect-error -- 'unknown' is not in the tree
  type _Unknown = TypedMessageProps<T, 'unknown'>;
});
