import { Fragment } from 'react';
import type { ReactNode } from 'react';

import { NO_TEMPLATE_VALUE_MESSAGE } from './helpers.js';
import type { RichMessageProps, RichTemplateValues } from './types.js';
import { useLocalize } from './use-localize.js';

/**
 * Pattern matching `{{name}}`-style mustaches, with the token name as the
 * capture group. Mirrors {@link helpers.PARSE_TEMPLATE_REGEXP} so the
 * rich and string-only paths agree on what counts as a placeholder.
 */
const SPLIT_REGEX = /\{\{([^{}]+)\}\}/g;

/**
 * Walk {@link template} and replace each `{{placeholder}}` with the
 * matching value from {@link values}. String/number values are coerced
 * via `String()`; any other value is passed through as-is, so callers
 * can pass `ReactNode` (links, components, icons, etc.) and have them
 * appear inline inside the translated sentence.
 *
 * The returned array can be embedded directly inside JSX — every entry
 * is text or a `ReactNode` and React handles arrays of children
 * natively. Use the {@link RichMessage} component for the common case;
 * reach for this helper when you want the parts before they're wrapped
 * in a fragment (e.g., joining with a separator or splitting across DOM
 * boundaries).
 */
export function buildRichTranslation(
  template: string,
  values: RichTemplateValues,
): readonly ReactNode[] {
  if (Object.keys(values).length === 0) return [template];

  // `String#split` with a capturing global regex yields an alternating
  // array of literal text and captured token names: even indices are
  // text, odd indices are token names. This is the simplest one-pass
  // way to splice rich content into a templated string.
  const parts = template.split(SPLIT_REGEX);
  return parts.map((part, index) => {
    if (index % 2 === 0) return part;
    if (Object.hasOwn(values, part)) {
      const value = values[part];
      return typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : value;
    }
    // Mirror the string-only `<Message />` path so a translator-introduced
    // placeholder that callers forget to wire up surfaces during dev.
    console.warn(NO_TEMPLATE_VALUE_MESSAGE, `{{${part}}}`);
    return `{{${part}}}`;
  });
}

/**
 * Render a translated string by descriptor, allowing `{{token}}` values
 * to be React nodes (links, `<strong>`, components, icons, …) instead of
 * just strings. The output is a `ReactNode` — usually a fragment of
 * interleaved text and JSX — so a single translation can host inline
 * rich content without having to be split across multiple elements.
 *
 * Compared with {@link Message}:
 *
 * - {@link Message} returns `string` and only interpolates string/number
 *   values. Use it when the translated text is a flat string.
 * - `RichMessage` returns `ReactNode` and accepts `string | number | ReactNode`
 *   values. Use it when the translation needs to wrap a piece of the
 *   sentence in markup (a link, a button, a formatter), and you want the
 *   word order to be decided by the translator instead of the JSX tree.
 *
 * @example
 * ```tsx
 * // en: "By signing up, you agree to our {{link}}."
 * // de: "Mit der Anmeldung stimmen Sie unseren {{link}} zu."
 *
 * <RichMessage
 *   descriptor="signup.terms"
 *   values={{ link: <a href="/terms">Terms of Service</a> }}
 * />
 * ```
 */
export function RichMessage({
  descriptor,
  values,
  defaultMessage,
}: RichMessageProps): ReactNode {
  const { translate } = useLocalize();
  const template = translate(descriptor, undefined, defaultMessage);
  if (!values || Object.keys(values).length === 0) return template;

  // Each part lives in its own `Fragment` so React doesn't complain
  // about duplicate keys when the same node is interpolated twice (or
  // when the surrounding text fragments share text content).
  return buildRichTranslation(template, values).map((part, index) => (
    <Fragment key={index}>{part}</Fragment>
  ));
}
