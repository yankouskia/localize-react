import type { JSX, ReactNode } from 'react';

import { Message } from './Message.js';
import { LocalizationProvider } from './Provider.js';
import { RichMessage } from './RichMessage.js';
import type {
  RichTemplateValues,
  TemplateValues,
  Translations,
} from './types.js';
import { useLocalize } from './use-localize.js';

// =============================================================
// Type-level helpers — recursion is bounded by TS's default
// instantiation depth limit (~50), more than enough for any
// realistic translation tree.
// =============================================================

/**
 * Dot-notated paths to every string leaf of `T`.
 *
 * @example
 * ```ts
 * type P = TranslationPaths<{ a: { b: 'leaf' }; c: 'other' }>;
 * //   ^? 'a.b' | 'c'
 * ```
 */
export type TranslationPaths<T, Prefix extends string = ''> = T extends string
  ? Prefix extends ''
    ? never
    : Prefix
  : T extends Record<string, unknown>
    ? {
        [K in keyof T & string]: TranslationPaths<
          T[K],
          Prefix extends '' ? K : `${Prefix}.${K}`
        >;
      }[keyof T & string]
    : never;

/**
 * The string-literal template located at a dot-path inside `T`. Returns
 * `never` if the path does not resolve to a string leaf.
 *
 * @example
 * ```ts
 * type Greeting = TranslationAt<{ greeting: 'Hi {{name}}!' }, 'greeting'>;
 * //   ^? 'Hi {{name}}!'
 * ```
 */
export type TranslationAt<
  T,
  P extends string,
> = P extends `${infer Head}.${infer Tail}`
  ? Head extends keyof T
    ? TranslationAt<T[Head], Tail>
    : never
  : P extends keyof T
    ? T[P] extends string
      ? T[P]
      : never
    : never;

/**
 * Extract every `{{token}}` placeholder name from a template literal as a
 * string-literal union. Mirrors the runtime regex `{{([^{}]+)}}` — empty
 * tokens (`{{}}`) are not recognised.
 *
 * @example
 * ```ts
 * type Tokens = ExtractTokens<'Hi {{name}} ({{count}})'>;
 * //   ^? 'name' | 'count'
 * ```
 */
export type ExtractTokens<S extends string> =
  S extends `${string}{{${infer Head}${infer Tail}}}${infer Rest}`
    ? Head extends ''
      ? ExtractTokens<Rest>
      : `${Head}${Tail}` | ExtractTokens<Rest>
    : never;

// =============================================================
// Public typed-API shapes
// =============================================================

type LocaleOf<T> = Extract<keyof T, string>;

/**
 * Recursive key-intersection. At every object level it keeps only keys
 * that exist in every locale (`keyof U` over a union is the intersection
 * of each member's keys); at leaves it preserves the locale-by-locale
 * union of templates so {@link ExtractTokens} sees every placeholder that
 * any locale uses.
 *
 * Net effect: descriptors that exist in only some locales are excluded
 * from the typed surface (fail-closed), while `values` must satisfy
 * every placeholder appearing in any locale (also fail-closed).
 */
type DeepIntersect<U> = [U] extends [object]
  ? { readonly [K in keyof U & string]: DeepIntersect<U[K]> }
  : U;

/** Leaf tree shared by every locale of `T`, after key-intersection. */
type LeafTreeOf<T> = DeepIntersect<T[LocaleOf<T>]>;

type TokensAt<T, P extends string> = ExtractTokens<
  TranslationAt<LeafTreeOf<T>, P>
>;

type ValuesShape<Tokens extends string> = Readonly<
  Record<Tokens, string | number>
>;

type TypedTranslateArgs<T, P extends string> = [TokensAt<T, P>] extends [never]
  ? [descriptor: P, values?: TemplateValues, defaultMessage?: string]
  : [
      descriptor: P,
      values: ValuesShape<TokensAt<T, P>>,
      defaultMessage?: string,
    ];

/**
 * Typed `translate` function. The `descriptor` parameter is constrained
 * to the union of valid dot-paths inside the seed translations, and the
 * `values` parameter is shaped by the placeholders in the resolved
 * template (required when there are any, optional otherwise).
 */
export type TypedTranslate<T> = <P extends TranslationPaths<LeafTreeOf<T>>>(
  ...args: TypedTranslateArgs<T, P>
) => string;

/** Context value returned by the typed `useLocalize()`. */
export interface TypedLocalizationContextValue<T> {
  readonly locale: LocaleOf<T> | undefined;
  readonly translate: TypedTranslate<T>;
  readonly translations: T;
}

/** Props accepted by the typed `LocalizationProvider`. */
export interface TypedLocalizationProviderProps<T> {
  readonly children?: ReactNode;
  readonly locale?: LocaleOf<T>;
  readonly disableCache?: boolean;
}

