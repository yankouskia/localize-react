import type { MessageProps } from './types.js';
import { useLocalize } from './use-localize.js';

/**
 * Render a translated string by descriptor.
 *
 * Equivalent to inlining `useLocalize().translate(descriptor, values,
 * defaultMessage)`. Use this when you want a component instead of a
 * hook call (e.g. inside `<button title={...} />` is not possible, but
 * `<button title="..."><Message .../></button>` reads fine in JSX).
 *
 * @example
 * ```tsx
 * <Message descriptor="greeting.hello" values={{ name: 'Alex' }} />
 * ```
 */
export function Message({
  defaultMessage,
  descriptor,
  values,
}: MessageProps): string {
  const { translate } = useLocalize();
  return translate(descriptor, values, defaultMessage);
}
