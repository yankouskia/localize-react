import type { TemplateValues, Translations } from './types.js';

/** Warning logged when no locale entry matches the requested locale. */
export const NO_TRANSLATION_WARNING_MESSAGE =
  '[LOCALIZE-REACT]: There are no translations for specified locale';

/** Warning logged when a `{{placeholder}}` has no matching value. */
export const NO_TEMPLATE_VALUE_MESSAGE =
  '[LOCALIZE-REACT] Looks like template is being used, but no value passed for ';

/**
 * Pattern matching `{{name}}`-style mustaches. Anchored to avoid
 * consuming adjacent braces (`{{{a}}}` only matches `{{a}}`).
 */
export const PARSE_TEMPLATE_REGEXP = /\{\{([^{}]+)\}\}/g;

/**
 * Module-scoped translation cache. Kept module-scoped (rather than
 * provider-scoped) for behavioural parity with v1.x; see ADR-008.
 */
let translationCache: Record<string, string> = Object.create(null) as Record<
  string,
  string
>;

/**
 * Normalize a locale string against the available translation keys.
 *
 * - Returns `null` if no locale was supplied.
 * - Returns the input as-is if `translations[locale]` is an object.
 * - Lowercases and replaces dashes with underscores, then retries.
 * - Falls back to the leading segment (`en_us` → `en`).
 * - If nothing matches, logs a warning and returns the original input.
 */
export function sanitizeLocale(
  locale: string | undefined,
  translations: Translations,
): string | null {
  if (!locale) return null;

  if (typeof translations[locale] === 'object') return locale;

  const normalized = locale.toLowerCase().replaceAll('-', '_');
  if (typeof translations[normalized] === 'object') return normalized;

  const short = normalized.split('_')[0];
  if (short && typeof translations[short] === 'object') return short;

  // eslint-disable-next-line no-console -- public, documented warning.
  console.warn(NO_TRANSLATION_WARNING_MESSAGE, locale);
  return locale;
}

/**
 * Returns a memoizing wrapper around {@link fn}. The cache key combines
 * the descriptor, the JSON-serialized values, and the default message.
 */
export function memoize<
  F extends (
    descriptor: string,
    values?: TemplateValues,
    defaultMessage?: string,
  ) => string,
>(fn: F): F {
  const memoized = (
    descriptor: string,
    values?: TemplateValues,
    defaultMessage = '',
  ): string => {
    const cacheKey = values
      ? JSON.stringify(values) + descriptor + defaultMessage
      : descriptor + defaultMessage;

    const cached = translationCache[cacheKey];
    if (cached !== undefined) return cached;

    const output = fn(descriptor, values, defaultMessage);
    translationCache[cacheKey] = output;
    return output;
  };

  return memoized as F;
}

/** Reset the module-level translation cache. */
export function clearCache(): void {
  translationCache = Object.create(null) as Record<string, string>;
}

/**
 * Pair each `{{key}}` template token with the matching value from
 * {@link values}. Tokens with no value are paired with themselves and
 * logged.
 */
export function transformToPairs(
  templates: readonly string[],
  values: TemplateValues,
): Array<readonly [string, string | number]> {
  return templates.map((token) => {
    const placeholderKey = token.slice(2, -2);
    if (Object.hasOwn(values, placeholderKey)) {
      return [token, values[placeholderKey]!] as const;
    }
    // eslint-disable-next-line no-console -- public, documented warning.
    console.warn(NO_TEMPLATE_VALUE_MESSAGE, token);
    return [token, token] as const;
  });
}

/**
 * Replace every `{{placeholder}}` token in {@link source} with its
 * corresponding entry from {@link values}. Uses literal string
 * replacement (not `new RegExp(token)`) so values containing regex
 * meta-characters are safe — see MIGRATION_PLAN.md risk R4.
 */
export function buildTranslation(
  source: string,
  values?: TemplateValues,
): string {
  if (!values) return source;
  if (Object.keys(values).length === 0) return source;

  const templates = source.match(PARSE_TEMPLATE_REGEXP);
  if (!templates || templates.length === 0) return source;

  const pairs = transformToPairs(templates, values);

  return pairs.reduce<string>(
    (result, [token, value]) => result.replaceAll(token, String(value)),
    source,
  );
}