/** Props accepted by the typed `Message` component. */
export type TypedMessageProps<T, P extends TranslationPaths<LeafTreeOf<T>>> = {
  readonly descriptor: P;
  readonly defaultMessage?: string;
} & ([TokensAt<T, P>] extends [never]
  ? { readonly values?: TemplateValues }
  : { readonly values: ValuesShape<TokensAt<T, P>> });

/**
 * Props accepted by the typed `RichMessage` component. Same key/path
 * narrowing as {@link TypedMessageProps}, but `values` may include
 * `ReactNode` entries so a translation can host inline rich content
 * (links, components, formatted spans, …).
 */
export type TypedRichMessageProps<
  T,
  P extends TranslationPaths<LeafTreeOf<T>>,
> = {
  readonly descriptor: P;
  readonly defaultMessage?: string;
} & ([TokensAt<T, P>] extends [never]
  ? { readonly values?: RichTemplateValues }
  : { readonly values: Readonly<Record<TokensAt<T, P>, ReactNode>> });

/**
 * Shape of the object returned by {@link createLocalization}: a typed
 * quartet of bindings derived from the seed translations.
 */
export interface TypedLocalization<T> {
  readonly LocalizationProvider: (
    props: TypedLocalizationProviderProps<T>,
  ) => JSX.Element;
  readonly useLocalize: () => TypedLocalizationContextValue<T>;
  readonly Message: <P extends TranslationPaths<LeafTreeOf<T>>>(
    props: TypedMessageProps<T, P>,
  ) => string;
  readonly RichMessage: <P extends TranslationPaths<LeafTreeOf<T>>>(
    props: TypedRichMessageProps<T, P>,
  ) => ReactNode;
}

// =============================================================
// Runtime factory — a pure compile-time wrapper. The closure
// holds the seed translations so `<LocalizationProvider>` does
// not need a `translations` prop on every render.
// =============================================================

/**
 * Build a fully type-safe set of `{ LocalizationProvider, useLocalize, Message }`
 * bindings from a per-locale translations object.
 *
 * `createLocalization()` is a pure compile-time wrapper around the regular
 * exports — no extra state, no duplicate cache. The seed object you pass
 * in is captured verbatim as the `translations` prop on the returned
 * `LocalizationProvider`.
 *
 * Descriptors are inferred as a string-literal union of dot-paths to every
 * string leaf, and any `{{token}}` placeholders inside those leaves become
 * required keys on `values`. Renaming, deleting, or typoing a descriptor
 * becomes a compile-time error.
 *
 * **Tips & caveats**
 *
 * - **Use `as const` on the seed.** Without it the leaves widen to
 *   `string` and `{{token}}` inference can no longer see the placeholders,
 *   silently making `values` optional everywhere.
 * - **Locale shapes are intersected.** A descriptor must exist in every
 *   locale of the seed to appear in the typed union — keys present in
 *   only some locales are excluded on purpose (fail-closed).
 * - **Use the returned bindings inside the returned Provider.** When the
 *   typed `useLocalize()` is invoked outside any `<LocalizationProvider>`
 *   it falls through to the default context value (no translations); the
 *   types describe the happy path.
 * - **Dot-separated keys are reserved.** A key that contains `.` would
 *   collide with the path separator; keep your translation keys
 *   identifier-like.
 *
 * @example
 * ```tsx
 * const translations = {
 *   en: {
 *     greeting: 'Hi {{name}}!',
 *     cart: { summary: '{{count}} items, {{total}} total' },
 *   },
 *   es: {
 *     greeting: '¡Hola {{name}}!',
 *     cart: { summary: '{{count}} artículos, {{total}} total' },
 *   },
 * } as const;
 *
 * const { LocalizationProvider, useLocalize, Message } =
 *   createLocalization(translations);
 *
 * function Greeting() {
 *   const { translate } = useLocalize();
 *   //      ^? TypedTranslate<typeof translations>
 *   return <h1>{translate('greeting', { name: 'Alex' })}</h1>;
 *   //                     ^ autocompletes 'greeting' | 'cart.summary'
 * }
 *
 * function App() {
 *   return (
 *     <LocalizationProvider locale="en">
 *       <Greeting />
 *     </LocalizationProvider>
 *   );
 * }
 * ```
 */
export function createLocalization<
  const T extends Record<string, Record<string, unknown>>,
>(translations: T): TypedLocalization<T> {
  function TypedProvider({
    children,
    locale,
    disableCache,
  }: TypedLocalizationProviderProps<T>): JSX.Element {
    // `exactOptionalPropertyTypes` rejects `prop={undefined}` on an
    // optional prop, so spread only the values that are actually set.
    return (
      <LocalizationProvider
        translations={translations as unknown as Translations}
        {...(locale === undefined ? {} : { locale })}
        {...(disableCache === undefined ? {} : { disableCache })}
      >
        {children}
      </LocalizationProvider>
    );
  }

  TypedProvider.displayName = 'TypedLocalizationProvider';

  return {
    LocalizationProvider: TypedProvider,
    useLocalize: useLocalize as unknown as TypedLocalization<T>['useLocalize'],
    Message,
    RichMessage,
  };
}
