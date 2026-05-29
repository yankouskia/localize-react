import type { ReactNode } from 'react';

/**
 * A nested translation tree. Leaves are `string` (the localized text);
 * branches are nested objects keyed by the next segment of a dot-path.
 *
 * @example
 * ```ts
 * const translations: Translations = {
 *   en: { greeting: { hello: 'Hi {{name}}!' } },
 *   fr: { greeting: { hello: 'Salut {{name}} !' } },
 * };
 * ```
 */
export interface Translations {
  readonly [key: string]: string | Translations;
}

/**
 * Values to interpolate into a translation template. Keys correspond to
 * `{{placeholder}}` tokens inside the translation string.
 *
 * Numbers are coerced to their `String()` form at render time.
 */
export type TemplateValues = Readonly<Record<string, string | number>>;

/**
 * Values accepted by {@link RichMessage}-style interpolation. Each token
 * can be any `ReactNode` — a string, a number, a link, a `<strong>`, a
 * custom component, an icon — so a single translation can host inline
 * rich content without breaking the sentence apart in JSX.
 *
 * Strings and numbers are coerced via `String()` at render time, matching
 * {@link TemplateValues}. Anything else is forwarded to React verbatim.
 */
export type RichTemplateValues = Readonly<Record<string, ReactNode>>;

/**
 * Translate function returned by {@link useLocalize} and exposed on
 * {@link LocalizationContext}.
 *
 * @param descriptor    Translation key. Use dot-notation (`a.b.c`) to
 *                      walk nested {@link Translations} trees.
 * @param values        Optional interpolation values for `{{name}}`-style
 *                      mustaches inside the resolved translation.
 * @param defaultMessage Fallback used when the descriptor cannot be
 *                       resolved. If omitted, the descriptor itself is
 *                       returned (preserving v1 behaviour).
 * @returns The resolved, interpolated translation string.
 */
export type Translate = (
  descriptor: string,
  values?: TemplateValues,
  defaultMessage?: string,
) => string;

/**
 * Value carried by {@link LocalizationContext}. Available via
 * {@link useLocalize}, {@link LocalizationConsumer}, or
 * `static contextType` in class components.
 */
export interface LocalizationContextValue {
  /** Currently active locale, exactly as it was passed to the provider. */
  readonly locale: string | undefined;
  /** Translate a descriptor against the active locale. */
  readonly translate: Translate;
  /** The full translations tree, unmodified. */
  readonly translations: Translations;
}

/** Props accepted by {@link LocalizationProvider}. */
export interface LocalizationProviderProps {
  /** Provider subtree. */
  readonly children?: ReactNode;
  /**
   * Locale to look up inside {@link Translations}. If omitted, the
   * `translations` object is treated as the flat translation map.
   *
   * Resolution order: exact match → `lower_case_with_underscores` →
   * leading segment (`en_us` → `en`). A warning is logged if none match.
   */
  readonly locale?: string;
  /** Translation tree (per-locale or flat). Required. */
  readonly translations: Translations;
  /**
   * Disable the internal LRU-free memo cache. Useful in dev when
   * mutating translation objects in place. Defaults to `false`.
   */
  readonly disableCache?: boolean;
}

/** Props accepted by {@link Message}. */
export interface MessageProps {
  /** Translation key — see {@link Translate}. */
  readonly descriptor: string;
  /** Interpolation values for `{{placeholder}}` tokens. */
  readonly values?: TemplateValues;
  /** Fallback string when `descriptor` cannot be resolved. */
  readonly defaultMessage?: string;
}

/** Props accepted by {@link RichMessage}. */
export interface RichMessageProps {
  /** Translation key — see {@link Translate}. */
  readonly descriptor: string;
  /**
   * Interpolation values for `{{placeholder}}` tokens. Each value may be
   * a string/number (rendered as text) or any `ReactNode` (embedded as
   * inline rich content).
   */
  readonly values?: RichTemplateValues;
  /** Fallback string when `descriptor` cannot be resolved. */
  readonly defaultMessage?: string;
}
